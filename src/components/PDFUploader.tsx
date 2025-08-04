import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const PDFUploader = ({ onFileSelect, isLoading }: PDFUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');

    if (pdfFile) {
      onFileSelect(pdfFile);
      toast({
        title: "PDF загружен",
        description: `Файл "${pdfFile.name}" готов к анализу`,
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите PDF файл",
        variant: "destructive",
      });
    }
  }, [onFileSelect, toast]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
      toast({
        title: "PDF загружен",
        description: `Файл "${file.name}" готов к анализу`,
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите PDF файл",
        variant: "destructive",
      });
    }
  }, [onFileSelect, toast]);

  return (
    <Card className={`
      relative overflow-hidden transition-all duration-300 ease-in-out
      ${isDragOver ? 'border-pdf-primary bg-pdf-primary/5 scale-[1.02]' : 'border-dashed border-2 border-gray-200 hover:border-pdf-primary/50'}
      ${isLoading ? 'opacity-50 pointer-events-none' : ''}
    `}>
      <div
        className="p-12 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className={`
            p-6 rounded-full transition-all duration-300
            ${isDragOver ? 'bg-pdf-primary text-white scale-110' : 'bg-pdf-surface text-pdf-primary'}
          `}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Перетащите PDF файл сюда
            </h3>
            <p className="text-gray-600 mb-4">
              или нажмите для выбора файла
            </p>
            
            <Button
              variant="default"
              className="bg-gradient-to-r from-pdf-primary to-pdf-accent hover:from-pdf-primary-hover hover:to-pdf-accent/90 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              disabled={isLoading}
            >
              <FileText className="w-5 h-5 mr-2" />
              {isLoading ? 'Обработка...' : 'Выбрать PDF файл'}
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            Поддерживаются файлы до 10 MB
          </div>
        </div>

        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />
      </div>

      {/* Gradient overlay for visual enhancement */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-pdf-accent/5 pointer-events-none" />
    </Card>
  );
};