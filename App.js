// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabRoutes } from './routes/TabRoutes';
import { BoasVindasScreen } from './screens/BoasVindasScreen';

export default function App() {
  const [primeiroAcesso, setPrimeiroAcesso] = useState(true);

  // Se for o primeiro acesso, mostra a tela de boas-vindas
  // fora do NavigationContainer — ela não precisa de navegação
  if (primeiroAcesso) {
    return (
      <SafeAreaProvider>
        <BoasVindasScreen onConcluir={() => setPrimeiroAcesso(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TabRoutes />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
