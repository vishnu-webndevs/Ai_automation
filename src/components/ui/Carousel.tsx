
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CarouselItem {
  image: string;
  caption?: string;
  alt?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoSlide?: boolean;
  interval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ items, autoSlide = true, interval = 5000 }) => {
  const [curr, setCurr] = useState(0);

  const prev = () => setCurr((curr) => (curr === 0 ? items.length - 1 : curr - 1));
  const next = () => setCurr((curr) => (curr === items.length - 1 ? 0 : curr + 1));

  React.useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, interval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, interval, curr]); // Re-run effect when curr changes to reset timer

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-md group">
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={index} className="min-w-full relative">
            <img src={item.image} alt={item.alt || `Slide ${index}`} className="w-full h-64 object-cover" />
             {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white text-center">
                    {item.caption}
                </div>
             )}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={prev}
          className="p-1 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white group-hover:block hidden"
        >
          <FiChevronLeft size={30} />
        </button>
        <button
          onClick={next}
          className="p-1 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white group-hover:block hidden"
        >
          <FiChevronRight size={30} />
        </button>
      </div>

      <div className="absolute bottom-4 right-0 left-0">
        <div className="flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <div
              key={i}
              className={`
              transition-all w-3 h-3 bg-white rounded-full
              ${curr === i ? "p-1" : "bg-opacity-50"}
            `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
