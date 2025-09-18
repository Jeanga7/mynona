import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';

const adjectives = [
  'Joyeux', 'Rapide', 'Sage', 'Brave', 'Calme', 'Vif', 'Doux', 'Fort',
  'Clair', 'Sombre', 'Léger', 'Profond', 'Chaud', 'Froid', 'Noble', 'Humble',
  'Happy', 'Quick', 'Wise', 'Brave', 'Calm', 'Bright', 'Gentle', 'Strong',
  'Clear', 'Dark', 'Light', 'Deep', 'Warm', 'Cool', 'Noble', 'Humble'
];

const nouns = [
  'Lion', 'Aigle', 'Loup', 'Ours', 'Renard', 'Chat', 'Chien', 'Cheval',
  'Dragon', 'Phénix', 'Tigre', 'Panthere', 'Léopard', 'Lynx', 'Faucon', 'Hibou',
  'Lion', 'Eagle', 'Wolf', 'Bear', 'Fox', 'Cat', 'Dog', 'Horse',
  'Dragon', 'Phoenix', 'Tiger', 'Panther', 'Leopard', 'Lynx', 'Hawk', 'Owl'
];

export function generateUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}${noun}${number}`;
}

export function generateAvatar(seed: string): string {
  const avatar = createAvatar(identicon, {
    seed,
    size: 128,
    backgroundColor: ['#f0f0f0', '#e0e0e0', '#d0d0d0'],
  });
  
  return avatar.toDataUri();
}

export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
