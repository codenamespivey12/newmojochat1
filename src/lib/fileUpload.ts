// File upload utilities for sixtyoneeighty chat

import { supabase } from './supabase';

export interface FileUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class FileUploadService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/json',
    'text/csv',
  ];

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported',
      };
    }

    return { valid: true };
  }

  static async uploadFile(
    file: File,
    chatId: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `chat-files/${chatId}/${fileName}`;

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async uploadMultipleFiles(
    files: File[],
    chatId: string,
    onProgress?: (fileIndex: number, progress: FileUploadProgress) => void
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.uploadFile(
          file,
          chatId,
          onProgress ? (progress) => onProgress(i, progress) : undefined
        );
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  static async deleteFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('chat-attachments')
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  static getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📄';
    if (fileType.includes('json')) return '📋';
    if (fileType.includes('csv')) return '📊';
    return '📎';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  static async getFileContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch file content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// React hook for file uploads
export const useFileUpload = () => {
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});

  const uploadFile = React.useCallback(async (
    file: File,
    chatId: string
  ): Promise<FileUploadResult> => {
    setUploading(true);
    
    try {
      const result = await FileUploadService.uploadFile(
        file,
        chatId,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress.percentage,
          }));
        }
      );

      // Clear progress for this file
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });

      return result;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultipleFiles = React.useCallback(async (
    files: File[],
    chatId: string
  ): Promise<FileUploadResult[]> => {
    setUploading(true);
    
    try {
      return await FileUploadService.uploadMultipleFiles(
        files,
        chatId,
        (fileIndex, progress) => {
          const fileName = files[fileIndex]?.name;
          if (fileName) {
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: progress.percentage,
            }));
          }
        }
      );
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles,
  };
};

// Import React for hooks
import React from 'react';
