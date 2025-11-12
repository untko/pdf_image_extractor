
import React from 'react';
import { ImageIcon } from './icons/ImageIcon';

export const Header: React.FC = () => {
    return (
        <header className="w-full p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
            <div className="container mx-auto flex items-center gap-3">
                <ImageIcon className="w-8 h-8 text-indigo-400"/>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    PDF Image Extractor
                </h1>
            </div>
        </header>
    );
};
