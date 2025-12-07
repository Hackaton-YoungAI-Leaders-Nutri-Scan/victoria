import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Camera, User, Cake, Smartphone } from 'lucide-react-native';

const DISEASE_OPTIONS = [
  'Hipertensión',
  'Diabetes',
  'Gastritis',
  'Asma',
  'Enfermedad cardíaca',
  'Insuficiencia renal',
  'Colesterol alto',
  'Obesidad',
  'Enfermedad tiroidea',
  'Enfermedad celíaca',
  'Artritis',
  'Migraña',
  'Otro'
];

const ALLERGY_OPTIONS = [
  'Ninguna',
  'Maní',
  'Mariscos',
  'Lácteos',
  'Gluten',
  'Huevo',
  'Soja',
  'Frutas cítricas',
  'Medicamentos',
  'Polen',
  'Otro',
];

export const PersonalData: React.FC = () => {
  const navigation = useNavigation<any>();
  const [gender, setGender] = useState('Masculino');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>RH</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Ej: O+"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estatura (cm)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  keyboardType="numeric"
                  placeholder="Introduce tu estatura en centímetros"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso (kg)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  keyboardType="numeric"
                  placeholder="Introduce tu peso en kilogramos"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enfermedades base</Text>
              <Text style={styles.helperText}>
                Selecciona todas las que apliquen.
              </Text>
              <View style={styles.diseasesContainer}>
                {DISEASE_OPTIONS.map((disease) => {
                  const isSelected = selectedDiseases.includes(disease);
                  return (
                    <TouchableOpacity
                      key={disease}
                      onPress={() => {
                        setSelectedDiseases((prev) =>
                          prev.includes(disease)
                            ? prev.filter((d) => d !== disease)
                            : [...prev, disease]
                        );
                      }}
                      style={[
                        styles.diseaseChip,
                        isSelected && styles.diseaseChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.diseaseChipText,
                          isSelected && styles.diseaseChipTextActive,
                        ]}
                      >
                        {disease}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alergias</Text>
              <Text style={styles.helperText}>
                Selecciona la opción que mejor te describa.
              </Text>
              <View style={styles.diseasesContainer}>
                {ALLERGY_OPTIONS.map((allergy) => {
                  const isSelected = selectedAllergies.includes(allergy);
                  return (
                    <TouchableOpacity
                      key={allergy}
                      onPress={() =>
                        setSelectedAllergies((prev) =>
                          prev.includes(allergy)
                            ? prev.filter((a) => a !== allergy)
                            : [...prev, allergy]
                        )
                      }
                      style={[
                        styles.diseaseChip,
                        isSelected && styles.diseaseChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.diseaseChipText,
                          isSelected && styles.diseaseChipTextActive,
                        ]}
                      >
                        {allergy}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.termsRow}>
              <TouchableOpacity
                onPress={() => setTermsAccepted(!termsAccepted)}
                style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
              >
                {termsAccepted && <View style={styles.checkboxInner} />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Acepto los términos y condiciones y autorizo el uso de mis datos para recomendaciones nutricionales.{' '}
                <Text
                  style={{ color: '#1392ec', textDecorationLine: 'underline' }}
                  onPress={() => setIsTermsModalVisible(true)}
                >
                  Ver más
                </Text>
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
        <Modal
          visible={isTermsModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIsTermsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Términos y condiciones de tratamiento de datos</Text>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalText}>
                  Esta aplicación cumple con la normativa colombiana de protección de datos personales (Ley 1581 de 2012 y normas complementarias).
                  {'\n'}{'\n'}
                  Al aceptar, autorizas de manera libre, previa, expresa e informada a que tus datos personales, incluyendo datos relacionados con tu salud (como enfermedades de base, alergias, estatura y peso), sean tratados únicamente para las siguientes finalidades:
                  {'\n'}{'\n'}
                  • Generar recomendaciones nutricionales personalizadas.{"\n"}
                  • Mejorar la experiencia de uso de la aplicación.{"\n"}
                  • Realizar análisis estadísticos internos de hábitos y patrones de consumo, de forma agregada y sin identificarte individualmente.
                  {'\n'}{'\n'}
                  No compartiremos tus datos personales con terceros no autorizados. Puedes ejercer tus derechos de conocer, actualizar, rectificar y suprimir tus datos, así como revocar la autorización, a través de los canales de contacto definidos por el responsable del tratamiento.
                </Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsTermsModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  diseasesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  diseaseChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  diseaseChipActive: {
    backgroundColor: '#1392ec',
    borderColor: '#1392ec',
  },
  diseaseChipText: {
    fontSize: 14,
    color: '#374151',
  },
  diseaseChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    borderColor: '#1392ec',
    backgroundColor: '#1392ec',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1392ec',
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: '600',
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
