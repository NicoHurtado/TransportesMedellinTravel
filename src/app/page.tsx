'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Globe, 
  Shield, 
  Clock, 
  Star, 
  Car, 
  Headphones, 
  Calendar,
  CheckCircle,
  ArrowRight,
  Plane,
  Building2,
  Mountain,
  MapPin,
  Sparkles,
  Instagram,
  MessageCircle,
  Quote,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const { language, toggleLanguage } = useLanguage();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReservar = () => {
    router.push('/reservas');
  };

  const isSpanish = language === 'es';

  // Testimonios mock (puedes reemplazar con datos reales después)
  const testimonials = [
    {
      name: 'María González',
      location: 'Bogotá, Colombia',
      rating: 5,
      text: isSpanish 
        ? 'Servicio excepcional. Puntuales, profesionales y muy amables. Definitivamente los recomiendo.'
        : 'Exceptional service. Punctual, professional and very friendly. I definitely recommend them.',
      image: '/heroimage.jpeg'
    },
    {
      name: 'John Smith',
      location: 'New York, USA',
      rating: 5,
      text: isSpanish
        ? 'La mejor experiencia de transporte en Medellín. Vehículos modernos y conductores excelentes.'
        : 'Best transport experience in Medellín. Modern vehicles and excellent drivers.',
      image: '/heroimage.jpeg'
    },
    {
      name: 'Ana Martínez',
      location: 'Madrid, España',
      rating: 5,
      text: isSpanish
        ? 'Increíble tour por Guatapé. El guía fue muy informativo y el servicio superó nuestras expectativas.'
        : 'Amazing tour to Guatapé. The guide was very informative and the service exceeded our expectations.',
      image: '/heroimage.jpeg'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Premium con Glassmorphism */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center cursor-pointer"
            >
              <Image
                src="/nav.png"
                alt="Medellín Travel"
                width={200}
                height={60}
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {[
                { id: 'inicio', label: isSpanish ? 'Inicio' : 'Home' },
                { id: 'servicios', label: isSpanish ? 'Servicios' : 'Services' },
                { id: 'nosotros', label: isSpanish ? 'Nosotros' : 'About Us' },
                { id: 'testimonios', label: isSpanish ? 'Testimonios' : 'Testimonials' },
                { id: 'contacto', label: isSpanish ? 'Contacto' : 'Contact' },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  whileHover={{ y: -2 }}
                  className="text-sm font-medium text-gray-700 hover:text-[#D6A75D] transition-colors"
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <motion.a
                href="https://www.instagram.com/transportesmedellintravel/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-700 hover:text-[#D6A75D] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.button
                onClick={toggleLanguage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#D6A75D] transition-colors rounded-full hover:bg-gray-50"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'es' ? 'EN' : 'ES'}</span>
              </motion.button>
              <motion.button
                onClick={handleReservar}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(214, 167, 93, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-[#D6A75D] text-white rounded-full font-medium text-sm shadow-lg hover:shadow-xl transition-all"
              >
                {isSpanish ? 'Reservar' : 'Book'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section Premium */}
      <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image con Parallax */}
        <motion.div 
          style={{ y }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ 
              backgroundImage: 'url(/heroimage.jpeg)',
            }}
          />
        </motion.div>
        
        {/* Overlay suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        
        {/* Contenido */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-light text-white mb-6 tracking-tight"
            >
              {isSpanish ? (
                <>
                  Descubre Medellín<br />
                  <span className="font-normal text-[#D6A75D]">con Estilo</span>
                </>
              ) : (
                <>
                  Discover Medellín<br />
                  <span className="font-normal text-[#D6A75D]">with Style</span>
                </>
              )}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-200 mb-12 max-w-2xl mx-auto font-light"
            >
              {isSpanish
                ? 'Transporte premium y tours inolvidables en la ciudad de la eterna primavera'
                : 'Premium transport and unforgettable tours in the city of eternal spring'}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                onClick={handleReservar}
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(214, 167, 93, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-3 px-10 py-4 bg-[#D6A75D] text-white rounded-full font-medium text-lg shadow-2xl hover:shadow-[#D6A75D]/50 transition-all"
              >
                {isSpanish ? 'Reservar Ahora' : 'Book Now'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-white rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Quiénes Somos - Minimalista */}
      <section id="nosotros" className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl sm:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {isSpanish ? 'Quiénes Somos' : 'Who We Are'}
            </h2>
            <div className="w-24 h-1 bg-[#D6A75D] mx-auto mb-8" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              {isSpanish
                ? 'Medellín Travel es tu socio de confianza para explorar la hermosa ciudad de Medellín y sus alrededores. Con años de experiencia en transporte premium y turismo, ofrecemos servicios de alta calidad que combinan comodidad, seguridad y puntualidad.'
                : 'Medellín Travel is your trusted partner to explore the beautiful city of Medellín and its surroundings. With years of experience in premium transport and tourism, we offer high-quality services that combine comfort, safety, and punctuality.'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: isSpanish ? 'Confiabilidad' : 'Reliability',
                description: isSpanish ? 'Servicio confiable y seguro' : 'Reliable and secure service',
              },
              {
                icon: Clock,
                title: isSpanish ? 'Puntualidad' : 'Punctuality',
                description: isSpanish ? 'Siempre a tiempo' : 'Always on time',
              },
              {
                icon: Star,
                title: isSpanish ? 'Calidad Premium' : 'Premium Quality',
                description: isSpanish ? 'Experiencia de primera clase' : 'First class experience',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group bg-white rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#D6A75D]/10 mb-6 group-hover:bg-[#D6A75D]/20 transition-colors">
                  <item.icon className="w-10 h-10 text-[#D6A75D]" />
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 font-light">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nuestros Servicios - Grid Premium */}
      <section id="servicios" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl sm:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {isSpanish ? 'Nuestros Servicios' : 'Our Services'}
            </h2>
            <div className="w-24 h-1 bg-[#D6A75D] mx-auto mb-8" />
            <p className="text-xl text-gray-600 font-light">
              {isSpanish
                ? 'Soluciones de transporte y turismo diseñadas para ti'
                : 'Transport and tourism solutions designed for you'}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Plane,
                title: isSpanish ? 'Transporte Aeropuerto' : 'Airport Transport',
                description: isSpanish
                  ? 'Servicio privado con seguimiento de vuelos en tiempo real'
                  : 'Private service with real-time flight tracking',
                gradient: 'from-blue-500/10 to-blue-600/10',
                iconColor: 'text-blue-600',
              },
              {
                icon: Car,
                title: isSpanish ? 'Transporte Personalizado' : 'Personalized Transport',
                description: isSpanish
                  ? 'Traslados a medida con múltiples paradas'
                  : 'Custom transfers with multiple stops',
                gradient: 'from-purple-500/10 to-purple-600/10',
                iconColor: 'text-purple-600',
              },
              {
                icon: Building2,
                title: isSpanish ? 'Tour por la Ciudad' : 'City Tour',
                description: isSpanish
                  ? 'Descubre los lugares icónicos con guías expertos'
                  : 'Discover iconic places with expert guides',
                gradient: 'from-[#D6A75D]/10 to-[#D6A75D]/20',
                iconColor: 'text-[#D6A75D]',
              },
              {
                icon: Mountain,
                title: isSpanish ? 'Tours de Aventura' : 'Adventure Tours',
                description: isSpanish
                  ? 'Parapente, ATV y experiencias emocionantes'
                  : 'Paragliding, ATV and exciting experiences',
                gradient: 'from-green-500/10 to-green-600/10',
                iconColor: 'text-green-600',
              },
              {
                icon: Sparkles,
                title: isSpanish ? 'Tours Culturales' : 'Cultural Tours',
                description: isSpanish
                  ? 'Comuna 13, arte urbano y la historia única'
                  : 'Comuna 13, urban art and unique history',
                gradient: 'from-pink-500/10 to-pink-600/10',
                iconColor: 'text-pink-600',
              },
              {
                icon: MapPin,
                title: isSpanish ? 'Destinos Cercanos' : 'Nearby Destinations',
                description: isSpanish
                  ? 'Guatapé, Hacienda Nápoles, Jardín y más'
                  : 'Guatapé, Hacienda Nápoles, Jardín and more',
                gradient: 'from-indigo-500/10 to-indigo-600/10',
                iconColor: 'text-indigo-600',
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={handleReservar}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer border border-gray-100 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-white mb-6 transition-colors`}>
                    <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 font-light mb-4">{service.description}</p>
                  <div className="flex items-center text-[#D6A75D] font-medium text-sm">
                    {isSpanish ? 'Saber más' : 'Learn more'}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Por Qué Elegirnos - Tarjetas Flotantes */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl sm:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {isSpanish ? 'Por Qué Elegirnos' : 'Why Choose Us'}
            </h2>
            <div className="w-24 h-1 bg-[#D6A75D] mx-auto" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: isSpanish ? '100% Puntuales' : '100% Punctual',
                description: isSpanish
                  ? 'Respetamos tu tiempo con llegadas garantizadas'
                  : 'We respect your time with guaranteed arrivals',
                color: 'blue',
              },
              {
                icon: Car,
                title: isSpanish ? 'Vehículos Modernos' : 'Modern Vehicles',
                description: isSpanish
                  ? 'Flota de última generación, limpia y segura'
                  : 'Latest generation fleet, clean and safe',
                color: 'purple',
              },
              {
                icon: Globe,
                title: isSpanish ? 'Servicio Bilingüe' : 'Bilingual Service',
                description: isSpanish
                  ? 'Atención en español e inglés'
                  : 'Service in Spanish and English',
                color: 'green',
              },
              {
                icon: Star,
                title: isSpanish ? 'Conductores Profesionales' : 'Professional Drivers',
                description: isSpanish
                  ? 'Equipo capacitado y con experiencia local'
                  : 'Trained team with local experience',
                color: 'yellow',
              },
              {
                icon: Headphones,
                title: isSpanish ? 'Soporte 24/7' : '24/7 Support',
                description: isSpanish
                  ? 'Estamos aquí cuando nos necesites'
                  : 'We are here when you need us',
                color: 'red',
              },
              {
                icon: Calendar,
                title: isSpanish ? 'Reserva Fácil' : 'Easy Booking',
                description: isSpanish
                  ? 'Sistema de reservas simple y rápido'
                  : 'Simple and fast booking system',
                color: 'indigo',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-${feature.color}-50 mb-6`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Funciona - Timeline Visual */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl sm:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {isSpanish ? 'Cómo Funciona' : 'How It Works'}
            </h2>
            <div className="w-24 h-1 bg-[#D6A75D] mx-auto" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                icon: Sparkles,
                title: isSpanish ? 'Elige tu Servicio' : 'Choose your Service',
                description: isSpanish
                  ? 'Selecciona el transporte o tour que necesitas'
                  : 'Select the transport or tour you need',
                color: 'blue',
              },
              {
                step: '2',
                icon: Calendar,
                title: isSpanish ? 'Reserva en Línea' : 'Book Online',
                description: isSpanish
                  ? 'Completa tu reserva en minutos'
                  : 'Complete your booking in minutes',
                color: 'purple',
              },
              {
                step: '3',
                icon: CheckCircle,
                title: isSpanish ? 'Recibe Confirmación' : 'Receive Confirmation',
                description: isSpanish
                  ? 'Obtén los detalles de tu conductor y vehículo'
                  : 'Get the details of your driver and vehicle',
                color: 'green',
              },
              {
                step: '4',
                icon: Star,
                title: isSpanish ? 'Disfruta el Viaje' : 'Enjoy the Trip',
                description: isSpanish
                  ? 'Relájate y déjanos el resto'
                  : 'Relax and leave the rest to us',
                color: 'yellow',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                className="relative text-center"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-${step.color}-50 mb-6 relative`}>
                  <span className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-${step.color}-600 text-white flex items-center justify-center text-sm font-bold shadow-lg`}>
                    {step.step}
                  </span>
                  <step.icon className={`w-10 h-10 text-${step.color}-600`} />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 font-light">{step.description}</p>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -z-10" style={{ width: 'calc(100% - 80px)', marginLeft: '40px' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios - Slider Premium */}
      <section id="testimonios" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl sm:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {isSpanish ? 'Lo Que Dicen Nuestros Clientes' : 'What Our Clients Say'}
            </h2>
            <div className="w-24 h-1 bg-[#D6A75D] mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <Quote className="w-8 h-8 text-[#D6A75D] mb-4" />
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#D6A75D] text-[#D6A75D]" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 font-light leading-relaxed">{testimonial.text}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final Premium */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/heroimage.jpeg')] opacity-10 bg-cover bg-center" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl sm:text-6xl font-light text-white mb-6 tracking-tight">
              {isSpanish ? '¿Listo para tu Aventura?' : 'Ready for your Adventure?'}
            </h2>
            <p className="text-xl text-gray-300 mb-12 font-light max-w-2xl mx-auto">
              {isSpanish
                ? 'Reserva ahora y descubre por qué somos la opción preferida en Medellín'
                : 'Book now and discover why we are the preferred option in Medellín'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(214, 167, 93, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReservar}
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#D6A75D] text-white rounded-full font-medium text-lg shadow-2xl hover:shadow-[#D6A75D]/50 transition-all"
            >
              {isSpanish ? 'Reservar Ahora' : 'Book Now'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer Premium */}
      <footer id="contacto" className="bg-white border-t border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Column 1 */}
            <div>
              <h3 className="text-2xl font-medium text-gray-900 mb-6">
                Medellín Travel
              </h3>
              <p className="text-gray-600 text-sm mb-6 font-light leading-relaxed">
                {isSpanish
                  ? 'Tu socio de confianza para transporte premium y tours en Medellín'
                  : 'Your trusted partner for premium transport and tours in Medellín'}
              </p>
              <div className="flex gap-4">
                <motion.a 
                  href="https://www.instagram.com/transportesmedellintravel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-gray-700" />
                </motion.a>
                <motion.a 
                  href="https://wa.me/573175177409"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 text-gray-700" />
                </motion.a>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-6">{isSpanish ? 'Servicios' : 'Services'}</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  isSpanish ? 'Transporte Aeropuerto' : 'Airport Transport',
                  isSpanish ? 'Tour por la Ciudad' : 'City Tour',
                  isSpanish ? 'Tours de Aventura' : 'Adventure Tours',
                ].map((service, index) => (
                  <li key={index}>
                    <button 
                      onClick={handleReservar} 
                      className="hover:text-[#D6A75D] transition-colors font-light"
                    >
                      {service}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-6">{isSpanish ? 'Empresa' : 'Company'}</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <button onClick={() => scrollToSection('nosotros')} className="hover:text-[#D6A75D] transition-colors font-light">
                    {isSpanish ? 'Nosotros' : 'About Us'}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('servicios')} className="hover:text-[#D6A75D] transition-colors font-light">
                    {isSpanish ? 'Servicios' : 'Services'}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('contacto')} className="hover:text-[#D6A75D] transition-colors font-light">
                    {isSpanish ? 'Contacto' : 'Contact'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-6">{isSpanish ? 'Contacto' : 'Contact'}</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D6A75D] flex-shrink-0 mt-0.5" />
                  <span className="font-light">Provenza, Medellín, Colombia</span>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#D6A75D] flex-shrink-0 mt-0.5" />
                  <a 
                    href="https://wa.me/573175177409"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D6A75D] transition-colors font-light"
                  >
                    +57 317 517 7409
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#D6A75D]">✉️</span>
                  <a 
                    href="mailto:mmedellintraveltransportes@gmail.com"
                    className="hover:text-[#D6A75D] transition-colors font-light break-all"
                  >
                    mmedellintraveltransportes@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 text-center">
            <p className="text-sm text-gray-500 font-light">
              &copy; {new Date().getFullYear()} Medellín Travel. {isSpanish ? 'Todos los derechos reservados.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
