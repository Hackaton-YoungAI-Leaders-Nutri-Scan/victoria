import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, Flower } from 'lucide-react-native';

export const Welcome: React.FC = () => {
  const navigation = useNavigation<any>();

  // Función de registro que usará fetch
  // const registerUser = async () => {
  //   const payload = {
  //     id: 1,
  //   };

  //   try {
  //     const response = await fetch("<TU_ENDPOINT>", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload), // ← aquí va el objeto que tú reemplazarás más adelante
  //     });

  //     if (!response.ok) {
  //       Alert.alert("Error", "Hubo un problema al registrar el usuario.");
  //       return;
  //     }

  //     const data = await response.json();
  //     console.log("Respuesta del backend:", data);

  //     navigation.navigate("PersonalData");

  //   } catch (error) {
  //     console.error("Error en fetch:", error);
  //     Alert.alert("Error", "No se pudo conectar con el servidor.");
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Flower color="#1392ec" size={40} />
          </View>

          <View style={styles.heroContainer}>
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuArcg5_cUBPw6Rvwz9WQwl_PhgbNGTbUsn8OXud5dJSqfNN9dezA2GmErm6SkLiHxyd9ZeAA-mV9auVzXkjqQyuChBTl0BDR2UQhGTLdk7_-iLY0xCx7eBQ5EQd2J3dsRjFztGRerMC1BumygNdVK0sfQh_Z-BcQeH8J4G5AsKd5pOMVMBhztQ6TNepHo3hACOOLBj8874X1Dou9oeeGNjjNs44RL7zoAncVhacM30o-FVG6O6VAh3Ee2V2QER-dRc-XOjYjZ-8RCk" }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.title}>Cuidar es más fácil juntos</Text>
          <Text style={styles.subtitle}>Tu asistente para la tranquilidad y el bienestar</Text>
        </View>

        <View style={styles.actions}>

          {/* Continuar con Google */}
          <TouchableOpacity 
            // onPress={registerUser}
            style={[styles.button, styles.googleButton]}
          >
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Continuar con Email */}
          <TouchableOpacity 
            // onPress={registerUser}
            onPress={() => navigation.navigate('PersonalData')}
            style={[styles.button, styles.emailButton]}
          >
            <Mail size={20} color="#1392ec" />
            <Text style={styles.emailButtonText}>Continuar con Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.secureContainer}>
            <Lock size={14} color="#6b7280" />
            <Text style={styles.secureText}>Tus datos están seguros y son privados</Text>
          </View>
          <Text style={styles.legalText}>
            Al continuar, aceptas nuestros{' '}
            <Text style={styles.linkText}>Términos de Servicio</Text> y{' '}
            <Text style={styles.linkText}>Política de Privacidad</Text>.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    paddingTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 146, 236, 0.2)',
    borderRadius: 40,
  },
  heroContainer: {
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 4/3,
    borderRadius: 12,
  },
  title: {
    color: '#111518',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 0,
    maxWidth: 280,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  appleButton: {
    backgroundColor: '#111518',
  },
  appleIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  appleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#111518',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailButton: {
    backgroundColor: 'rgba(19, 146, 236, 0.1)',
  },
  emailButtonText: {
    color: '#1392ec',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  secureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  secureText: {
    fontSize: 14,
    color: '#6b7280',
  },
  legalText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  linkText: {
    color: '#1392ec',
    fontWeight: '500',
  },
});
