import { create } from 'zustand';
import { Message, Room, UserPresence } from '@/types/chat';

interface ChatState {
  // Messages
  messages: Message[];
  currentRoom: Room | null;
  rooms: Room[];
  
  // UI State
  isLoading: boolean;
  isOffline: boolean;
  pendingMessages: number;
  typingUsers: string[];
  
  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setCurrentRoom: (room: Room | null) => void;
  setRooms: (rooms: Room[]) => void;
  setLoading: (loading: boolean) => void;
  setOffline: (offline: boolean) => void;
  setPendingMessages: (count: number) => void;
  setTypingUsers: (users: string[]) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Initial state
  messages: [],
  currentRoom: null,
  rooms: [],
  isLoading: false,
  isOffline: false,
  pendingMessages: 0,
  typingUsers: [],
  
  // Actions
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setRooms: (rooms) => set({ rooms }),
  setLoading: (loading) => set({ isLoading: loading }),
  setOffline: (offline) => set({ isOffline: offline }),
  setPendingMessages: (count) => set({ pendingMessages: count }),
  setTypingUsers: (users) => set({ typingUsers: users }),
  addTypingUser: (userId) => set((state) => ({
    typingUsers: state.typingUsers.includes(userId) 
      ? state.typingUsers 
      : [...state.typingUsers, userId]
  })),
  removeTypingUser: (userId) => set((state) => ({
    typingUsers: state.typingUsers.filter(id => id !== userId)
  })),
}));
