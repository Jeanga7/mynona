'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Hash, Clock, Users } from 'lucide-react';
import { Room } from '@/types/chat';
import { ChatService } from '@/services/chat';
import { CreateRoomModal } from './CreateRoomModal';

interface RoomListProps {
  onRoomSelect: (room: Room) => void;
  currentRoom: Room | null;
}

export const RoomList: React.FC<RoomListProps> = ({ onRoomSelect, currentRoom }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'public' | 'ephemeral'>('public');

  useEffect(() => {
    const unsubscribe = ChatService.subscribeToRooms((rooms) => {
      setRooms(rooms);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredRooms = rooms.filter(room => room.type === activeTab);

  const formatRoomDate = (date: any) => {
    const now = new Date();
    const roomDate = date instanceof Date ? date : date.toDate();
    const diffInHours = (now.getTime() - roomDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return roomDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const getRoomExpiryTime = (room: Room) => {
    if (!room.expiresAt) return null;
    
    const expiryDate = room.expiresAt instanceof Date ? room.expiresAt : room.expiresAt.toDate();
    const now = new Date();
    const diffInHours = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 0) return 'Expiré';
    if (diffInHours < 1) return `${Math.floor(diffInHours * 60)} min`;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return `${Math.floor(diffInHours / 24)}j`;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Salons
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'public'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Publics
          </button>
          <button
            onClick={() => setActiveTab('ephemeral')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'ephemeral'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Éphémères
          </button>
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p>Aucun salon {activeTab === 'public' ? 'public' : 'éphémère'}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
            >
              Créer un salon
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  currentRoom?.id === room.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    room.type === 'ephemeral' 
                      ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  }`}>
                    {room.type === 'ephemeral' ? <Clock size={16} /> : <Hash size={16} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-800 dark:text-white truncate">
                        {room.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Users size={12} />
                        <span>{room.memberCount}</span>
                      </div>
                    </div>
                    
                    {room.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                        {room.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRoomDate(room.createdAt)}
                      </span>
                      
                      {room.type === 'ephemeral' && room.expiresAt && (
                        <span className={`text-xs font-medium ${
                          getRoomExpiryTime(room) === 'Expiré' 
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-orange-500 dark:text-orange-400'
                        }`}>
                          {getRoomExpiryTime(room)}
                        </span>
                      )}
                    </div>
                    
                    {room.lastMessage && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <p className="text-gray-600 dark:text-gray-300 truncate">
                          {room.lastMessage.content}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(room) => {
            onRoomSelect(room);
            setShowCreateModal(false);
          }}
          defaultType={activeTab}
        />
      )}
    </div>
  );
};
