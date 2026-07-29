/**
 * AppNavigator.tsx — Navegação simplificada para tvapp1
 *
 * Fluxo:
 *   Lock → Config → TvMain
 *
 * Na inicialização, verifica se há credenciais salvas.
 * Se sim, vai direto para TvMain. Se não, para Lock.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LockScreen from '../screens/LockScreen';
import ConfigScreen from '../screens/ConfigScreen';
import TvScreen from '../screens/TvScreen';
import { getSavedCredentials, buildBaseUrl } from '../services/storage';

export type RootStackParamList = {
  Lock: undefined;
  Config: undefined;
  TvMain: {
    baseUrl: string;
    roomId: string;
    pin: string;
    theme: object;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

// Usamos um componente com state inicial para determinar a tela inicial
export function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<'Lock' | 'Config' | 'TvMain' | null>(null);
  const [initialParams, setInitialParams] = useState<any>(null);

  useEffect(() => {
    getSavedCredentials()
      .then(creds => {
        if (creds && creds.ip && creds.roomId) {
          setInitialParams({
            baseUrl: buildBaseUrl(creds.ip, creds.port),
            roomId: creds.roomId,
            pin: creds.pin,
            theme: creds.theme,
          });
          setInitialRoute('TvMain');
        } else {
          setInitialRoute('Config');
        }
      })
      .catch(() => {
        setInitialRoute('Config');
      });
  }, []);

  // Splash while checking storage
  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0e1a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#7B3FE4" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0a0e1a' },
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Lock"   component={LockScreen} />
        <Stack.Screen name="Config" component={ConfigScreen} />
        <Stack.Screen
          name="TvMain"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          component={TvScreen as any}
          initialParams={initialRoute === 'TvMain' ? initialParams : undefined}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
