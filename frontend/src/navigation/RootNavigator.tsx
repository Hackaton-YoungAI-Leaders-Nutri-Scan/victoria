// src/navigation/RootNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa tus pantallas migradas desde victoria-care
import { Welcome } from '../pages/Welcome';
import { PersonalData } from '../pages/PersonalData';
import { ConnectionSuccess } from '../pages/ConnectionSuccess';
import { Dashboard } from '../pages/Dashboard';
import { PatientList } from '../pages/PatientList';
import { Report } from '../pages/Report';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f6f7f8' },
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="PersonalData" component={PersonalData} />
      <Stack.Screen name="ConnectionSuccess" component={ConnectionSuccess} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="PatientList" component={PatientList} />
      <Stack.Screen name="Report" component={Report} />
    </Stack.Navigator>
  );
}
