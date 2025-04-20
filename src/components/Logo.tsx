import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useInterval } from "@/hooks/useInterval";
import ImageModal from './ImageModal';

const Logo: React.FC = () => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [timestamp, setTimestamp] = useState(Date.now());

  const [images, setImages] = useState([
    {
      src: `https://adegavm.shop/logo.gif?t=${timestamp}`,
      alt: "Logotipo da Loja",
      fallbackSrc: "/placeholder.svg"
    },
    {
      src: `https://adegavm.shop/ban1.png?t=${timestamp}`,
      alt: "Banner Promocional 1",
      fallbackSrc: "/placeholder.svg"
    },
    {
      src: `https://adegavm.shop/ban2.png?t=${timestamp}`,
      alt: "Banner Promocional 2", 
      fallbackSrc: "/placeholder.svg"
    }
  ]);

  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useInterval(() => {
    if (!api) return;
    api.scrollNext();
  }, 5000);

  const handleImageError = (src: string) => {
    setTimestamp(Date.now());
    setImages(prevImages => 
      prevImages.map(img => 
        img.src.includes(src) 
          ? { ...img, src: `${img.src.split('?')[0]}?t=${Date.now()}` } 
          : img
      )
    );
  };

  const handleImageLoad = (src: string) => {
    setLoadedImages(prev => [...prev, src]);
  };

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      setApi={setApi}
      className="w-full max-w-full sm:max-w-[400px]"
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index} className="flex items-center justify-center">
            <div className="w-full sm:w-[400px] flex items-center justify-center">
              <ImageModal
                src={image.src}
                alt={image.alt}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
};

export default Logo;
