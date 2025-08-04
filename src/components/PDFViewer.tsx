import { useState } from 'react';
import { FileText, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PDFViewerProps {
  file: File;
  onAnalyze: () => void;
}

export const PDFViewer = ({ file, onAnalyze }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);
  
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

          <Button
            onClick={onAnalyze}
            className="bg-gradient-to-r from-pdf-primary to-pdf-accent text-white hover:from-pdf-primary-hover hover:to-pdf-accent/90 transition-all duration-300"
          >
            Анализировать PDF
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 bg-gray-100 p-4 overflow-auto">
        <Card className="bg-white shadow-lg max-w-fit mx-auto">
          <div 
            className="pdf-preview p-8 bg-white"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* PDF Preview Placeholder */}
            <div className="w-[595px] h-[842px] bg-white border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
              
              {/* Mock PDF Content */}
              <div className="relative z-10 p-12 space-y-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                
                <div className="space-y-2">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-3 bg-gray-100 rounded"
                      style={{ width: `${Math.random() * 40 + 60}%` }}
                    />
                  ))}
                </div>

                <div className="space-y-2 mt-8">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-3 bg-gray-100 rounded"
                      style={{ width: `${Math.random() * 30 + 70}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* PDF Watermark */}
              <div className="absolute bottom-4 right-4 text-gray-400 text-xs">
                {file.name}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};