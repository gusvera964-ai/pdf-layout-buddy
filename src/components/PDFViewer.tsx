import { useState, useRef, useEffect } from 'react';
import { FileText, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getDocument, GlobalWorkerOptions, PDFPageProxy } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface PDFViewerProps {
  file: File;
  onAnalyze: () => void;
  onLoad?: (info: {
    text: string;
    numPages: number;
    wordCount: number;
    readingTime: number;
  }) => void;
}

export const PDFViewer = ({ file, onAnalyze, onLoad }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState<PDFPageProxy | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(workerSrc);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const firstPage = await pdf.getPage(1);
      setPage(firstPage);
      await renderPage(firstPage, zoom / 100);

      // Extract text and metadata
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const p = await pdf.getPage(i);
        const content = await p.getTextContent();
        const textItems = content.items as TextItem[];
        text += textItems.map((item) => item.str).join(' ') + ' ';
      }
      const words = text.trim().split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const readingTime = Math.ceil(wordCount / 200);
      onLoad?.({ text, numPages: pdf.numPages, wordCount, readingTime });
    };
    loadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    if (page) {
      renderPage(page, zoom / 100);
    }
  }, [zoom, page]);

  const renderPage = async (p: PDFPageProxy, scale: number) => {
    const viewport = p.getViewport({ scale });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await p.render({ canvasContext: context, viewport }).promise;
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* PDF Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pdf-primary/10 rounded-lg">
            <FileText className="w-5 h-5 text-pdf-primary" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 truncate max-w-64">
              {file.name}
            </h3>
            <p className="text-sm text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-sm text-gray-600 min-w-12 text-center">
            {zoom}%
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 25))}
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              onClick={onAnalyze}
              variant="pdf"
              size="sm"
            >
              Перевести
            </Button>

            <Button
              onClick={onAnalyze}
              variant="pdf"
              size="sm"
            >
              Спросить
            </Button>

            <Button
              onClick={onAnalyze}
              variant="pdf"
              size="sm"
            >
              Резюме
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 bg-gray-100 p-4 overflow-auto">
        <Card className="bg-white shadow-lg max-w-fit mx-auto">
          <canvas ref={canvasRef} />
        </Card>
      </div>
    </div>
  );
};

