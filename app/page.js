'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Music, Play, Check, Youtube, Instagram, Facebook, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail('');
    setName('');
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError('');
    
    try {
      const response = await fetch('https://getform.io/f/bejerkwa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      });

      if (response.ok) {
        setContactSuccess(true);
        setContactForm({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        setTimeout(() => setContactSuccess(false), 5000);
      } else {
        setContactError('Something went wrong. Please try again.');
      }
    } catch (error) {
      setContactError('Failed to send message. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section with Piano Background */}
      <div className="relative h-screen bg-gray-950 overflow-hidden">
        {/* Fixed Background Image with Parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/piano.jpeg)',
            backgroundAttachment: 'fixed',
          }}
        >
        </div>

        <div className="relative h-full flex z-20">
          {/* Content overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-oxblu5 via-oxblu1 to-oxblu5"></div>
          <div className="text-center space-y-8 z-30 relative mt-[250px] mb-auto ml-[250px] mr-auto">
            <div className="space-y-4">
              <h3 className='text-white md:text-3xl font-bold'>Play The <span className='text-blue-700'>Songs You Love</span></h3>
              <h1 className="text-6xl md:text-7xl font-serif text-white leading-tight tracking-tight">
                CHORDS STUDIO
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600">EVERYTHING YOU NEED</span>
              </h1>
            </div>

            <div className="text-gray-50 text-lg max-w-2xl mx-auto leading-relaxed flex justify-between">
              <div className='flex items-center gap-1'><Check className='text-red-600' /><span>Great Teaching</span></div>
              <div className='flex items-center gap-1'><Check className='text-red-600' /><span>Downloadable PDFs</span></div>
              <div className='flex items-center gap-1'><Check className='text-red-600' /><span>Workshops</span></div>
              <div className='flex items-center gap-1'><Check className='text-red-600' /><span>Blogs</span></div>
            </div>
            <div className="flex justify-center">
              <button className="group flex items-center space-x-3 bg-transparent border-2 border-blue-400 text-blue-400 px-8 py-4 text-sm font-medium hover:bg-blue-400 hover:text-gray-950 transition duration-300 rounded-xl">
                <Play className="w-5 h-5 group-hover:scale-110 transition" />
                <span>Play Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-950 to-transparent z-30"></div>
      </div>

      {/* Band Members Section */}
      <div className="bg-gray-950 py-20 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold font-serif text-white text-center mb-16">
            About Us
          </h1>
          <div className='text-blue-200'>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iusto commodi quam quaerat minus, cum nam in, veritatis architecto temporibus optio reiciendis dignissimos provident, sint quo. Blanditiis, quidem quas, consectetur exercitationem quibusdam incidunt cum aperiam debitis architecto fugiat quisquam perspiciatis ipsa natus distinctio tempore corporis voluptatem! Quos excepturi temporibus id veniam?Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod ipsa iste modi eius nihil blanditiis molestias est officiis error aperiam eaque numquam quas ipsum, dolorum doloribus sequi expedita voluptas eum officia id voluptates, vel doloremque, accusamus dolorem! Doloribus dolores culpa incidunt aperiam dicta corrupti aliquid voluptatum mollitia hic ratione enim, rerum dignissimos at similique aliquam magnam architecto, neque consequatur sed eius reiciendis ea eligendi qui! Voluptatum debitis eum iste enim est modi vero dolorum omnis nam veritatis delectus pariatur ut iusto cumque, dolorem, et dolores officiis soluta quibusdam accusamus assumenda rerum! Libero doloremque numquam quod ullam ipsam repudiandae voluptas distinctio.
          </div>
          <div className='flex gap-5 items-center mt-6'>
            <Instagram className='text-pink-500' />
            <Youtube className='text-red-500'/>
            <Facebook className='text-blue-500'/>
          </div>
        </div>
      </div>

      {/* Album/Latest Release Section */}
      <div className="bg-gradient-to-b from-gray-950 to-blue-950/30 py-20 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 rounded-lg shadow-2xl border border-red-500 aspect-square flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-8xl">🎵</div>
                  <p className="text-white font-bold text-2xl">РРBB</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-serif text-white">
                АЛЬБОМ РРBB
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Наш последний альбом - это синтез традиционной русской музыки и аутентичного блюграсса. Каждая композиция рассказывает историю, каждый инструмент поет.
              </p>
              <p className="text-gray-400 text-sm">
                Слушайте на всех платформах потокового аудио
              </p>

              <div className="flex space-x-4 pt-4">
                <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium">
                  <span>🎵</span>
                  <span>SPOTIFY</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition text-sm font-medium border border-gray-700">
                  <span>🎶</span>
                  <span>APPLE MUSIC</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-gray-950 py-20 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif text-white text-center mb-12">
            МОМЕНТЫ
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-gradient-to-br from-blue-900/30 to-gray-900/50 rounded-lg overflow-hidden border border-blue-800/30 hover:border-blue-600/50 transition aspect-square flex items-center justify-center group cursor-pointer">
                <div className="text-5xl group-hover:scale-110 transition">📷</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Concerts & Events Section */}
      <div className="bg-gradient-to-b from-gray-950 to-blue-950/30 py-20 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif text-white text-center mb-4">
            РРBB В КОНЦЕРТАХ
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Присоединяйтесь к нам в прямых эфирах и концертах по всей стране
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-6 rounded-lg border border-blue-800/30 hover:border-blue-600/50 transition">
              <div className="text-5xl mb-4">🎸</div>
              <h3 className="text-xl font-serif text-white mb-2">LIVE PERFORMANCES</h3>
              <p className="text-gray-400 text-sm">
                Высокоэнергичные концерты с участием профессиональных музыкантов
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-6 rounded-lg border border-blue-800/30 hover:border-blue-600/50 transition">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-serif text-white mb-2">WORLD TOURS</h3>
              <p className="text-gray-400 text-sm">
                Путешествуем по миру, принося нашу музыку в каждый уголок
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-6 rounded-lg border border-blue-800/30 hover:border-blue-600/50 transition">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-serif text-white mb-2">LIVE STREAMS</h3>
              <p className="text-gray-400 text-sm">
                Смотрите наши выступления в прямом эфире из любого места
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/workshops"
              className="inline-block bg-blue-600 text-white px-8 py-3 text-sm font-medium rounded hover:bg-blue-700 transition border border-blue-500"
            >
              View Upcoming Events
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-950 py-20 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif text-white text-center mb-12">
            О НАС ГОВОРЯТ
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-8 rounded-lg border border-blue-800/30">
              <div className="flex mb-4">
                <span className="text-red-400 text-lg">"</span>
              </div>
              <p className="text-gray-300 mb-4">
                Сердечная, веселая, высокопрофессиональная работа. Первое место достойно занимает РРBB!
              </p>
              <p className="text-blue-400 font-semibold">Сергей Морозов</p>
              <p className="text-gray-500 text-sm">Музыкальный критик</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-8 rounded-lg border border-blue-800/30">
              <div className="flex mb-4">
                <span className="text-red-400 text-lg">"</span>
              </div>
              <p className="text-gray-300 mb-4">
                Very interesting music! Like classic, like country... Feeling to it soul!
              </p>
              <p className="text-blue-400 font-semibold">Simon Nakamura</p>
              <p className="text-gray-500 text-sm">Music Producer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-gradient-to-b from-gray-950 to-blue-950/30 py-20 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif text-white mb-4">
              GET IN TOUCH
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Have a question or want to work together? Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-8 rounded-lg border border-blue-800/30">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="flex items-center text-gray-300 text-sm mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-blue-700/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="flex items-center text-gray-300 text-sm mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-blue-700/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="flex items-center text-gray-300 text-sm mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-blue-700/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="flex items-center text-gray-300 text-sm mb-2">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    rows="5"
                    className="w-full px-4 py-3 bg-gray-900 border border-blue-700/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                    placeholder="Tell us about your inquiry..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-3 text-sm font-medium rounded hover:bg-blue-700 transition duration-300 border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {contactSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

                {contactSuccess && (
                  <div className="p-4 bg-green-900/30 border border-green-500/50 rounded text-green-400 text-sm text-center">
                    ✓ Thank you! Your message has been sent successfully.
                  </div>
                )}

                {contactError && (
                  <div className="p-4 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm text-center">
                    {contactError}
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-6 rounded-lg border border-blue-800/30">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600/20 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <p className="text-gray-400 text-sm">contact@rrbb.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-6 rounded-lg border border-blue-800/30">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600/20 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <p className="text-gray-400 text-sm">+7 (999) 999-99-99</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-6 rounded-lg border border-blue-800/30">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600/20 p-3 rounded-lg">
                    <Music className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Social Media</h3>
                    <div className="flex space-x-4 mt-3">
                      <Instagram className="w-5 h-5 text-pink-400 hover:text-pink-300 cursor-pointer transition" />
                      <Youtube className="w-5 h-5 text-red-400 hover:text-red-300 cursor-pointer transition" />
                      <Facebook className="w-5 h-5 text-blue-400 hover:text-blue-300 cursor-pointer transition" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 p-8 rounded-lg border border-blue-800/30 flex items-center justify-center aspect-square">
                <div className="text-9xl">🎸</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-950 py-16 border-t border-blue-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif text-white mb-4">
            БУДЬТЕ В КУРСЕ
          </h2>
          <p className="text-gray-400 mb-8">
            Подпишитесь на нашу рассылку для получения последних новостей, концертов и эксклюзивных предложений
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
          >
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-6 py-3 border border-blue-700 bg-gray-900 text-white placeholder-gray-500 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-3 border border-blue-700 bg-gray-900 text-white placeholder-gray-500 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 text-sm font-medium hover:bg-blue-700 transition duration-300 rounded border border-blue-500"
            >
              SIGN UP
            </button>
          </form>
          {subscribed && (
            <p className="text-green-400 mt-4 font-medium">
              Спасибо за подписку!
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-950 border-t border-blue-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Real Russian Bluegrass Band. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}