'use client';

import React from 'react';
import { useChatStore } from '@/store/chat';

export const TypingIndicator: React.FC = () => {
  const { typingUsers } = useChatStore();

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} est en train d'écrire...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} et ${typingUsers[1]} sont en train d'écrire...`;
    } else {
      return `${typingUsers.length} personnes sont en train d'écrire...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-gray-500 dark:text-gray-400">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm italic">{getTypingText()}</span>
    </div>
  );
};
