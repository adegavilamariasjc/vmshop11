
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
  const [availableImages, setAvailableImages] = useState<Array<{src: string, alt: string}>>([]);
  const isMobile = useIsMobile();
  
  // Initial base images
  const baseImages = [
    {
      src: "https://adegavm.shop/logo.gif",
      alt: "Logotipo da Loja"
    }
  ];
  
  // Check which banner images exist
  useEffect(() => {
    const checkImagesExistence = async () => {
      // Start with the base images
      const foundImages = [...baseImages];
      
      // Check for ban1.png to ban15.png
      for (let i = 1; i <= 15; i++) {
        const imageUrl = `https://adegavm.shop/ban${i}.png`;
        
        try {
          // We use a fetch HEAD request to check if the image exists without downloading it
          const response = await fetch(imageUrl, { method: 'HEAD' });
          
          if (response.ok) {
            // Add image only if it exists (200 status)
            foundImages.push({
              src: imageUrl,
              alt: `Banner Promocional ${i}`
            });
            console.log(`Banner ${i} found and added`);
          }
        } catch (error) {
          console.log(`Banner ${i} not found or error checking`);
          // Silently fail - we just don't add this image
        }
      }
      
      setAvailableImages(foundImages);
    };
    
    checkImagesExistence();
  }, []);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Automatic carousel rotation every 5 seconds
  useInterval(() => {
    if (!api) return;
    api.scrollNext();
  }, 5000);

  // Don't render carousel if no images
  if (availableImages.length === 0) {
    return <div className="h-[150px] sm:h-[200px] flex items-center justify-center">Carregando...</div>;
  }

  // Don't use carousel for single image
  if (availableImages.length === 1) {
    return (
      <div className="w-full max-w-full sm:max-w-[400px] flex items-center justify-center">
        <img
          src={availableImages[0].src}
          alt={availableImages[0].alt}
          className="w-full h-auto max-h-[150px] sm:max-h-[200px] object-contain"
        />
      </div>
    );
  }

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
        {availableImages.map((image, index) => (
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
      {availableImages.length > 1 && (
        <>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </>
      )}
    </Carousel>
  );
};

export default Logo;
