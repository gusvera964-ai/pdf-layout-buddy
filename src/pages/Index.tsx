import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { PDFUploader } from '@/components/PDFUploader';
import { PDFViewer } from '@/components/PDFViewer';
import { PDFAnalysisPanel } from '@/components/PDFAnalysisPanel';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowAnalysis(false);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setShowAnalysis(true);
    
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  if (selectedFile && showAnalysis) {
    return (
      <div className="h-screen flex">
        {/* PDF Viewer */}
        <div className="flex-1 border-r border-gray-200">
          <PDFViewer file={selectedFile} onAnalyze={handleAnalyze} />
        </div>
        
        {/* Analysis Panel */}
        <div className="w-96 bg-white">
          <PDFAnalysisPanel 
            fileName={selectedFile.name} 
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>
    );
  }

  if (selectedFile) {
    return (
      <div className="h-screen">
        <PDFViewer file={selectedFile} onAnalyze={handleAnalyze} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pdf-surface via-white to-pdf-surface-alt">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-pdf-primary to-pdf-accent rounded-lg shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PDF Analyzer</h1>
              <p className="text-sm text-gray-600">Анализируйте и общайтесь с PDF документами</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-pdf-primary to-pdf-accent rounded-2xl shadow-xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Теперь вы можете анализировать<br />
            <span className="bg-gradient-to-r from-pdf-primary to-pdf-accent bg-clip-text text-transparent">
              и общаться с PDF
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Загрузите PDF документ и получите умный анализ содержания. 
            Задавайте вопросы и получайте точные ответы на основе текста документа.
          </p>
        </div>

        {/* Instructions */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-pdf-accent text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Загрузите PDF</h3>
            <p className="text-gray-600 text-sm">Просто перетащите файл или нажмите для выбора</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-pdf-accent text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Получите анализ</h3>
            <p className="text-gray-600 text-sm">ИИ проанализирует содержание и создаст резюме</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-pdf-accent text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Задавайте вопросы</h3>
            <p className="text-gray-600 text-sm">Общайтесь с документом и получайте ответы</p>
          </div>
        </div>

        {/* File Uploader */}
        <div className="max-w-2xl mx-auto">
          <PDFUploader onFileSelect={handleFileSelect} />
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🎯', title: 'Точный анализ', desc: 'Глубокий анализ содержания PDF' },
            { icon: '💬', title: 'Умный чат', desc: 'Задавайте вопросы о документе' },
            { icon: '📊', title: 'Статистика', desc: 'Подсчет слов, страниц и времени чтения' },
            { icon: '🔒', title: 'Безопасность', desc: 'Ваши файлы обрабатываются локально' }
          ].map((feature, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
