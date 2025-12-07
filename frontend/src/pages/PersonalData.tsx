import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Camera, User, Cake, Smartphone } from 'lucide-react-native';

export const PersonalData: React.FC = () => {
  const navigation = useNavigation<any>();
  const [gender, setGender] = useState('Masculino');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        {/* Top App Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Datos Personales</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Paso 1 de 4</Text>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoPlaceholder}>
              <Camera color="#9ca3af" size={32} />
            </TouchableOpacity>
            <View style={styles.photoLabels}>
              <Text style={styles.photoTitle}>Añadir foto</Text>
              <Text style={styles.photoSubtitle}>Opcional</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <User color="#9ca3af" size={20} />
                </View>
                <TextInput 
                  placeholder="Introduce el nombre completo"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Edad</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Cake color="#9ca3af" size={20} />
                </View>
                <TextInput 
                  keyboardType="numeric"
                  placeholder="Introduce la edad"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sexo</Text>
              <View style={styles.genderContainer}>
                {['Masculino', 'Femenino', 'Otro'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setGender(option)}
                    style={[
                      styles.genderOption,
                      gender === option ? styles.genderOptionActive : null
                    ]}
                  >
                    <Text style={[
                      styles.genderText,
                      gender === option ? styles.genderTextActive : null
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de WhatsApp</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Smartphone color="#9ca3af" size={20} />
                </View>
                <TextInput 
                  keyboardType="phone-pad"
                  placeholder="(+XX) XXX-XXX-XXXX"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                />
              </View>
              <Text style={styles.helperText}>
                Este es el número que usará Victoria para comunicarse.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ConnectionSuccess')}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f6f7f8',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
  },
  progressBarFill: {
    height: '100%',
    width: '25%',
    backgroundColor: '#1392ec',
    borderRadius: 999,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  photoPlaceholder: {
    height: 128,
    width: 128,
    borderRadius: 64,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabels: {
    alignItems: 'center',
  },
  photoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111518',
  },
  photoSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111518',
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: '#111518',
  },
  genderContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: 4,
    borderRadius: 8,
    gap: 8,
  },
  genderOption: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  genderOptionActive: {
    backgroundColor: '#1392ec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  genderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  genderTextActive: {
    color: 'white',
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    padding: 16,
    backgroundColor: '#f6f7f8',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  nextButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1392ec',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1392ec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
