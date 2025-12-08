"use client"
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Bot, User, ChevronRight } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! 👋 I\'m your Soloistanjali AI Assistant. How can I help you today?'
    }
  ]);
  const [showQuestions, setShowQuestions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Predefined Q&A pairs
  const qaDatabase = {
    "How do I purchase a course?": `**Step-by-step Course Purchase Guide:**

1️⃣ Browse MARKETPLACE from the top menu
2️⃣ Use filters to find courses (instrument, level)
3️⃣ Click on a course card to view details
4️⃣ Click "Purchase" button
5️⃣ Login/Register if not already logged in
6️⃣ Complete payment via secure Razorpay
7️⃣ Access your course from Dashboard → "Your Purchased Courses"

💳 **Payment:** We accept all major payment methods through Razorpay (cards, UPI, net banking)

📥 **Download:** After purchase, download PDF materials from your Dashboard anytime!`,

    "How to register for workshops?": `**Workshop Registration Steps:**

1️⃣ Click WORKSHOPS in the navigation menu
2️⃣ Browse available upcoming workshops
3️⃣ Click "Register Now" on your chosen workshop
4️⃣ Fill the registration form:
   • Phone number (required)
   • Additional info (optional)
5️⃣ Complete payment via Razorpay
6️⃣ Receive confirmation email with workshop link
7️⃣ Join workshop from email link or Dashboard

⏰ **Important:** Join 5 minutes before the scheduled time!

📧 **Email:** Check your inbox for workshop details and joining instructions.`,

    "What courses are available?": `**Available Courses at Soloistanjali:**

🎹 **Piano Courses:**
• Beginner Piano Fundamentals
• Intermediate Piano Techniques
• Advanced Piano Performance

🎸 **Other Instruments:**
• Guitar (Beginner to Advanced)
• Cello & Violin
• Drums & Vocals

📚 **Additional Learning:**
• Music Theory
• Ear Training
• Sheet Music Collections
• Music Production Basics

**Levels:** Beginner | Intermediate | Advanced

🛍️ **Browse All:** Visit MARKETPLACE to see full catalog with pricing and details!`,

    "How can I contact you?": `**Contact Soloistanjali:**

📧 **Email Support:**
support@soloistanjali.com

📝 **Contact Form:**
Scroll to "Connect With Us" on homepage and fill the form. We respond within 24-48 hours!

📱 **Social Media:**
• 📸 Instagram: @soloistanjali
• 🧵 Threads: @soloistanjali  
• 🎥 YouTube: Piano-gym

💬 **Response Time:** We typically respond within 1-2 business days.

**Note:** For urgent issues, use the contact form with detailed information!`,

    "What are the course prices?": `**Pricing Information:**

💰 **Courses:**
• Beginner Level: ₹299 - ₹999
• Intermediate Level: ₹799 - ₹1,999
• Advanced Level: ₹1,499 - ₹2,999
• Sheet Music: ₹99 - ₹499

🎪 **Workshops:**
• Typically range from ₹299 - ₹1,499
• Duration: 90-120 minutes
• Live interactive sessions

✅ **One-Time Payment:** All courses are one-time purchases with lifetime access to materials!

🎁 **Value:** High-quality PDFs, expert instruction, and ongoing support.

*Prices may vary by course complexity and content.*`,

    "Do I need prior music experience?": `**Experience Requirements:**

🎵 **For Beginners:**
✅ NO prior experience needed!
✅ Start from absolute basics
✅ Step-by-step guidance
✅ Beginner-friendly courses available

🎹 **What You Need:**
• A keyboard or piano (88-key ideal, 61/49-key works for starting)
• Willingness to practice regularly
• No musical background required!

👥 **For All Ages:**
• Kids can start
• Adults welcome (never too late!)
• Working professionals (flexible schedule)
• Seniors encouraged

⏰ **Practice Time:** 10-12 hours can get you playing simple songs!

**Start your musical journey today - no experience necessary! 🎶**`,

    "Are workshops recorded?": `**Workshop Recording Policy:**

📹 **Recording Availability:**
• Some workshops are recorded
• Check individual workshop details
• Recording access varies by workshop

⚡ **Live Sessions:**
• Most workshops are LIVE interactive
• Real-time Q&A with instructor
• Hands-on practice sessions

📧 **Check Details:**
• Workshop description specifies if recorded
• Email confirmation includes access info
• Dashboard shows recording availability

💡 **Best Experience:** Join LIVE for maximum interaction and learning!

*Contact us for specific workshop recording information.*`,

    "Can I get a refund?": `**Refund Policy:**

✅ **Course Refunds:**
• 7-day money-back guarantee
• Valid if you haven't downloaded materials
• Contact support@soloistanjali.com

🎪 **Workshop Refunds:**
• Refund available up to 48 hours before workshop
• After 48 hours: Credit note for future workshops
• No refund after workshop completion

📧 **Request Process:**
1. Email support with order details
2. Reason for refund
3. Processing time: 5-7 business days

⚠️ **Non-refundable:**
• Downloaded course materials
• Workshop within 48 hours
• Already attended workshops

*All refunds subject to terms and conditions.*`,

    "How to access purchased courses?": `**Accessing Your Courses:**

📥 **Step-by-Step:**

1️⃣ Login to your account
2️⃣ Click on DASHBOARD in the top menu
3️⃣ Scroll to "Your Purchased Courses"
4️⃣ Find your course
5️⃣ Click "Download PDF" button
6️⃣ PDF saves to your device's download folder

💾 **Storage:**
• Keep PDFs safe on your device
• No download limit - access anytime
• Works offline once downloaded

🔄 **Re-download:**
• Lost your file? No problem!
• Login and download again from Dashboard
• Lifetime access guaranteed

🆘 **Issues?** Contact support@soloistanjali.com`,

    "What payment methods do you accept?": `**Accepted Payment Methods:**

💳 **Via Razorpay (Secure):**

✅ **Credit/Debit Cards:**
• Visa, Mastercard, RuPay
• American Express

✅ **UPI:**
• Google Pay
• PhonePe
• Paytm
• Any UPI app

✅ **Net Banking:**
• All major Indian banks

✅ **Wallets:**
• Paytm Wallet
• Mobikwik
• Other popular wallets

🔒 **Security:**
• 256-bit SSL encryption
• PCI DSS compliant
• No card details stored

💯 **Safe & Secure:** Your payment information is completely protected!`
  };

  const questions = Object.keys(qaDatabase);

  const handleQuestionClick = (question) => {
    setShowQuestions(false);
    
    // Add user question
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: question 
    }]);

    // Add assistant response after a short delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: qaDatabase[question]
      }]);
      
      // Show "Ask more?" after response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '**Would you like to ask anything else?**'
        }]);
        setShowQuestions(true);
      }, 500);
    }, 800);
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hi! 👋 I\'m your Soloistanjali AI Assistant. How can I help you today?'
      }
    ]);
    setShowQuestions(true);
  };

  return (
    <>
      {/* Chat Button - Responsive */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse font-bold">
            AI
          </span>
        </button>
      )}

      {/* Chat Window - Fully Responsive */}
      {isOpen && (
        <div className="fixed inset-4 sm:bottom-6 sm:right-6 sm:inset-auto z-50 sm:w-[400px] sm:h-[550px] md:w-[420px] md:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border-2 border-blue-200 animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg truncate">MuskyAI</h3>
                <p className="text-[10px] sm:text-xs text-blue-100 truncate">Soloistanjali Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 sm:p-2 rounded-full transition flex-shrink-0"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50 min-h-0">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                    : 'bg-gradient-to-r from-green-500 to-teal-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-2.5 sm:p-3 rounded-2xl shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Questions Section - Responsive */}
          {showQuestions && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-t border-gray-200 flex-shrink-0 max-h-[45%] overflow-y-auto">
              <p className="text-[10px] sm:text-xs text-gray-600 mb-2 font-medium">Select a question:</p>
              <div className="space-y-1.5 sm:space-y-2">
                {questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    className="w-full text-left text-[11px] sm:text-xs bg-white text-blue-700 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition flex items-center justify-between gap-2 group"
                  >
                    <span className="line-clamp-2">{question}</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 group-hover:text-blue-600 transition flex-shrink-0" />
                  </button>
                ))}
              </div>
              
              {messages.length > 1 && (
                <button
                  onClick={handleReset}
                  className="w-full mt-2 sm:mt-3 text-[11px] sm:text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg hover:shadow-lg transition font-medium"
                >
                  🔄 Start Over
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-2 sm:p-3 border-t border-gray-200 bg-white rounded-b-2xl flex-shrink-0">
            <p className="text-[10px] sm:text-xs text-gray-500 text-center">
              Powered by Soloistanjali AI
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AIAssistant;