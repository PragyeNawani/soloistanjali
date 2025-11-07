'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import WorkshopCard from '@/components/WorkshopCard';
import WorkshopRegistrationModal from '@/components/WorkshopRegistrationModal';
import { Progressbar } from '@/components/ProgressBar';

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [registeredWorkshopIds, setRegisteredWorkshopIds] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentTrigger, setPaymentTrigger] = useState(0); // New state to trigger payment
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Get current date and time
      const now = new Date();

      // Fetch workshops that are upcoming
      const { data: workshopsData, error: workshopsError } = await supabase
        .from('workshops')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true });

      if (workshopsError) throw workshopsError;

      // Filter out workshops that have already passed
      const filteredWorkshops = (workshopsData || []).filter((workshop) => {
        // Parse the workshop date (which should be a full ISO timestamp)
        const workshopDateTime = new Date(workshop.date);
        
        // Only show workshops where datetime is in the future
        return workshopDateTime > now;
      });

      console.log('Filtered workshops:', filteredWorkshops); // Debug log

      setWorkshops(filteredWorkshops);

      // Fetch user's registrations if logged in
      if (session?.user) {
        const { data: registrationsData, error: registrationsError } =
          await supabase
            .from('workshop_registrations')
            .select('workshop_id')
            .eq('user_id', session.user.id)
            .eq('status', 'completed');

        if (registrationsError) throw registrationsError;
        setRegisteredWorkshopIds(
          registrationsData.map((r) => r.workshop_id) || []
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (workshop) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedWorkshop(workshop);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = async (formData) => {
    setRegistrationData(formData);
    setShowRegistrationModal(false);
    // Trigger payment by incrementing counter
    setPaymentTrigger(prev => prev + 1);
  };
  
  const handlePaymentSuccess = () => {
    setRegistrationData(null);
    setSelectedWorkshop(null);
    alert(
      'Registration successful! Check your email for workshop details and link.'
    );
    fetchData(); // Refresh data
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Razorpay SDK failed to load. Please refresh and try again.');
        setRegistrationData(null);
        setSelectedWorkshop(null);
        return;
      }

      // Create order
      const response = await fetch('/api/workshops/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: selectedWorkshop.id,
          phone: registrationData.phone,
          additionalInfo: registrationData.additionalInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      console.log('Order created:', data.orderId);

      // Razorpay options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'CHORDS Studio',
        description: `Workshop: ${selectedWorkshop.title}`,
        handler: async function (response) {
          console.log('Payment successful:', response);
          
          try {
            const verifyResponse = await fetch(
              '/api/workshops/verify-payment',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();
            console.log('Verification response:', verifyData);

            if (verifyResponse.ok) {
              handlePaymentSuccess();
            } else {
              alert('Payment verification failed: ' + verifyData.error);
              console.error('Verification failed:', verifyData);
              // Reset states so user can retry
              setRegistrationData(null);
              setSelectedWorkshop(null);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification error: ' + error.message);
            // Reset states so user can retry
            setRegistrationData(null);
            setSelectedWorkshop(null);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed by user');
            // Reset states when user closes the modal
            setRegistrationData(null);
            setSelectedWorkshop(null);
          }
        },
        prefill: {
          name: user?.user_metadata?.name || '',
          email: user?.email || '',
          contact: registrationData.phone,
        },
        theme: {
          color: '#2563eb',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert('Payment failed: ' + response.error.description);
        // Reset states so user can retry
        setRegistrationData(null);
        setSelectedWorkshop(null);
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
      // Reset states on error
      setRegistrationData(null);
      setSelectedWorkshop(null);
    }
  };

  // Trigger payment when paymentTrigger changes
  useEffect(() => {
    if (paymentTrigger > 0 && registrationData && selectedWorkshop) {
      handlePayment();
    }
  }, [paymentTrigger]);

  if (loading) {
    return (
      <>
        <Progressbar/>
      </>
    );
  }

  return (
    <div className="min-h-screen pb-16">
        <div className="bg-gradient-to-l from-gray-950 to-blue-950  pt-24 pb-10 mb-10">
          <h1 className="text-5xl text-center font-serif text-white mb-4">
            Upcoming Workshops
          </h1>
          <p className="text-blue-300 max-w-2xl mx-auto">
            Join our expert instructors for intensive hands-on workshops. Learn
            new techniques, connect with fellow musicians, and take your skills
            to the next level.
          </p>
        </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {workshops.length === 0 ? (
          <div className="bg-gradient-to-br from-[#0B1C3E] to-[#061831] rounded-lg shadow-2xl p-12 text-center border border-blue-900/30">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-serif text-white mb-4">
              No Upcoming Workshops
            </h3>
            <p className="text-blue-300">
              Check back soon for new workshop announcements!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                onRegister={handleRegister}
                isRegistered={registeredWorkshopIds.includes(workshop.id)}
              />
            ))}
          </div>
        )}

        {showRegistrationModal && selectedWorkshop && (
          <WorkshopRegistrationModal
            workshop={selectedWorkshop}
            onClose={() => setShowRegistrationModal(false)}
            onSubmit={handleRegistrationSubmit}
          />
        )}
      </div>
    </div>
  );
}