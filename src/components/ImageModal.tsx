
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ImageModalProps {
  src: string;
  alt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[150px] sm:max-h-[200px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
        />
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[80vh] object-contain"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
