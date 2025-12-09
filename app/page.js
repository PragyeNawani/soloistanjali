"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Instagram, Facebook, Youtube, Calendar, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useNavContext } from '@/Context/context';
import Typewriter from "typewriter-effect";
import Link from 'next/link';
export default function ChordsStudioPage() {
  const { navani, setNavani } = useNavContext();
  const navref = useRef();
  const [isLaunching, setIsLaunching] = useState(false);
  const handleScrollTop = () => {
    setIsLaunching(true); // start animation
    window.scrollTo({
      top: 0,
      behavior: "smooth", // smooth animation
    });
    // After animation ends, reset the state
    setTimeout(() => setIsLaunching(false), 1000);
  };
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [latestItems, setLatestItems] = useState({
    blog: null,
    course: null,
    workshop: null
  });
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(-1);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    goal: '',
    message: ''
  });
  const testimonials = [
    { name: "Alex Santos", text: "The lessons are well-structured and easy to follow. I've learned so much in just a few months!", firstname: "Alex" },
    { name: "Sara Jones", text: "Amazing instructors and great community. Highly recommend for anyone wanting to learn music!", firstname: "Sara" },
    { name: "Chris Martin", text: "Best decision I made was joining Soloistanjali. The progress I've made is incredible!", firstname: "Chris" },
    { name: "Emma Wilson", text: "Professional teachers, flexible schedule, and excellent learning materials. 5 stars!", firstname: "Emma" },
    { name: "Mike Chen", text: "From beginner to intermediate in 6 months. The structured approach really works!", firstname: "Mike" },
    { name: "Lisa Brown", text: "Great platform for learning music at your own pace. Very satisfied with my progress!", firstname: "Lisa" },
    { name: "John Davis", text: "Outstanding music program with dedicated teachers who truly care about student progress!", firstname: "John" },
    { name: "Maria Garcia", text: "Flexible scheduling and personalized attention made learning music enjoyable and effective!", firstname: "Maria" },
    { name: "David Kim", text: "The supportive community and expert guidance helped me achieve my musical goals!", firstname: "David" }
  ];

  // Split testimonials into 3 columns
  const column1 = [...testimonials.slice(0, 3), ...testimonials.slice(0, 3), ...testimonials.slice(0, 3)];
  const column2 = [...testimonials.slice(3, 6), ...testimonials.slice(3, 6), ...testimonials.slice(3, 6)];
  const column3 = [...testimonials.slice(6, 9), ...testimonials.slice(6, 9), ...testimonials.slice(6, 9)];

  const faqs = [
    {
      question: "Do I need any prior piano or music experience?",
      answer: "Not necessarily — the beginner Piano/music courses are designed for complete beginners. Intermediate course is for those who already know basic and want more"
    },
    { question: "What instrument or gear do I need for Piano courses/workshops?", answer: "A keyboard or piano (88-key full size is ideal, but 61-key or 49-key works too for starting)." },
    { question: "Can I ask questions or get feedback?", answer: "Yes — you’ll be invited to a student community (forum or private group) where you can post videos, ask questions, share progress." },
    { question: "Can I start learning Piano if I’m a working professional?", answer: "Yes, you can and you might even have some advantages over people who start learning at younger ages. It’s a matter of perspective and it can never be too late to start." },
    { question: "Is this suited for adult learners / children / hobbyists / serious aspirants?", answer: "Yes — the courses are structured to support beginners of any age, hobbyists wanting to play for fun, as well as those looking to perform or teach in future. The pace is friendly but structured." },
    { question: "In how much time I can expect to play my first song on keys as a beginner?", answer: "In about 10-12 hours of practice you can start playing very simple songs. It might sound unbelievable, but many students have done it and you can too. It’s only about practice." },
    { question: "Do I need a musical ear to start learning piano and music production?", answer: "No, you do not need to have a musical ear to begin with. Ear training is an essential part of any student’s music learning journey, and it will be developed with time and practice." },
    { question: "How can I request sheets to buy for my favourite songs if they are not available here?", answer: "You can send your requests via email" },
  ];
  // Auto-rotation effect - opens next FAQ every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setExpandedFaq((prev) => (prev + 1) % faqs.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [faqs.length]);
  //Navbar Animation
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.boundingClientRect.y >= 700) setNavani(false)
      if (entry.boundingClientRect.y <= 700) setNavani(true)
      else setNavani(false)
      // else setNavani(true)
    })
    observer.observe(navref.current)

  }, [navref])
  const [WorkshopInstructor, setWorkshopInstructor] = useState('')
  // Fetch latest items
  useEffect(() => {
    const fetchLatestItems = async () => {
      try {
        const response = await fetch('/api/latest');
        const data = await response.json();
        if (response.ok) {
          console.log('Fetched latest items:', data); // Debug log
          // Filter out past workshops and mark if there are no upcoming ones
          if (data.workshop) {
            const workshopDate = new Date(data.workshop.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            if (data.workshop.instructor) {
              setWorkshopInstructor(data.workshop.instructor)
            }

            // Only include workshop if it's today or in the future
            if (workshopDate < today) {
              // Create a placeholder for "no upcoming workshops"
              data.workshop = {
                isPlaceholder: true,
                title: 'No Upcoming Workshops',
                description: 'Stay tuned! New workshops will be announced soon. Follow us on social media for updates.',
                date: null,
                price: null,
                id: null
              };
            }
          } else {
            // If no workshop exists at all, create placeholder
            data.workshop = {
              isPlaceholder: true,
              title: 'No Upcoming Workshops',
              description: 'Stay tuned! New workshops will be announced soon. Follow us on social media for updates.',
              date: null,
              price: null,
              id: null
            };
          }

          // Add image URL to course if it exists
          if (data.course && data.course.image_url) {
            const { data: { publicUrl } } = supabase.storage
              .from('courses')
              .getPublicUrl(data.course.image_url);
            data.course.imageUrl = publicUrl;
          }
          // Check if blog exists and has required fields
          if (!data.blog || !data.blog.title) {
            console.log('No valid blog found');
            data.blog = null;
          }
          setLatestItems(data);
        }
        else {
          console.error('Failed to fetch latest items:', data);
        }
      } catch (error) {
        console.error('Error fetching latest items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestItems();
  }, []);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchEnd = () => {
    if (!isSwiping || carouselItems.length <= 1) {
      setIsSwiping(false);
      return;
    }

    const swipeThreshold = 50; // Minimum swipe distance in pixels
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go to next
        nextItem();
      } else {
        // Swiped right - go to previous  
        prevItem();
      }
    }

    setIsSwiping(false);
    setTouchStart(0);
    setTouchEnd(0);
  };
  // Create carousel items array
  const carouselItems = [];
  if (latestItems.blog && latestItems.blog.title) {
    carouselItems.push({
      type: 'blog',
      title: latestItems.blog.title,
      image: latestItems.blog.featured_image || '/api/placeholder/250/150',
      excerpt: latestItems.blog.excerpt,
      slug: latestItems.blog.slug,
      icon: BookOpen,
      color: 'from-blue-600 to-blue-800'
    });
  }
  if (latestItems.course) {
    carouselItems.push({
      type: 'course',
      title: latestItems.course.title,
      image: latestItems.course.imageUrl || null,
      description: latestItems.course.description,
      price: latestItems.course.price,
      instrument: latestItems.course.instrument,
      id: latestItems.course.id,
      icon: Users,
      color: 'from-purple-600 to-purple-800'
    });
  }
  if (latestItems.workshop) {
    carouselItems.push({
      type: 'workshop',
      title: latestItems.workshop.title,
      image: '/api/placeholder/250/150',
      description: latestItems.workshop.description,
      date: latestItems.workshop.date,
      price: latestItems.workshop.price,
      id: latestItems.workshop.id,
      isPlaceholder: latestItems.workshop.isPlaceholder || false,
      icon: Calendar,
      color: 'from-green-600 to-green-800'
    });
  }

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (carouselItems.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user provided an email
        const emailRegex = /\S+@\S+\.\S+/;
        const hasEmail = emailRegex.test(formData.contact);

        if (hasEmail) {
          alert('Thank you for reaching out! We\'ve sent a confirmation email to you and will get back to you soon.');
        } else {
          alert('Thank you for reaching out! We will contact you soon at the number you provided.');
        }

        setFormData({ name: '', contact: '', goal: '', message: '' });
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again later.');
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleCardClick = (item) => {
    if (item.type === 'blog') {
      router.push(`/blog/${item.slug}`);
    } else if (item.type === 'course') {
      router.push('/courses');
    } else if (item.type === 'workshop') {
      router.push('/workshops');
    }
  };

  const getInstrumentEmoji = (instrument) => {
    const emojiMap = {
      Guitar: '🎸',
      Piano: '🎹',
      Cello: '🎻',
      Violin: '🎻',
      Drums: '🥁',
      Vocals: '🎤',
    };
    return emojiMap[instrument] || '🎵';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {navani && <>
        <div className={`bg-blue-50 border-2 border-black h-10 w-10 fixed bottom-24 right-8 rounded-full z-50 flex justify-center items-center cursor-pointer ${isLaunching ? "rocket-launch" : ""
          }`} onClick={() => { handleScrollTop() }}><img src="/startup.png" alt="" /></div>
      </>}
      {/* Hero Section */}
      <section className="relative h-screen bg-cover bg-center" style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0,0,0,0.7)), url("/p3.jpeg")',
        backgroundColor: '#1a1a2e',
      }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-6xl font-medium mb-4 flex flex-col md:flex-row items-center w-full gap-2 justify-center">
            <div className='w-[100%] text-center md:w-[50%] text-4xl md:text-4xl lg:text-6xl text-left md:text-right'>FOLLOW YOUR</div>
            <div className="text-hometext font-bold w-[100%]  md:w-[50%] flex justify-center md:justify-start text-4xl md:text-4xl lg:text-6xl"><Typewriter
              options={{
                strings: ["Passion", "Music Learning", "Piano Training"],
                autoStart: true,
                loop: true,
                delay: 75,     // typing speed
                deleteSpeed: 50, // deleting speed
              }}
            /></div>
          </h1>
          <div className="text-xs text-center md:text-lg text-left lg:text-2xl mb-2 w-[50%]">Learn Instruments Anytime, Anywhere</div>
          <div className='flex gap-4 mt-10 w-[100%] justify-center md:w-[50%] lg:w-auto'>
            <Link href="/courses" className='border-2 border-white hover:bg-white hover:text-primarytext px-2 py-2 md:px-8 md:py-3 rounded-full text-white font-semibold hover:from-blue-600 hover:to-purple-600 text-xs md:text-sm lg:text-lg'>
              Explore Marketplace
            </Link>
            <Link href="/workshops" className='bg-[#012773] hover:bg-[#03328f] px-2 py-2 md:px-8 md:py-3 flex item-center justify-center rounded-full text-white font-semibold hover:from-blue-600 hover:to-purple-600 text-xs md:text-sm lg:text-lg'>
              <span className='my-auto'>
                Enroll Workshop
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted by Musicians */}
      <section className="py-20 px-8 overflow-hidden">
        <motion.h2 ref={navref} className="text-4xl font-bold text-center mb-16">
          Trusted by <span className="text-blue-600">Musicians</span>
        </motion.h2>
        <div className="relative max-w-6xl mx-auto h-[600px]">
          {/* Fade overlay at top */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>

          {/* Fade overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-8 h-full w-[80%] mx-auto">
            {/* Column 1 */}
            <div className="flex-1 overflow-hidden relative">
              {column1.map((testimonial, index) => (
                <motion.div
                  key={`col1-${index}`}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{
                    y: [-10, -1200],
                    opacity: [1, 1, 1, 1]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    delay: 0,
                    ease: "linear"
                  }}
                  className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-lg hover:shadow-xl mb-8"
                >
                  <h3 className="font-bold text-lg mb-3 text-gray-800">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{testimonial.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="flex-1 overflow-hidden relative hidden md:block">
              {column2.map((testimonial, index) => (
                <motion.div
                  key={`col2-${index}`}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{
                    y: [0, -1200],
                    opacity: [1, 1, 1, 1]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    delay: 0,
                    ease: "linear"
                  }}
                  className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-lg hover:shadow-xl mb-8"
                >
                  <h3 className="font-bold text-lg mb-3 text-gray-800">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{testimonial.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Column 3 */}
            <div className="flex-1 overflow-hidden relative hidden lg:block">
              {column3.map((testimonial, index) => (
                <motion.div
                  key={`col3-${index}`}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{
                    y: [10, -1200],
                    opacity: [1, 1, 1, 1]
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    delay: 0,
                    ease: "linear"
                  }}
                  className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-lg hover:shadow-xl mb-8"
                >
                  <h3 className="font-bold text-lg mb-3 text-gray-800">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{testimonial.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wavy top border */}
      <div className="relative w-full h-32 bg-white">
        <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 Q150,0 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" fill="#091425" />
        </svg>
      </div>

      {/* What we are doing right now - UPDATED */}
      <section className="pb-20 pt-5 px-8 bg-primarycontainer text-white relative overflow-hidden min-h-[100vh]">
        <div className="relative flex justify-center w-full mx-auto">
          <h2 className="relative text-4xl font-bold text-center z-10 mt-10">
            What we are doing <span className="text-[#5d8ef1ff]">right now ?</span>
          </h2>
        </div>

        <div className="max-w-6xl mx-auto mt-16 relative w-[80%]">
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-blue-300 text-xl">Loading latest updates...</div>
            </div>
          ) : carouselItems.length === 0 ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <div className="text-6xl mb-4">🎵</div>
                <p className="text-blue-300">No recent updates available</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={prevItem}
                  className="p-2 hover:bg-blue-800 rounded-full z-20 transition-colors hidden sm:block"
                  disabled={carouselItems.length <= 1}
                >
                  <ChevronLeft size={32} />
                </button>

                <div
                  className="relative h-96 w-full max-w-4xl flex items-center justify-center"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {carouselItems.map((item, index) => {
                    const position = (index - currentIndex + carouselItems.length) % carouselItems.length;
                    const isActive = position === 0;
                    const isLeft = position === carouselItems.length - 1;
                    const isRight = position === 1;

                    let transformStyle = '';
                    let zIndex = 0;
                    let opacity = 0;

                    if (isActive) {
                      transformStyle = 'translateX(0) scale(1)';
                      zIndex = 10;
                      opacity = 1;
                    } else if (isLeft && carouselItems.length > 1) {
                      transformStyle = 'translateX(-80%) scale(0.8)';
                      zIndex = 5;
                      opacity = 0.4;
                    } else if (isRight && carouselItems.length > 1) {
                      transformStyle = 'translateX(80%) scale(0.8)';
                      zIndex = 5;
                      opacity = 0.4;
                    }

                    const Icon = item.icon;

                    return (
                      <div
                        key={`${item.type}-${index}`}
                        className={`${isActive ? "bg-blue-100/80" : "bg-blue-100/30 blur-[6px]"} absolute rounded-2xl p-6 w-[300px] sm:w-96 duration-500 cursor-pointer border-2 border-blue-700 hover:border-blue-500 min-h-[400px] touch-pan-y`}
                        style={{
                          transform: transformStyle,
                          zIndex: zIndex,
                          opacity: opacity,
                          transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
                        }}
                        onClick={() => isActive && handleCardClick(item)}
                      >
                        {/* Rest of your card content remains the same */}
                        {/* Type Badge */}
                        <div className={`absolute top-4 right-4 bg-gradient-to-r ${item.color} px-3 py-1 rounded-full flex items-center gap-2 z-30`}>
                          <Icon size={16} />
                          <span className="text-xs font-semibold uppercase">{item.type}</span>
                        </div>

                        {/* Image */}
                        {item.type != "workshop" && <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-blue-800">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) {
                                  e.target.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`absolute inset-0 flex items-center justify-center text-6xl ${item.image ? 'hidden' : 'flex'
                              }`}
                          >
                            {item.instrument ? getInstrumentEmoji(item.instrument) : '🎵'}
                          </div>
                        </div>}

                        {/* Workshop Image */}
                        {item.type == "workshop" && <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-blue-950">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) {
                                  e.target.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`absolute inset-0 flex items-center justify-center ${WorkshopInstructor.length > 1 ? `text-2xl text-center text-blue-100` : 'text-6xl'}  ${item.image ? 'hidden' : 'flex'
                              }`}
                          >
                            {WorkshopInstructor.length > 1 ? `🎼 By ${WorkshopInstructor}` : '🎼'}
                          </div>
                        </div>}

                        {/* Content */}
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold text-black line-clamp-2 min-h-[3.5rem]">
                            {item.title}
                          </h3>

                          <p className="text-blue-800 text-sm line-clamp-2">
                            {item.excerpt || item.description}
                          </p>

                          {/* Additional Info */}
                          <div className="flex items-center justify-between pt-3 border-t border-blue-800">
                            {item.type === 'course' && (
                              <>
                                <span className="text-blue-800 text-sm">{item.instrument}</span>
                              </>
                            )}
                            {item.type === 'workshop' && (
                              <>
                                <span className="text-blue-800 text-sm flex items-center gap-1">
                                  <Calendar size={14} />
                                  {formatDate(item.date)}
                                </span>
                              </>
                            )}
                            {item.type === 'blog' && (
                              <span className="text-blue-800 text-sm">Read more →</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={nextItem}
                  className="p-2 hover:bg-blue-800 rounded-full z-20 transition-colors hidden sm:block"
                  disabled={carouselItems.length <= 1}
                >
                  <ChevronRight size={32} />
                </button>
              </div>

              {/* Dots Indicator */}
              {carouselItems.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {carouselItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all ${currentIndex === index ? "bg-white w-8" : "bg-gray-500 w-2"
                        }`}
                    />
                  ))}
                </div>
              )}

              <p className="text-center mt-8 text-gray-300">
                Check out our latest blogs, courses and workshops.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Wavy bottom border */}
      <div className="relative w-full h-32 bg-white">
        <svg className="absolute bottom-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 L1200,0 L1200,60 Q1050,120 900,60 T600,60 T300,60 T0,60 Z" fill="#091425" />
        </svg>
      </div>

      {/* Connect With Us + Social Media */}
      <section className="py-24 px-8 bg-white" id="contact">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-900 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-8">Connect With <br />Us</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm mb-2">What's your name?</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:outline-none focus:border-blue-400 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">What's your contact?</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:outline-none focus:border-blue-400 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">What's your goal?</label>
                <input
                  type="text"
                  name="goal"
                  value={formData.goal}
                  onChange={(e) => handleChange('goal', e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:outline-none focus:border-blue-400 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Tell us a bit more...</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="w-full bg-transparent border-b border-gray-600 py-2 focus:outline-none focus:border-blue-400 resize-none text-white"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600"
              >
                SUBMIT
              </button>
            </form>
          </div>

          {/* Social Media */}
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <h2 className="text-3xl font-bold mb-4">Reach out to Us!</h2>
            <p className="text-gray-600 mb-8">
              Got questions or just want to chat? Drop us a message and we'll get back to you soon!
            </p>

            <h3 className="text-2xl font-bold mb-4">Follow us on Social Media</h3>
            <p className="text-gray-600 mb-8">
              Join thousands who follow us! Hit the link and like the page and get updated on our
              activities, contests and progress.
            </p>

            <div className="space-y-4">
              <a href="https://www.instagram.com/soloistanjali" target="__blank" className="flex items-center gap-3 text-pink-500 hover:text-pink-600">
                <Instagram size={24} />
                <span className="font-semibold">Instagram</span>
              </a>
              <a href="https://www.threads.com/@soloistanjali" target="__blank" className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
                <div className='h-6 w-6'><svg aria-label="Threads" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg"><path className="x19hqcy" d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"></path></svg></div>
                <span className="font-semibold text-black ">Threads</span>
              </a>
              <a href="https://www.youtube.com/@Piano-gym" target="__blank" className="flex items-center gap-3 text-red-600 hover:text-red-700">
                <Youtube size={24} />
                <span className="font-semibold">Youtube</span>
              </a>
            </div>

            <p className="text-xs text-gray-500 mt-8">
              At soloisanjali, your privacy is our priority. We will only use your data to get in touch
              and provide you with information you need.
            </p>
          </div>
        </div>
      </section>

      {/* Right Angled Triangle Before FAQs */}
      <div className="relative min-w-screen h-[100px] overflow-hidden">
        <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[100px] border-b-primarycontainer border-l-[100vw] border-l-transparent"></div>
      </div>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-primarycontainer text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[120px] left-3/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-3/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-blue-500 rounded-full blur-3xl opacity-15"></div>

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-blue-200 mb-8 sm:mb-12 md:mb-16 text-base sm:text-lg px-4">
            Find answers to common questions about our piano lessons
          </p>

          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`bg-blue-950 rounded-xl sm:rounded-2xl border transition-all duration-500 ${expandedFaq === index
                  ? 'border-blue-400 shadow-lg shadow-blue-500/20'
                  : 'border-blue-700/50 hover:border-blue-600'
                  }`}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left hover:bg-blue-800/30 rounded-xl sm:rounded-2xl transition-all duration-300"
                >
                  <span className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                    <span className={`text-xl sm:text-2xl font-bold transition-colors duration-300 flex-shrink-0 ${expandedFaq === index ? 'text-blue-300' : 'text-blue-500'
                      }`}>
                      Q.
                    </span>
                    <span className={`text-sm sm:text-base md:text-lg transition-colors duration-300 ${expandedFaq === index ? 'text-white font-semibold' : 'text-blue-100'
                      }`}>
                      {faq.question}
                    </span>
                  </span>
                  <span className={`text-2xl sm:text-3xl font-light transition-all duration-300 flex-shrink-0 ml-2 ${expandedFaq === index ? 'text-blue-300 rotate-180' : 'text-blue-400'
                    }`}>
                    {expandedFaq === index ? '−' : '+'}
                  </span>
                </button>

                <div className={`overflow-hidden transition-all duration-500 ${expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                  {faq.answer && (
                    <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-2">
                      <div className="pl-6 sm:pl-10 md:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base text-blue-100 leading-relaxed bg-blue-900/30 rounded-lg sm:rounded-xl border-l-2 sm:border-l-4 border-blue-400">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
          <p className="text-blue-300 text-xs sm:text-sm">
            Questions auto-rotate every 10 seconds • Click any question to expand
          </p>
        </div> */}
        </div>
      </section>

      {/* About Us */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center relative z-10">
          <div className="relative order-1 md:order-1">
            <div className="absolute rounded-3xl transform rotate-6"></div>
            <div className="relative z-10 p-4 sm:p-6 md:p-8 rounded-3xl">
              <img
                src="AboutUs.png"
                alt="Guitar"
                className="w-full max-w-sm sm:max-w-md mx-auto rounded-xl sm:rounded-2xl"
              />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-7 md:space-y-8 order-1 md:order-2">
            <div>
              <h3 className="text-blue-600 font-bold mb-2 sm:mb-3 text-sm sm:text-base md:text-lg tracking-wide uppercase">About Us</h3>
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-blue-950 font-bold mb-4 sm:mb-5 md:mb-6 leading-tight">
                SoloistAnjali:<br />
                <span className="text-blue-700">A Legacy of Music</span>
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className='flex flex-col gap-4 sm:gap-5 md:gap-6'>
                <div className='bg-gradient-to-r from-blue-50 to-transparent p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-l-2 sm:border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-300'>
                  <span className='text-sm sm:text-base text-blue-800 leading-relaxed'>
                    Unlock your Piano voice. Learn to play the piano confidently, fluently and
                    creatively. From first key-press to expressive performance — take your
                    piano journey one chord at a time.
                  </span>
                </div>

                <div className='bg-gradient-to-r from-blue-50 to-transparent p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-l-2 sm:border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow duration-300'>
                  <span className='text-sm sm:text-base text-blue-800 leading-relaxed'>
                    Whether you're just beginning on the piano or ready to take your tracks to
                    streaming-ready quality, you're in the right place. Learn the craft of piano
                    playing and music production in one place so that you can create those divine
                    sounding piano covers/pieces easily in your home studio with the right
                    knowledge and guidance.
                  </span>
                </div>
              </div>

              <div className='bg-gradient-to-br from-blue-100 via-blue-50 to-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-blue-200'>
                <h4 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 text-blue-950 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                  <span>Our Vision / Mission</span>
                </h4>
                <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                  To empower you to play the piano confidently — whether you want to perform for yourself,
                  your family, or on stage; to interpret songs, to record beautiful performances at your home,
                  compose new ideas, or simply enjoy every moment at the keyboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}