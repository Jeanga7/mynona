import { DocumentData, Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  username: string;
  avatar: string;
  isAnonymous: boolean;
  createdAt: Timestamp;
  lastSeen: Timestamp;
  isOnline: boolean;
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  author: User;
  roomId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  reactions: MessageReaction[];
  isEdited: boolean;
  isDeleted: boolean;
  type: 'text' | 'image' | 'voice' | 'file';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  translatedContent?: { [lang: string]: string };
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: Timestamp;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'ephemeral';
  createdBy: string;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  memberCount: number;
  lastMessage?: Message;
  isPrivate: boolean;
}

export interface UserPresence {
  userId: string;
  roomId: string;
  isTyping: boolean;
  lastSeen: Timestamp;
}

export interface OfflineMessage {
  id: string;
  content: string;
  authorId: string;
  roomId: string;
  createdAt: Date;
  type: 'text' | 'image' | 'voice' | 'file';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface NotificationSettings {
  mentions: boolean;
  messages: boolean;
  sound: boolean;
  desktop: boolean;
}

export interface UserSettings {
  language: 'fr' | 'en' | 'auto';
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  autoTranslate: boolean;
  textToSpeech: boolean;
}
