import React, { useCallback, useState } from 'react';
import { View, Text, Button, Image, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BACKEND_BASE_URL } from '../config/api';

const STORAGE_KEY = 'user_profile';

interface ApiResponse {
  food_name: string;
  recommendation: 'VERDE' | 'AMARILLO' | 'ROJO';
  details: string;
}

export const CameraScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | undefined>();
  const [imageType, setImageType] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);

  const handleTakePhoto = useCallback(async () => {
    try {
      setResult(null);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita permiso de cámara para tomar fotos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets && result.assets[0];
      if (!asset || !asset.uri) {
        Alert.alert('Error', 'No se obtuvo ninguna imagen');
        return;
      }

      setImageUri(asset.uri);
      setImageFileName(asset.fileName || 'photo.jpg');
      setImageType(asset.type || 'image/jpeg');
    } catch (error: any) {
      console.warn('Error en launchCamera (expo-image-picker)', error);
      Alert.alert('Error', 'Ocurrió un problema al abrir la cámara. Revisa permisos y vuelve a intentarlo.');
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageUri || !imageFileName || !imageType) {
      Alert.alert('Sin imagen', 'Primero toma una foto.');
      return;
    }

    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        Alert.alert('Perfil incompleto', 'Configura primero tu perfil en la pantalla de Perfil.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(stored);

      const formData = new FormData();

      formData.append('photo', {
        uri: imageUri,
        name: imageFileName,
        type: imageType,
      } as any);

      formData.append('user_data', JSON.stringify(userData));
      console.log(BACKEND_BASE_URL, 'BACKEND_BASE_URL')
      const response = await axios.post<ApiResponse>(
        `${BACKEND_BASE_URL}/api/recommendation`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data);
    } catch (error: any) {
      console.warn('Error calling API', error?.response || error);
      console.warn('Error details', error?.message, error?.code, error?.toJSON?.());
      Alert.alert('Error', 'No se pudo analizar la comida. Revisa la conexión al backend.');
    } finally {
      setLoading(false);
    }
  }, [imageUri, imageFileName, imageType]);

  const getRecommendationColor = (recommendation?: ApiResponse['recommendation']) => {
    switch (recommendation) {
      case 'VERDE':
        return '#2ecc71';
      case 'ROJO':
        return '#e74c3c';
      case 'AMARILLO':
        return '#f1c40f';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Analizar Comida</Text>

      <View style={styles.buttonContainer}>
        <Button title="Tomar foto" onPress={handleTakePhoto} />
      </View>

      {imageUri && (
        <View style={styles.previewContainer}>
          <Text style={styles.label}>Previsualización</Text>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Analizar comida" onPress={handleAnalyze} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Analizando...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado</Text>
          <Text style={styles.resultFood}>Alimento: {result.food_name}</Text>
          <View
            style={[
              styles.recommendationBadge,
              { backgroundColor: getRecommendationColor(result.recommendation) },
            ]}
          >
            <Text style={styles.recommendationText}>{result.recommendation}</Text>
          </View>
          <Text style={styles.resultDetails}>{result.details}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 8,
  },
  previewContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f4f6f7',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultFood: {
    fontSize: 16,
    marginBottom: 8,
  },
  recommendationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  recommendationText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  resultDetails: {
    fontSize: 14,
  },
});
