'use client';

import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { MessageReaction } from './MessageReaction';
import { MessageMedia } from './MessageMedia';
import { MoreHorizontal, Edit2, Trash2, Flag } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isCurrentUser, 
  showAvatar 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleReaction = async (emoji: string) => {
    try {
      await ChatService.addReaction(message.id, emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleEdit = async () => {
    if (editedContent.trim() === '') return;
    
    try {
      await ChatService.updateMessage(message.id, editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await ChatService.deleteMessage(message.id);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleReport = () => {
    // TODO: Implement reporting functionality
    console.log('Report message:', message.id);
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEdit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
          />
          <button
            onClick={handleEdit}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="group relative">
        <p className="text-gray-800 dark:text-white">
          {message.content}
        </p>
        
        {/* Media content */}
        {message.mediaUrl && (
          <MessageMedia
            type={message.type}
            url={message.mediaUrl}
            fileName={message.fileName}
            fileSize={message.fileSize}
          />
        )}
        
        {/* Actions */}
        {isCurrentUser && (
          <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded shadow-lg p-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={handleReport}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-yellow-500"
                title="Report"
              >
                <Flag size={16} />
              </button>
            </div>
          </div>
        )}
        
        {/* Edited indicator */}
        {message.isEdited && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            (modifié)
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && (
          <div className={`flex-shrink-0 ${isCurrentUser ? 'ml-3' : 'mr-3'}`}>
            <img
              src={message.author.avatar}
              alt={message.author.username}
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}
        
        {/* Message content */}
        <div className={`${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'} rounded-lg px-4 py-2`}>
          {/* Username */}
          {showAvatar && (
            <div className={`text-xs font-semibold mb-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'}`}>
              {message.author.username}
            </div>
          )}
          
          {/* Content */}
          {renderContent()}
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {formatTime(new Date(message.createdAt))}
          </div>
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <MessageReaction
                  key={index}
                  emoji={reaction.emoji}
                  count={message.reactions.filter(r => r.emoji === reaction.emoji).length}
                  onReaction={() => handleReaction(reaction.emoji)}
                />
              ))}
            </div>
          )}
          
          {/* Quick reactions */}
          <div className="flex space-x-1 mt-2 opacity-0 hover:opacity-100 transition-opacity">
            {['👍', '😂', '❤️', '🔥'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-sm hover:bg-gray-300 dark:hover:bg-gray-600 rounded px-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
