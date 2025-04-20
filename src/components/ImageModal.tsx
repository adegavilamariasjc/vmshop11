
import React from 'react';
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
  return (
    <Dialog>
      <DialogTrigger asChild>
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
