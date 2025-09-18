'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { ChatService } from '@/services/chat';
import { AuthService } from '@/services/auth';
import { Message } from '@/types/chat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { RoomList } from './RoomList';
import { UserPanel } from './UserPanel';
import { OfflineIndicator } from './OfflineIndicator';

export const ChatContainer: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { 
    currentRoom, 
    messages, 
    setMessages, 
    setCurrentRoom, 
    isOffline, 
    pendingMessages,
    setOffline,
    setPendingMessages 
  } = useChatStore();
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Vérifier l'état de connexion
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initialiser l'authentification
    const unsubscribeAuth = AuthService.onAuthStateChanged((user) => {
      if (user) {
        useAuthStore.getState().setUser(user);
      } else {
        useAuthStore.getState().setUser(null);
      }
    });

    setIsInitialized(true);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!currentRoom) return;
    
    // S'abonner aux messages du salon
    const unsubscribeMessages = ChatService.subscribeToMessages(
      currentRoom.id,
      (messages) => {
        setMessages(messages);
      }
    );
    
    return () => {
      unsubscribeMessages();
    };
  }, [currentRoom, setMessages]);

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'voice' | 'file', file?: File) => {
    if (!currentRoom || !user) return;
    
    try {
      if (isOffline) {
        // Sauvegarder le message pour envoi ultérieur
        ChatService.saveOfflineMessage({
          content,
          authorId: user.uid,
          roomId: currentRoom.id,
          createdAt: new Date(),
          type,
          mediaUrl: file ? URL.createObjectURL(file) : undefined,
          fileName: file?.name,
          fileSize: file?.size,
        });
        setPendingMessages(pendingMessages + 1);
      } else {
        await ChatService.sendMessage(currentRoom.id, content, type, file);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleRoomSelect = (room: any) => {
    setCurrentRoom(room);
  };

  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            Bienvenue sur MyNona
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Rejoignez le chat anonymement en un clic
          </p>
          <button
            onClick={() => AuthService.signInAsGuest()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Rejoindre en tant qu'invité
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <UserPanel />
        <RoomList onRoomSelect={handleRoomSelect} currentRoom={currentRoom} />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {currentRoom.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentRoom.description}
              </p>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <MessageList messages={messages} currentUserId={user.uid} />
            </div>
            
            {/* Message Input */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>Sélectionnez un salon pour commencer à chatter</p>
          </div>
        )}
      </div>
      
      {/* Offline Indicator */}
      <OfflineIndicator isOffline={isOffline} pendingMessages={pendingMessages} />
    </div>
  );
};
