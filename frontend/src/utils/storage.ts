import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserData = async () => {
  try {
    const clientId = await AsyncStorage.getItem('client_id');
    const profileId = await AsyncStorage.getItem('profile_id');
    const fullName = await AsyncStorage.getItem('full_name');
    const picture = await AsyncStorage.getItem('profile_photo_url');
    
    if (clientId && profileId) {
      return {
        client_id: clientId,
        profile_id: profileId,
        full_name: fullName,
        profile_photo_url: picture
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove(['client_id', 'profile_id', 'full_name', 'profile_photo_url']);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};