import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@smartdebt:token";
const USER_KEY = "@smartdebt:user";
const ONBOARDING_KEY = "@smartdebt:onboarding_completed";

export const storage = {
  // Token management
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error setting token:", error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },

  // User data management
  async getUser(): Promise<any | null> {
    try {
      const user = await AsyncStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error setting user:", error);
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  },

  // Onboarding management
  async getOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      return completed === 'true';
    } catch (error) {
      console.error("Error getting onboarding:", error);
      return false;
    }
  },

  async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error("Error setting onboarding:", error);
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, ONBOARDING_KEY]);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  },
};
