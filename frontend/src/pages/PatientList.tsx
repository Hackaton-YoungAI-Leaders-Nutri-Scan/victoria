import React from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, MoreVertical, User, Bell, Shield, HelpCircle, LogOut, Plus, ChevronRight } from 'lucide-react-native';
import { BottomNav } from '../components/BottomNav';

const patients = [
  {
    id: 1,
    name: 'Elena Rodriguez',
    status: 'Activo - Último reporte: Hoy 9:30 AM',
    statusColor: '#22c55e',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvHKG3KaIHKlRNPMQ1uoMOx-quke9OCcZn4kK5MSDRqHB-QW8po_9QAuovxd7auQPJZ5Q8VyWcF6flZEh0N9cL1zf7N4z3fwfBjpJtu0f2vl6uONfSxZ0pjAo58q89SqbMG1NrfX4NHN8Q4BaHHO3mCgdKQ6mEIyG2j8QIL6MYri3ioYWWo0gSRUYZjL5sQc4SZroT9ETTRxLDfAoj0uQfUWfqlB_I5jp1J9hehGBk053ovuerW0BHLSzG7D-wsPRIcKeZamD1FJU'
  },
  {
    id: 2,
    name: 'Carlos Gomez',
    status: 'Pausado - Monitoreo en pausa',
    statusColor: '#f97316',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr-JIxVjucTbMqMIxRV_R_cfTRSDSSIMuAS0TQwJSVznZZci_f4vu0t66bzSpL7B7OB1KARIu_mD94LNI5Ulu53WWxvSdfcE5s-2ZRSfrNbeg7KT5xUwckHbQtHSw5ShGEPtGDhnmmc4VduJ6mFi2xeXP1jjxGM6l3jf-yeVZSZiiEBwEEjhOtTtHz47cKrNn3hoa2ryjZgtUd5rmROZEBCFYXNhJCRHmO1HhfYHaWj_2Y7YgdcVhczwUsh0TCAPauuLuIg1nDRxY'
  },
  {
    id: 3,
    name: 'Maria Fernandez',
    status: 'Alerta - Glucosa alta: 180 mg/dL',
    statusColor: '#ef4444',
    textStatusColor: '#ef4444',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZgHQDC5gNFQG2hXmnVYHEhVCScw0ANQDfme0pXZ2mrInqxVWOMXNYjtpJc-DFsSvC8H7lo83Ror0Cii8AucGIg1jS1xNBAO5__KodiyTa7T2O3a9niFSYF5hO-0ypSnuZh62-EOLWyB3Fw9Vq908uKWkZ0bEYdNGtetAfTN1woCBQI_ykrNFFqq-N3g992WwHsYMIM6I3SWWsgYMFb2l2Vu2cVvYRFvcLfHyfeo0rOxr8IKQVJhu8cT0iz55XKS1hBvXyv2XcL6E'
  }
];

export const PatientList: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Pacientes</Text>
        <View style={styles.headerAction}>
            <View style={styles.avatarPlaceholder}>
                <User color="#475569" size={24} />
            </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={styles.searchContainer}>
            <View style={styles.searchIcon}>
                <Search color="#64748b" size={20} />
            </View>
            <TextInput 
                placeholder="Buscar paciente"
                placeholderTextColor="#64748b"
                style={styles.searchInput}
            />
        </View>

        {/* List */}
        <View style={styles.list}>
            {patients.map((patient) => (
                <TouchableOpacity 
                    key={patient.id} 
                    onPress={() => navigation.navigate('Dashboard')} 
                    style={styles.card}
                >
                    <Image source={{ uri: patient.img }} style={styles.avatar} />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{patient.name}</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: patient.statusColor }]} />
                            <Text style={[
                                styles.statusText, 
                                { color: patient.textStatusColor || '#64748b' }
                            ]} numberOfLines={1}>
                                {patient.status}
                            </Text>
                        </View>
                    </View>
                    <MoreVertical color="#94a3b8" size={20} />
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.divider} />

        {/* Settings */}
        <Text style={styles.sectionHeader}>Configuración General</Text>
        <View style={styles.settingsGroup}>
            {[
                { Icon: User, label: 'Mi Cuenta' },
                { Icon: Bell, label: 'Notificaciones' },
                { Icon: Shield, label: 'Privacidad y Seguridad' },
                { Icon: HelpCircle, label: 'Ayuda y Soporte' },
                { Icon: LogOut, label: 'Cerrar Sesión', color: '#ef4444' }
            ].map((item, i) => (
                <TouchableOpacity 
                    key={i} 
                    style={[
                        styles.settingItem,
                        i !== 4 ? styles.settingItemBorder : null
                    ]}
                >
                    <View style={styles.settingLeft}>
                        <item.Icon color={item.color || "#64748b"} size={24} />
                        <Text style={[styles.settingLabel, { color: item.color || "#0f172a" }]}>{item.label}</Text>
                    </View>
                    {i !== 4 && <ChevronRight color="#94a3b8" size={20} />}
                </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Plus color="white" size={32} />
      </TouchableOpacity>

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f6f7f8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerAction: {
    width: 40,
    alignItems: 'flex-end',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 24,
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  list: {
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  settingsGroup: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1392ec',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
