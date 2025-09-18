'use client';

import React from 'react';

interface MessageReactionProps {
  emoji: string;
  count: number;
  onReaction: () => void;
}

export const MessageReaction: React.FC<MessageReactionProps> = ({ 
  emoji, 
  count, 
  onReaction 
}) => {
  return (
    <button
      onClick={onReaction}
      className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm transition-colors"
    >
      <span>{emoji}</span>
      <span className="text-xs text-gray-600 dark:text-gray-300">
        {count}
      </span>
    </button>
  );
};
