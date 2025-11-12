
import React from 'react';
import ImageCard from './ImageCard';

interface ImageGridProps {
  images: string[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
      {images.map((src, index) => (
        <ImageCard key={index} src={src} index={index} />
      ))}
    </div>
  );
};

export default ImageGrid;
