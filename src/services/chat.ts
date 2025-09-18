import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  getDoc,
  getDocs,
  limit,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Message, Room, UserPresence, OfflineMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

export class ChatService {
  // Messages
  static async sendMessage(roomId: string, content: string, type: 'text' | 'image' | 'voice' | 'file' = 'text', mediaFile?: File) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let mediaUrl = '';
    let fileName = '';
    let fileSize = 0;

    // Upload media file if provided
    if (mediaFile && type !== 'text') {
      const storageRef = ref(storage, `media/${roomId}/${uuidv4()}_${mediaFile.name}`);
      await uploadBytes(storageRef, mediaFile);
      mediaUrl = await getDownloadURL(storageRef);
      fileName = mediaFile.name;
      fileSize = mediaFile.size;
    }

    const messageData = {
      content,
      authorId: user.uid,
      roomId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reactions: [],
      isEdited: false,
      isDeleted: false,
      type,
      mediaUrl: mediaUrl || undefined,
      fileName: fileName || undefined,
      fileSize: fileSize || undefined,
    };

    return await addDoc(collection(db, 'messages'), messageData);
  }

  static async updateMessage(messageId: string, content: string) {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      content,
      updatedAt: serverTimestamp(),
      isEdited: true,
    });
  }

  static async deleteMessage(messageId: string) {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
  }

  static async addReaction(messageId: string, emoji: string) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      reactions: arrayUnion({
        emoji,
        userId: user.uid,
        createdAt: serverTimestamp(),
      }),
    });
  }

  static async removeReaction(messageId: string, emoji: string) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      reactions: arrayRemove({
        emoji,
        userId: user.uid,
      }),
    });
  }

  static subscribeToMessages(roomId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Message[];
      callback(messages);
    });
  }

  // Rooms
  static async createRoom(name: string, description: string, type: 'public' | 'ephemeral' = 'public') {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const roomData = {
      name,
      description,
      type,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      memberCount: 1,
      isPrivate: false,
      ...(type === 'ephemeral' && {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }),
    };

    return await addDoc(collection(db, 'rooms'), roomData);
  }

  static async joinRoom(roomId: string) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      memberCount: arrayUnion(user.uid),
    });
  }

  static async leaveRoom(roomId: string) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      memberCount: arrayRemove(user.uid),
    });
  }

  static subscribeToRooms(callback: (rooms: Room[]) => void) {
    const q = query(
      collection(db, 'rooms'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as Room[];
      callback(rooms);
    });
  }

  // User Presence
  static async updatePresence(roomId: string, isTyping: boolean = false) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const presenceRef = doc(db, 'presence', `${user.uid}_${roomId}`);
    await updateDoc(presenceRef, {
      userId: user.uid,
      roomId,
      isTyping,
      lastSeen: serverTimestamp(),
    });
  }

  static subscribeToPresence(roomId: string, callback: (presence: UserPresence[]) => void) {
    const q = query(
      collection(db, 'presence'),
      where('roomId', '==', roomId),
      orderBy('lastSeen', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const presence = snapshot.docs.map(doc => ({
        ...doc.data(),
        lastSeen: doc.data().lastSeen?.toDate() || new Date(),
      })) as UserPresence[];
      callback(presence);
    });
  }

  // Offline messages
  static saveOfflineMessage(message: Omit<OfflineMessage, 'id'>) {
    const offlineMessages = this.getOfflineMessages();
    const newMessage = {
      ...message,
      id: uuidv4(),
    };
    offlineMessages.push(newMessage);
    localStorage.setItem('offlineMessages', JSON.stringify(offlineMessages));
  }

  static getOfflineMessages(): OfflineMessage[] {
    const stored = localStorage.getItem('offlineMessages');
    return stored ? JSON.parse(stored) : [];
  }

  static clearOfflineMessages() {
    localStorage.removeItem('offlineMessages');
  }

  private static getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const { auth } = require('@/lib/firebase');
    return auth.currentUser;
  }
}
