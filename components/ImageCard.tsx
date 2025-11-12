
import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageCardProps {
  src: string;
  index: number;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, index }) => {
  return (
    <div className="group relative aspect-square bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <img
        src={src}
        alt={`Extracted image ${index + 1}`}
        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <a
          href={src}
          download={`image_${index + 1}.png`}
          className="flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-full hover:bg-indigo-500 transition-colors duration-200 transform hover:scale-110"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>Download</span>
        </a>
      </div>
    </div>
  );
};

export default ImageCard;
