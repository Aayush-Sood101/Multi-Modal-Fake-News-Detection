'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection, FileError } from 'react-dropzone';
import { Upload, FileText, Music, Video, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: {
    'text/*'?: string[];
    'audio/*'?: string[];
    'video/*'?: string[];
  };
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 100 * 1024 * 1024,
  acceptedTypes = {
    'text/*': ['.txt', '.pdf', '.docx'],
    'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
    'video/*': ['.mp4', '.avi', '.mov', '.webm'],
  },
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setErrors([]);
      const newErrors: string[] = [];

      // Handle rejected files
      rejectedFiles.forEach((rejected) => {
        if (rejected.errors) {
          rejected.errors.forEach((error: FileError) => {
            if (error.code === 'file-too-large') {
              newErrors.push(
                `${rejected.file.name} is too large. Max size: ${maxSize / (1024 * 1024)}MB`
              );
            } else if (error.code === 'file-invalid-type') {
              newErrors.push(`${rejected.file.name} is not a supported file type`);
            } else {
              newErrors.push(`${rejected.file.name}: ${error.message}`);
            }
          });
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
        return;
      }

      // Add preview URLs and IDs for files
      const filesWithPreview = acceptedFiles.map((file) => {
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: `${file.name}-${Date.now()}-${Math.random()}`,
        });
        return fileWithPreview;
      });

      const updatedFiles = [...files, ...filesWithPreview].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    },
    [files, maxFiles, maxSize, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes,
    multiple: maxFiles > 1,
  });

  const removeFile = (fileId: string) => {
    const newFiles = files.filter((f) => (f as FileWithPreview).id !== fileId);
    setFiles(newFiles);
    onFilesSelected(newFiles);
    setErrors([]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('text/')) return <FileText className="h-8 w-8" />;
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8" />;
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Supports text, audio, and video files (max {maxSize / (1024 * 1024)}MB)
            </p>
          </>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Selected Files</h3>
            <span className="text-xs text-muted-foreground">{files.length} / {maxFiles}</span>
          </div>
          <div className="space-y-2">
            {files.map((file) => {
              const fileWithPreview = file as FileWithPreview;
              return (
                <div
                  key={fileWithPreview.id}
                  className="group flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 text-primary">{getFileIcon(file)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <button
                      onClick={() => removeFile(fileWithPreview.id!)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
