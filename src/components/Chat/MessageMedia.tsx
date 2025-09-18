'use client';

import React, { useState } from 'react';
import { Download, Play, Pause, FileText, Image as ImageIcon } from 'lucide-react';

interface MessageMediaProps {
  type: 'image' | 'voice' | 'file';
  url: string;
  fileName?: string;
  fileSize?: number;
}

export const MessageMedia: React.FC<MessageMediaProps> = ({ 
  type, 
  url, 
  fileName, 
  fileSize 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'file';
    link.click();
  };

  const handleAudioPlay = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const getFileIcon = () => {
    if (type === 'image') return <ImageIcon size={24} />;
    if (type === 'voice') return <Play size={24} />;
    return <FileText size={24} />;
  };

  const renderImage = () => (
    <div className="mt-2">
      <img
        src={url}
        alt="Image partagée"
        className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(url, '_blank')}
      />
    </div>
  );

  const renderVoice = () => (
    <div className="mt-2">
      <audio
        ref={setAudioRef}
        src={url}
        onEnded={handleAudioEnded}
        className="hidden"
      />
      <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
        <button
          onClick={handleAudioPlay}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800 dark:text-white">
            Message vocal
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {fileSize ? formatFileSize(fileSize) : 'Audio'}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );

  const renderFile = () => (
    <div className="mt-2">
      <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
        <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
            {fileName || 'Fichier'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {fileSize ? formatFileSize(fileSize) : 'Fichier'}
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );

  switch (type) {
    case 'image':
      return renderImage();
    case 'voice':
      return renderVoice();
    case 'file':
      return renderFile();
    default:
      return null;
  }
};
