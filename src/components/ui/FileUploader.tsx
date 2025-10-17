import { useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploaderProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

function FileUploader({ onUpload, accept = '.pdf', maxSize = 10 * 1024 * 1024 }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Validate file type (PDF only)
    if (selectedFile.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onUpload(selectedFile);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <motion.div
      className={`border-2 border-dashed p-8 rounded-lg text-center transition-colors ${
        isDragOver ? 'border-primary-500 bg-primary-50' : 
        isUploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
      whileHover={{ scale: isUploading ? 1 : 1.02 }}
      transition={{ duration: 0.3 }}
      onDrop={isUploading ? undefined : handleDrop}
      onDragOver={isUploading ? undefined : handleDragOver}
      onDragLeave={isUploading ? undefined : handleDragLeave}
    >
      <DocumentArrowUpIcon className={`h-12 w-12 mx-auto mb-4 ${
        isUploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'
      }`} />
      
      <div className="mb-4">
        <label className={isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}>
          <span className={`btn-primary ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isUploading ? 'Uploading...' : 'Choose File'}
          </span>
          <input
            type="file"
            accept={accept}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
      
      <p className={`text-gray-600 mb-2 ${isUploading ? 'text-blue-600' : ''}`}>
        {isUploading ? 'Processing your file...' : 'or drag and drop your file here'}
      </p>
      <p className="text-sm text-gray-500">
        PDF files only • Max {maxSize / (1024 * 1024)}MB
      </p>

      {file && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">{file.name}</p>
          {progress > 0 && progress < 100 && (
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-primary-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
            </div>
          )}
          {progress === 100 && (
            <p className="text-sm text-green-600 mt-2">✓ Upload complete</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default FileUploader;
