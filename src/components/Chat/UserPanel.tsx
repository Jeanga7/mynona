'use client';

import React, { useState } from 'react';
import { User, LogOut, Settings, Moon, Sun, Globe, Volume2, VolumeX } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { AuthService } from '@/services/auth';

export const UserPanel: React.FC = () => {
  const { user } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.displayName || '');
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) return;
    
    try {
      await AuthService.updateUsername(newUsername.trim());
      setIsEditingUsername(false);
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  const handleSignOut = async () => {
    await AuthService.signOut();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // TODO: Implement dark mode logic
    document.documentElement.classList.toggle('dark');
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    // TODO: Implement sound logic
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowDropdown(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      {/* User Info */}
      <div className="flex items-center space-x-3">
        <img
          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
          alt={user.displayName || 'User'}
          className="w-10 h-10 rounded-full"
        />
        
        <div className="flex-1 min-w-0">
          {isEditingUsername ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUsernameUpdate();
                  if (e.key === 'Escape') {
                    setIsEditingUsername(false);
                    setNewUsername(user.displayName || '');
                  }
                }}
              />
              <button
                onClick={handleUsernameUpdate}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setIsEditingUsername(false);
                  setNewUsername(user.displayName || '');
                }}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white truncate">
                  {user.displayName || 'Anonymous User'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.isAnonymous ? 'Invité' : 'Utilisateur'}
                </p>
              </div>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Settings size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-50"
          onClick={handleBackdropClick}
        >
          <div className="absolute top-16 left-4 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {user.displayName || 'Anonymous User'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.isAnonymous ? 'Invité' : 'Utilisateur'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  setIsEditingUsername(true);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <User size={16} />
                <span>Modifier le pseudo</span>
              </button>

              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span>{darkMode ? 'Mode clair' : 'Mode sombre'}</span>
              </button>

              <button
                onClick={toggleSound}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{soundEnabled ? 'Son activé' : 'Son désactivé'}</span>
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Status */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            En ligne
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {user.isAnonymous ? 'Mode invité' : 'Compte vérifié'}
        </div>
      </div>
    </div>
  );
};
