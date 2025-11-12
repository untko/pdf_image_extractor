
import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ImageGrid from './components/ImageGrid';
import Spinner from './components/Spinner';
import { Header } from './components/Header';
import { StatusDisplay } from './components/StatusDisplay';

// pdf.js is loaded from a CDN, so we declare it to TypeScript
declare const pdfjsLib: any;

const App: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string>('');

  const resetState = () => {
    setImages([]);
    setPdfName(null);
    setError(null);
    setIsLoading(false);
    setProcessingMessage('');
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF file.');
      return;
    }
    
    resetState();
    setIsLoading(true);
    setPdfName(file.name);
    setProcessingMessage('Reading PDF file...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        try {
          const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
          
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          const extractedImages: string[] = [];
          
          setProcessingMessage(`Processing ${pdf.numPages} pages...`);

          for (let i = 1; i <= pdf.numPages; i++) {
            setProcessingMessage(`Scanning page ${i} of ${pdf.numPages}...`);
            const page = await pdf.getPage(i);
            const operatorList = await page.getOperatorList();
            
            for (let j = 0; j < operatorList.fnArray.length; j++) {
                if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                    const imageName = operatorList.argsArray[j][0];
                    const image = await page.objs.get(imageName);

                    if (image && image.data) {
                      const canvas = document.createElement('canvas');
                      canvas.width = image.width;
                      canvas.height = image.height;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        const imageData = ctx.createImageData(image.width, image.height);
                        
                        // Handle different image color spaces (e.g., RGB, CMYK, Grayscale)
                        if (image.data.length === image.width * image.height * 3) { // RGB
                          let k = 0;
                          for (let l = 0; l < image.data.length; l += 3) {
                            imageData.data[k++] = image.data[l];
                            imageData.data[k++] = image.data[l + 1];
                            imageData.data[k++] = image.data[l + 2];
                            imageData.data[k++] = 255; // Alpha
                          }
                        } else if (image.data.length === image.width * image.height) { // Grayscale
                          let k = 0;
                          for (let l = 0; l < image.data.length; l++) {
                            imageData.data[k++] = image.data[l];
                            imageData.data[k++] = image.data[l];
                            imageData.data[k++] = image.data[l];
                            imageData.data[k++] = 255;
                          }
                        } else { // Assume RGBA or something we can directly copy
                           imageData.data.set(image.data);
                        }

                        ctx.putImageData(imageData, 0, 0);
                        extractedImages.push(canvas.toDataURL('image/png'));
                      }
                    }
                }
            }
          }
          setImages(extractedImages);
          if (extractedImages.length === 0) {
              setProcessingMessage('No images found in the PDF.');
          } else {
              setProcessingMessage('');
          }
        } catch (e) {
          console.error(e);
          setError('Failed to process PDF. The file might be corrupted or in an unsupported format.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
        setIsLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col antialiased">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        {images.length === 0 && !isLoading && !error && (
            <FileUpload onFileSelect={handleFileSelect} />
        )}

        {(isLoading || error || images.length > 0 || pdfName) && (
            <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700">
                <StatusDisplay 
                    pdfName={pdfName} 
                    imageCount={images.length} 
                    isLoading={isLoading}
                    error={error}
                    processingMessage={processingMessage}
                    onReset={resetState}
                />

                {isLoading && <Spinner message={processingMessage} />}
                
                {!isLoading && error && (
                    <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
                        <p className="font-semibold">An Error Occurred</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {!isLoading && !error && images.length > 0 && (
                    <ImageGrid images={images} />
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
