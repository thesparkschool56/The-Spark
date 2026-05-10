import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
    children: React.ReactNode;
    autoPlay?: boolean;
    interval?: number;
    className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
    children,
    autoPlay = true,
    interval = 5000,
    className = ""
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const childrenArray = React.Children.toArray(children);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % childrenArray.length);
    }, [childrenArray.length]);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + childrenArray.length) % childrenArray.length);
    }, [childrenArray.length]);

    useEffect(() => {
        if (!autoPlay) return;
        const timer = setInterval(nextSlide, interval);
        return () => clearInterval(timer);
    }, [autoPlay, interval, nextSlide]);

    const variants = {
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
        <div className={`relative overflow-hidden group ${className}`}>
            <div className="relative h-full flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute w-full"
                    >
                        {childrenArray[currentIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="absolute inset-0 flex items-center justify-between p-4 z-20 pointer-events-none">
                <button
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all pointer-events-auto opacity-0 group-hover:opacity-100"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all pointer-events-auto opacity-0 group-hover:opacity-100"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {childrenArray.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setDirection(index > currentIndex ? 1 : -1);
                            setCurrentIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-accent w-6' : 'bg-white/40'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;
