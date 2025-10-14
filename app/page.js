'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Music, Play, Check } from 'lucide-react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail('');
    setName('');
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
            // transform: `translateY(${scrollY * 0.5}px)`,
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
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-gray-800 to-transparent z-30"></div>
      </div>

      {/* Band Members Section */}
      <div className="bg-gray-950 py-20 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif text-white text-center mb-16">
            About Us
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Дмитрий Кулешов', role: 'Гитара', description: 'Лидер группы и основатель' },
              { name: 'Артем Морозовский', role: 'Бас', description: 'Ритм-секция группы' },
              { name: 'Александр Кулинский', role: 'Скрипка', description: 'Драма, красота и мелодия' },
              { name: 'Дмитрий Ассев', role: 'Барабаны', description: 'Энергия и драйв' },
            ].map((member, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-b from-blue-900/20 to-gray-900/40 rounded-lg overflow-hidden border border-blue-800/30 hover:border-blue-600/50 transition mb-4 aspect-square flex items-center justify-center">
                  <div className="text-6xl">🎤</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-blue-400 text-sm font-medium mb-2">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.description}</p>
              </div>
            ))}
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

      {/* Contact Section */}
      <div className="bg-gradient-to-b from-gray-950 to-blue-950/30 py-20 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif text-white">
                КОНТАКТЫ
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">EMAIL</p>
                  <p className="text-white font-semibold">contact@rrbb.com</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">ТЕЛЕФОН</p>
                  <p className="text-white font-semibold">+7 (999) 999-99-99</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">СОЦИАЛЬНЫЕ СЕТИ</p>
                  <div className="flex space-x-4 mt-2">
                    <span className="text-2xl hover:text-blue-400 transition cursor-pointer">f</span>
                    <span className="text-2xl hover:text-blue-400 transition cursor-pointer">🐦</span>
                    <span className="text-2xl hover:text-blue-400 transition cursor-pointer">📷</span>
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