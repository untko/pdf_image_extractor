# PDF Image Extractor

A responsive, client-side web application that allows users to upload a PDF file and extracts all embedded images for easy viewing and downloading. The entire process happens in the browser, ensuring user privacy as no files are uploaded to a server.

## Features

- **Client-Side Processing:** All PDF parsing and image extraction is done directly in the user's browser.
- **Drag & Drop Upload:** A modern, user-friendly interface for uploading files.
- **Image Preview Grid:** Extracted images are displayed in a clean, responsive grid.
- **One-Click Download:** Each extracted image can be downloaded individually as a PNG file.
- **Progress Indicators:** The UI provides feedback during the extraction process.
- **PWA Ready:** Includes a service worker for offline capabilities.

## How It Works

The application leverages Mozilla's **`pdf.js`** library to parse and interpret PDF files on the client side. The core logic involves reading the low-level structure of a PDF page to identify and render image objects.

### The Extraction Process

1.  **File Input**: The user selects a PDF file. The application uses the `FileReader` API to read the file's content as an `ArrayBuffer`.

2.  **PDF Loading**: The `ArrayBuffer` is passed to `pdf.js`.
    ```javascript
    pdfjsLib.getDocument({ data: typedArray }).promise;
    ```
    This initializes the library and returns a `pdfDocument` object, which represents the parsed PDF.

3.  **Page Iteration**: The application iterates through every page of the document.

4.  **Operator List Analysis**: For each page, the application retrieves the **operator list** using `page.getOperatorList()`. A PDF's content is defined by a sequence of drawing commands called "operators" (e.g., draw line, set color, show text). The operator we are interested in is `paintImageXObject`, which is the command to draw an image on the page.

5.  **Image Discovery**: The code loops through the operator list. When it finds a `paintImageXObject` operator, it retrieves the corresponding arguments. The first argument is the internal name/reference of the image data (an "XObject") within the PDF's structure.

6.  **Data Retrieval**: Using this internal name, the raw image object is fetched via `page.objs.get(imageName)`. This object contains properties like `width`, `height`, and `data` (the raw pixel data).

7.  **Canvas Rendering**: The raw pixel data is not in a standard web format like PNG or JPEG. To make it viewable, it must be rendered onto a `<canvas>` element.
    *   A temporary canvas is created in memory with the image's dimensions.
    *   An `ImageData` object is created. This acts as a pixel buffer.
    *   The raw pixel data from the PDF image object is copied into the `ImageData` buffer. This step is critical and includes logic to handle different color spaces (like Grayscale and RGB) that PDFs support, converting them to the RGBA format required by the canvas.
    *   The `ImageData` is painted onto the canvas using `ctx.putImageData()`.

8.  **Data URL Conversion**: Once rendered on the canvas, `canvas.toDataURL('image/png')` is called. This converts the canvas content into a Base64-encoded PNG string. This string can be used directly as the `src` for an `<img>` tag.

9.  **UI Update**: The Base64 data URLs for all extracted images are stored in the React component's state, causing the UI to re-render and display the `ImageGrid`.

### Pseudo-Code of Core Logic

Here is a simplified, high-level representation of the extraction algorithm:

```
// Main Extraction Function
function extractImagesFromPDF(pdfFile):
  // 1. Read the file into a binary array
  binaryData = readFileAsArrayBuffer(pdfFile)
  
  // 2. Load the PDF with pdf.js
  pdfDocument = pdfjs.loadDocument(binaryData)

  extractedImages = []

  // 3. Loop through each page
  for pageNum from 1 to pdfDocument.numPages:
    page = pdfDocument.getPage(pageNum)
    
    // 4. Get the low-level drawing commands
    operatorList = page.getOperatorList()

    // 5. Find image-painting commands
    for i from 0 to operatorList.length:
      if operatorList.function[i] == "paintImageXObject":
        // Get the internal name of the image
        imageName = operatorList.arguments[i][0]
        
        // 6. Retrieve the raw image object
        rawImageObject = page.getImageObject(imageName)

        // 7 & 8. Convert the raw data to a displayable format
        imageDataURL = convertRawImageToDataURL(rawImageObject)
        
        // 9. Add to our list
        extractedImages.push(imageDataURL)
  
  return extractedImages


// Image Data Conversion Function
function convertRawImageToDataURL(rawImage):
  // Create a temporary canvas in memory
  canvas = create_canvas(rawImage.width, rawImage.height)
  context = canvas.getContext("2d")

  // Create an ImageData buffer for the canvas (requires RGBA)
  imageDataBuffer = context.createImageData(rawImage.width, rawImage.height)

  // Copy raw pixels into the buffer, converting color spaces
  // e.g., if raw data is RGB, we add an Alpha channel for every pixel.
  // e.g., if raw data is Grayscale, we set R, G, and B to the same value.
  copyAndConvertPixels(rawImage.data, imageDataBuffer.data)
  
  // Put the final pixel data onto the canvas
  context.putImageData(imageDataBuffer, 0, 0)

  // Export the canvas content as a Base64 PNG string
  return canvas.toDataURL("image/png")
```

## Technology Stack

-   **React**: For building the user interface.
-   **TypeScript**: For type safety and improved developer experience.
-   **Tailwind CSS**: For styling the application.
-   **pdf.js**: For client-side PDF parsing and rendering.

## Project Structure

```
.
├── components/         # Reusable React components
│   ├── icons/          # SVG icon components
│   ├── FileUpload.tsx  # Drag & drop upload area
│   ├── ImageCard.tsx   # Card for a single extracted image
│   ├── ImageGrid.tsx   # Grid layout for all images
│   └── ...
├── App.tsx             # Main application component with core logic
├── index.tsx           # Entry point for the React application
├── index.html          # Main HTML file
├── sw.js               # Service Worker for PWA functionality
└── README.md           # This file
```
