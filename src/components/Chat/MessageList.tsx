'use client';

import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const shouldShowDate = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    
    const currentDate = currentMessage.createdAt instanceof Date ? currentMessage.createdAt : currentMessage.createdAt.toDate();
    const previousDate = previousMessage.createdAt instanceof Date ? previousMessage.createdAt : previousMessage.createdAt.toDate();
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const messageDate = message.createdAt instanceof Date ? message.createdAt : message.createdAt.toDate();
      const date = messageDate.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date} className="space-y-2">
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
              {new Intl.DateTimeFormat('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }).format(new Date(date))}
            </div>
          </div>
          
          {/* Messages for this date */}
          {dateMessages.map((message, index) => {
            const previousMessage = index > 0 ? dateMessages[index - 1] : undefined;
            const isCurrentUser = message.authorId === currentUserId;
            const showAvatar = !previousMessage || previousMessage.authorId !== message.authorId;
            
            return (
              <div key={message.id}>
                {shouldShowDate(message, previousMessage) && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                      {formatMessageDate(message.createdAt instanceof Date ? message.createdAt : message.createdAt.toDate())}
                    </div>
                  </div>
                )}
                
                <MessageItem
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showAvatar={showAvatar}
                />
              </div>
            );
          })}
        </div>
      ))}
      
      <TypingIndicator />
      <div ref={messagesEndRef} />
    </div>
  );
};
