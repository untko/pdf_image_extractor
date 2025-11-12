
import React from 'react';
import { FileIcon } from './icons/FileIcon';
import { ResetIcon } from './icons/ResetIcon';

interface StatusDisplayProps {
    pdfName: string | null;
    imageCount: number;
    isLoading: boolean;
    error: string | null;
    processingMessage: string;
    onReset: () => void;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ pdfName, imageCount, isLoading, error, processingMessage, onReset }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3 text-gray-300">
                <FileIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                <span className="font-mono truncate" title={pdfName || ''}>{pdfName || 'No file selected'}</span>
            </div>
            <div className="flex items-center gap-4">
                {!isLoading && !error && imageCount > 0 && (
                     <div className="text-sm font-semibold text-green-400 bg-green-900/30 px-3 py-1 rounded-full">
                        {imageCount} image{imageCount !== 1 ? 's' : ''} found
                     </div>
                )}
                {!isLoading && !error && imageCount === 0 && pdfName && !processingMessage && (
                    <div className="text-sm font-semibold text-yellow-400 bg-yellow-900/30 px-3 py-1 rounded-full">
                        No images found
                    </div>
                )}
                <button 
                    onClick={onReset} 
                    className="flex items-center gap-2 text-sm bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    title="Process another PDF"
                >
                    <ResetIcon className="w-4 h-4"/>
                    <span>New PDF</span>
                </button>
            </div>
        </div>
    );
};
