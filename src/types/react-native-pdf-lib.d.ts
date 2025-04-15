declare module 'react-native-pdf-lib' {
  export interface TextOptions {
    x?: number;
    y?: number;
    color?: string;
    fontSize?: number;
    fontName?: string;
  }

  export interface ImageOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }

  export interface PDFPage {
    drawText: (text: string, options: TextOptions) => PDFPage;
    drawImage: (path: string, options: ImageOptions) => Promise<PDFPage>;
    setMediaBox: (width: number, height: number) => PDFPage;
  }

  export interface PDFDocument {
    addPages: (...pages: PDFPage[]) => PDFDocument;
    write: (path?: string) => Promise<string>;
  }

  export const PDFPage: {
    create: () => PDFPage;
  };

  export const PDFDocument: {
    create: (path?: string) => PDFDocument;
  };

  export default {
    PDFDocument,
    PDFPage,
  };
}