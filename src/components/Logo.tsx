
import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useInterval } from "@/hooks/useInterval";
import { useIsMobile } from "@/hooks/use-mobile";

const Logo: React.FC = () => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const isMobile = useIsMobile();
  
  const images = [
    {
      src: "https://adegavm.shop/logo.gif",
      alt: "Logotipo da Loja"
    },
    {
      src: "https://adegavm.shop/ban1.png",
      alt: "Banner Promocional 1"
    },
    {
      src: "https://adegavm.shop/ban2.png",
      alt: "Banner Promocional 2"
    }
  ];

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
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto max-h-[150px] sm:max-h-[200px] object-contain"
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
