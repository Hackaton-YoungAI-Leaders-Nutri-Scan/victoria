import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check, MessageCircle, Plus } from 'lucide-react-native';

export const ConnectionSuccess: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
            <Plus color="#111518" size={28} />
        </View>
        <Text style={styles.headerTitle}>Victoria</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Success Circle */}
        <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
                <Check color="#22c55e" size={64} strokeWidth={3} />
            </View>
        </View>

        <Text style={styles.title}>¡Conexión exitosa!</Text>
        <Text style={styles.subtitle}>
          Victoria acaba de saludar a Ana por WhatsApp.
        </Text>

        {/* WhatsApp Preview Card */}
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.whatsappIcon}>
                    <MessageCircle color="white" size={20} fill="white" />
                </View>
                <View style={styles.messageContent}>
                    <Text style={styles.senderName}>Victoria</Text>
                    <View style={styles.messageBubble}>
                        <Text style={styles.messageText}>
                            ¡Hola Ana! Soy Victoria, tu asistente de salud. Estoy aquí para ayudarte. 😊
                        </Text>
                    </View>
                </View>
            </View>
        </View>

        <TouchableOpacity 
            onPress={() => navigation.navigate('Dashboard')}
            style={styles.actionButton}
        >
            <Text style={styles.actionButtonText}>Ver instrucciones para el paciente</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111518',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  circleInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  whatsappIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111518',
    marginBottom: 4,
  },
  messageBubble: {
    backgroundColor: 'rgba(19, 146, 236, 0.1)',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopRightRadius: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#1392ec',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
