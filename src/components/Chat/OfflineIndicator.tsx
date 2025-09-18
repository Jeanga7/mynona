'use client';

import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';

interface OfflineIndicatorProps {
  isOffline: boolean;
  pendingMessages: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  isOffline, 
  pendingMessages 
}) => {
  if (!isOffline && pendingMessages === 0) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${
      isOffline 
        ? 'bg-orange-500 text-white' 
        : 'bg-blue-500 text-white'
    } rounded-lg shadow-lg p-3 flex items-center space-x-2 min-w-[200px]`}>
      {isOffline ? (
        <WifiOff size={20} />
      ) : (
        <Wifi size={20} />
      )}
      
      <div className="flex-1">
        <p className="text-sm font-medium">
          {isOffline ? 'Mode hors-ligne' : 'En ligne'}
        </p>
        {pendingMessages > 0 && (
          <p className="text-xs opacity-90">
            {pendingMessages} message{pendingMessages > 1 ? 's' : ''} en attente
          </p>
        )}
      </div>
      
      {pendingMessages > 0 && (
        <div className="bg-white bg-opacity-20 rounded-full px-2 py-1">
          <Clock size={16} />
        </div>
      )}
    </div>
  );
};
