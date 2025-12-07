import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';

const STORAGE_KEY = 'user_profile';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [edad, setEdad] = useState<string>('');
  const [genero, setGenero] = useState<string>('');
  const [tipoSangre, setTipoSangre] = useState<string>('');
  const [rh, setRh] = useState<string>('');
  const [peso, setPeso] = useState<string>('');
  const [enfermedades, setEnfermedades] = useState<string>('');
  const [alergias, setAlergias] = useState<string>('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setEdad(data.edad?.toString() ?? '');
          setGenero(data.genero ?? '');
          setTipoSangre(data.tipo_sangre ?? '');
          setRh(data.rh ?? '');
          setPeso(data.peso?.toString() ?? '');
          setEnfermedades((data.enfermedades ?? []).join(', '));
          setAlergias((data.alergias ?? []).join(', '));
        }
      } catch (error) {
        console.warn('Error loading profile', error);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        edad: edad ? Number(edad) : null,
        genero,
        tipo_sangre: tipoSangre,
        rh,
        peso: peso ? Number(peso) : null,
        enfermedades: enfermedades
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e.length > 0),
        alergias: alergias
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      Alert.alert('Perfil guardado', 'Los datos se han guardado correctamente.');
      navigation.navigate('Camera');
    } catch (error) {
      console.warn('Error saving profile', error);
      Alert.alert('Error', 'No se pudieron guardar los datos.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil de Usuario</Text>

      <Text style={styles.label}>Edad</Text>
      <TextInput
        style={styles.input}
        value={edad}
        onChangeText={setEdad}
        keyboardType="numeric"
        placeholder="Ej: 30"
      />

      <Text style={styles.label}>Género</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={genero}
          onValueChange={(value) => setGenero(value)}
        >
          <Picker.Item label="Selecciona género" value="" />
          <Picker.Item label="Femenino" value="F" />
          <Picker.Item label="Masculino" value="M" />
          <Picker.Item label="Otro" value="O" />
        </Picker>
      </View>

      <Text style={styles.label}>Tipo de sangre</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipoSangre}
          onValueChange={(value) => setTipoSangre(value)}
        >
          <Picker.Item label="Selecciona tipo" value="" />
          <Picker.Item label="A" value="A" />
          <Picker.Item label="B" value="B" />
          <Picker.Item label="O" value="O" />
          <Picker.Item label="AB" value="AB" />
        </Picker>
      </View>

      <Text style={styles.label}>RH</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={rh} onValueChange={(value) => setRh(value)}>
          <Picker.Item label="Selecciona RH" value="" />
          <Picker.Item label="+" value="+" />
          <Picker.Item label="-" value="-" />
        </Picker>
      </View>

      <Text style={styles.label}>Peso (kg)</Text>
      <TextInput
        style={styles.input}
        value={peso}
        onChangeText={setPeso}
        keyboardType="numeric"
        placeholder="Ej: 70"
      />

      <Text style={styles.label}>Enfermedades (separadas por coma)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={enfermedades}
        onChangeText={setEnfermedades}
        placeholder="Ej: hipertension, diabetes"
        multiline
      />

      <Text style={styles.label}>Alergias (separadas por coma)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={alergias}
        onChangeText={setAlergias}
        placeholder="Ej: gluten, lactosa"
        multiline
      />

      <View style={styles.buttonContainer}>
        <Button title="Guardar y continuar" onPress={handleSave} />
      </View>
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
  label: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 6,
  },
  buttonContainer: {
    marginTop: 24,
  },
});
