'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { HeroSlide } from '@/types';

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0); // -1 pour gauche, 1 pour droite

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      console.log('🎨 Chargement des slides...');
      const q = query(
        collection(db, 'heroSlides'),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      console.log(`✅ ${snapshot.docs.length} slides trouvés`);
      
      const slidesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as HeroSlide[];
      
      console.log('📊 Slides:', slidesData);
      setSlides(slidesData);
    } catch (error) {
      console.error('❌ Erreur chargement slides:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play : change de slide toutes les 5 secondes
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, currentIndex]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] bg-gray-100 animate-pulse rounded-lg" />
    );
  }

  if (slides.length === 0) {
    return null; // Ne rien afficher si aucun slide
  }

  const currentSlide = slides[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg mb-6 md:mb-12">
      <div 
        className="relative h-[400px] sm:h-[450px] md:h-[500px]"
        style={{ backgroundColor: currentSlide.backgroundColor }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            <div className="container mx-auto px-4 h-full">
              {/* Layout responsive : colonne sur mobile, ligne sur desktop */}
              <div className="flex flex-col md:flex-row items-center justify-center h-full gap-4 md:gap-12">
                {/* Contenu : centré sur mobile, gauche sur desktop */}
                <div className="flex-1 space-y-3 md:space-y-6 text-center md:text-left w-full md:w-auto px-2">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                  >
                    {currentSlide.title}
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed"
                  >
                    {currentSlide.description}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      href={currentSlide.buttonLink}
                      className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-white text-base md:text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                      style={{ backgroundColor: currentSlide.buttonColor }}
                    >
                      {currentSlide.buttonText}
                    </Link>
                  </motion.div>
                </div>

                {/* Image : cachée sur très petit écran, visible à partir de sm */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden sm:block flex-1 relative h-[250px] sm:h-[300px] md:h-[400px] w-full"
                >
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Boutons navigation : plus petits sur mobile */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 md:p-3 shadow-lg transition-all z-10"
              aria-label="Slide précédent"
            >
              <ChevronLeft size={20} className="text-gray-800 md:w-6 md:h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 md:p-3 shadow-lg transition-all z-10"
              aria-label="Slide suivant"
            >
              <ChevronRight size={20} className="text-gray-800 md:w-6 md:h-6" />
            </button>
          </>
        )}

        {/* Indicateurs (dots) : plus petits sur mobile */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  index === currentIndex
                    ? 'w-6 md:w-8 h-2 md:h-3 bg-white'
                    : 'w-2 md:w-3 h-2 md:h-3 bg-white bg-opacity-50 hover:bg-opacity-75'
                } rounded-full`}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
