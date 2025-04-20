
import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from 'lucide-react';

interface ImageModalProps {
  src: string;
  alt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale(current => {
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.5, current + delta), 4);
      return newScale;
    });
  }, []);

  useEffect(() => {
    const modalImage = document.querySelector('.modal-image');
    if (modalImage && isOpen) {
      modalImage.addEventListener('wheel', handleWheel);
      return () => modalImage.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel, isOpen]);

  // Reset zoom when modal closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setScale(1);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[150px] sm:max-h-[200px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
        />
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-0 relative">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <DialogClose className="absolute top-4 right-4 z-50 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors">
          <X className="text-white w-6 h-6" />
        </DialogClose>
        <div className="overflow-auto w-full h-full flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            className="modal-image w-full h-auto max-h-[80vh] object-contain transition-transform cursor-zoom-in"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
