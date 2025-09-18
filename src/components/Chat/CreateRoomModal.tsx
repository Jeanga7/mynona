'use client';

import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { X, Hash, Clock, Users } from 'lucide-react';
import { Room } from '@/types/chat';
import { ChatService } from '@/services/chat';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (room: Room) => void;
  defaultType: 'public' | 'ephemeral';
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ 
  onClose, 
  onCreate, 
  defaultType 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'ephemeral'>(defaultType);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setIsCreating(true);
    try {
      const roomRef = await ChatService.createRoom(name.trim(), description.trim(), type);
      
      // Créer un objet Room temporaire pour le callback
      const newRoom: Room = {
        id: roomRef.id,
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        createdBy: 'current-user', // Sera remplacé par l'ID réel
        createdAt: Timestamp.now(),
        memberCount: 1,
        isPrivate: false,
        ...(type === 'ephemeral' && {
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        }),
      };
      
      onCreate(newRoom);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Créer un salon
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Room Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de salon
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('public')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  type === 'public'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Hash className="mx-auto mb-1 text-green-600 dark:text-green-400" size={20} />
                <span className="text-sm font-medium text-gray-800 dark:text-white">Public</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Permanent
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setType('ephemeral')}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  type === 'ephemeral'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Clock className="mx-auto mb-1 text-orange-600 dark:text-orange-400" size={20} />
                <span className="text-sm font-medium text-gray-800 dark:text-white">Éphémère</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  24 heures
                </p>
              </button>
            </div>
          </div>

          {/* Room Name */}
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du salon *
            </label>
            <input
              type="text"
              id="roomName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez un nom pour le salon"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
              required
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {name.length}/50 caractères
            </div>
          </div>

          {/* Room Description */}
          <div>
            <label htmlFor="roomDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optionnel)
            </label>
            <textarea
              id="roomDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le sujet de ce salon"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length}/200 caractères
            </div>
          </div>

          {/* Room Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Informations
              </span>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Le salon sera visible par tous les utilisateurs</li>
              <li>• Les utilisateurs pourront rejoindre librement</li>
              {type === 'ephemeral' && (
                <li>• Le salon sera automatiquement supprimé après 24 heures</li>
              )}
              <li>• Vous serez automatiquement ajouté comme membre</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isCreating}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Création...' : 'Créer le salon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
