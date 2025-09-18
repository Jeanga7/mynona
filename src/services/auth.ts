import { auth } from '@/lib/firebase';
import { 
  signInAnonymously, 
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { useAuthStore } from '@/store/auth';
import { generateUsername, generateAvatar } from '@/utils/userGenerator';

export class AuthService {
  static async signInAsGuest() {
    try {
      const result = await signInAnonymously(auth);
      
      // Générer un username et avatar automatiques
      const username = generateUsername();
      const avatarUrl = generateAvatar(result.user.uid);
      
      // Mettre à jour le profil
      await updateProfile(result.user, {
        displayName: username,
        photoURL: avatarUrl
      });
      
      return result.user;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      await firebaseSignOut(auth);
      useAuthStore.getState().logout();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  static async updateUsername(username: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    try {
      await updateProfile(user, {
        displayName: username
      });
      return user;
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  }

  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}
