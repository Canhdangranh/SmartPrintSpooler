import React, { useState, useRef } from 'react';
import { Upload, Printer, FileStack, AlertTriangle, CheckCircle, Download, Trash2 } from 'lucide-react';
import { Button } from './components/Button';
import { FileItem } from './components/FileItem';
import { DocFile, ProcessingState } from './types';
import { processFilesToPdf } from './services/docProcessor';
import { clsx } from 'clsx';

function App() {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    currentStep: '',
    progress: 0,
  });
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles: DocFile[] = Array.from(event.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAllFiles = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent accidental form submission behavior
    if (files.length === 0) return;
    
    // No confirmation dialog, immediate action
    setFiles([]);
    setMergedPdfUrl(null);
    setProcessing({
      isProcessing: false,
      currentStep: '',
      progress: 0,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGeneratePdf = async () => {
    if (files.length === 0) return;

    setProcessing({ isProcessing: true, currentStep: 'Khởi động...', progress: 0 });
    setMergedPdfUrl(null);

    try {
      const pdfBytes = await processFilesToPdf(files, (msg, percent) => {
        setProcessing({
          isProcessing: true,
          currentStep: msg,
          progress: percent
        });
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      setProcessing({ isProcessing: false, currentStep: 'Hoàn tất!', progress: 100 });
      
    } catch (error) {
      console.error(error);
      setProcessing({
        isProcessing: false,
        currentStep: 'Lỗi xảy ra trong quá trình xử lý.',
        progress: 0
      });
      alert("Có lỗi xảy ra khi tạo PDF. Vui lòng kiểm tra lại file PDF đầu vào.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Printer size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              SmartPrint Spooler
            </h1>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">
            Powered by React
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Empty State */}
        {files.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-white">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <Upload size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Tải lên file PDF
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Hệ thống sẽ tự động ghép các file PDF và thêm trang trắng vào file có số trang lẻ để in 2 mặt không bị lỗi.
            </p>
            <Button onClick={() => fileInputRef.current?.click()} size="lg">
              Chọn File PDF
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: File List */}
          {files.length > 0 && (
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileStack size={20} className="text-gray-500" />
                  Danh sách in ({files.length})
                </h2>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFiles}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Xóa hết
                  </Button>
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + Thêm file
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <FileItem 
                    key={file.id} 
                    file={file} 
                    index={index} 
                    onRemove={removeFile} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Right Column: Actions & Status */}
          {files.length > 0 && (
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Processing Status Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Trạng thái
                  </h3>

                  {processing.isProcessing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Tiến độ</span>
                        <span className="font-medium text-indigo-600">{Math.round(processing.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processing.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-center animate-pulse">
                        {processing.currentStep}
                      </p>
                    </div>
                  ) : mergedPdfUrl ? (
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Đã xong!</p>
                        <p className="text-xs text-gray-500">File PDF đã sẵn sàng để in.</p>
                      </div>
                      <a 
                        href={mergedPdfUrl} 
                        download="print-job-ready.pdf"
                        className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <Download size={18} className="mr-2" />
                        Tải PDF về
                      </a>
                      <Button variant="ghost" size="sm" onClick={() => setMergedPdfUrl(null)}>
                        Làm lại
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="flex gap-2">
                          <AlertTriangle className="text-blue-500 shrink-0" size={16} />
                          <p className="text-xs text-blue-700">
                            Hệ thống sẽ tự động phát hiện số trang lẻ và chèn trang trắng vào cuối file để đảm bảo in 2 mặt chính xác.
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleGeneratePdf} 
                        className="w-full py-3"
                      >
                        Xử lý & Xuất PDF
                      </Button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf"
        multiple
      />
    </div>
  );
}

export default App;