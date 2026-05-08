// App.js
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabRoutes } from './routes/TabRoutes';
import { TransacoesProvider } from './context/TransacoesContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <TransacoesProvider>
        <NavigationContainer>
          <TabRoutes />
        </NavigationContainer>
      </TransacoesProvider>
    </SafeAreaProvider>
  );
}