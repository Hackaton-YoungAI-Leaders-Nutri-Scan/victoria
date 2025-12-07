import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, BarChart2, MessageCircle, Settings } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const BottomNav: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const isActive = (routeName: string) => route.name === routeName;

  const navigateTo = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          onPress={() => navigateTo('Dashboard')}
          style={styles.tab}
        >
          <Home 
            size={24} 
            color={isActive('Dashboard') ? '#1392ec' : '#9ca3af'} 
            strokeWidth={isActive('Dashboard') ? 2.5 : 2} 
          />
          <Text style={[styles.label, isActive('Dashboard') && styles.activeLabel]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateTo('Report')}
          style={styles.tab}
        >
          <BarChart2 
            size={24} 
            color={isActive('Report') ? '#1392ec' : '#9ca3af'} 
            strokeWidth={isActive('Report') ? 2.5 : 2} 
          />
          <Text style={[styles.label, isActive('Report') && styles.activeLabel]}>Reportes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigateTo('PatientList')}
          style={styles.tab}
        >
          <Settings 
            size={24} 
            color={isActive('PatientList') ? '#1392ec' : '#9ca3af'} 
            strokeWidth={isActive('PatientList') ? 2.5 : 2} 
          />
          <Text style={[styles.label, isActive('PatientList') && styles.activeLabel]}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeLabel: {
    color: '#1392ec',
  },
});
