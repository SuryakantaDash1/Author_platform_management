import { useState } from 'react';
import { validateFileSize, validateFileType } from '../utils/validators';

interface UseFileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

interface UseFileUploadReturn {
  files: File[];
  uploading: boolean;
  progress: number;
  error: string | null;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  setError: (error: string | null) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes, multiple = false } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [uploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);

    // Validate files
    for (const file of filesArray) {
      const sizeError = validateFileSize(file, maxSize / (1024 * 1024));
      if (sizeError) {
        setError(sizeError);
        return;
      }

      if (allowedTypes) {
        const typeError = validateFileType(file, allowedTypes);
        if (typeError) {
          setError(typeError);
          return;
        }
      }
    }

    setError(null);

    if (multiple) {
      setFiles((prev) => [...prev, ...filesArray]);
    } else {
      setFiles(filesArray);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const clearFiles = () => {
    setFiles([]);
    setProgress(0);
    setError(null);
  };

  return {
    files,
    uploading,
    progress,
    error,
    handleFileSelect,
    removeFile,
    clearFiles,
    setError,
  };
};
