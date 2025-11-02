'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function PaymentModal({ course, onClose, onSuccess }) {
  const [processing, setProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Suppress Razorpay SVG console errors
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args[0]?.includes?.('attribute height') || args[0]?.includes?.('Expected length')) {
          return; // Suppress SVG attribute errors from Razorpay
        }
        originalConsoleError.apply(console, args);
      };

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        // Restore original console.error after a delay
        setTimeout(() => {
          console.error = originalConsoleError;
        }, 1000);
        resolve(true);
      };
      script.onerror = () => {
        console.error = originalConsoleError;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Razorpay SDK failed to load. Please check your connection.');
        setProcessing(false);
        return;
      }

      // Create order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Store order ID for failure handling
      const currentOrderId = data.orderId;

      // Razorpay options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'CHORDS Studio',
        description: course.title,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              onSuccess();
            } else {
              alert('Payment verification failed: ' + verifyData.error);
            }
          } catch (error) {
            alert('Payment verification error: ' + error.message);
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: async function () {
            // User closed the payment modal without completing payment
            setProcessing(false);
            try {
              await fetch('/api/payment/failure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: currentOrderId,
                  error_description: 'Payment cancelled by user',
                }),
              });
            } catch (error) {
              console.error('Error recording payment cancellation:', error);
            }
          },
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#78350f',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', async function (response) {
        setProcessing(false);
        alert('Payment failed: ' + response.error.description);
        
        // Record payment failure
        try {
          await fetch('/api/payment/failure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: currentOrderId,
              error_description: response.error.description,
            }),
          });
        } catch (error) {
          console.error('Error recording payment failure:', error);
        }
      });
    } catch (error) {
      alert('Error: ' + error.message);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-serif text-amber-900 mb-4">
          Complete Purchase
        </h2>
        <div className="space-y-4 mb-6">
          <p className="text-amber-700">
            Course: <strong>{course.title}</strong>
          </p>
          <p className="text-2xl font-bold text-amber-900">
            Amount: ₹{course.price}
          </p>
          <div className="bg-amber-50 p-4 rounded">
            <p className="text-sm text-amber-700 mb-2">
              🔒 Secure Payment via Razorpay
            </p>
            <p className="text-xs text-amber-600">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handlePayment}
            disabled={processing}
            className="flex-1 bg-amber-900 text-white px-6 py-3 text-sm font-medium rounded hover:bg-amber-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 text-sm font-medium rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}