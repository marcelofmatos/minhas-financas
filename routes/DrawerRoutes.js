// routes/DrawerRoutes.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TabRoutes } from './TabRoutes';
import { SobreScreen } from '../screens/SobreScreen';

const Drawer = createDrawerNavigator();

export function DrawerRoutes() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#2c3e50',
        drawerInactiveTintColor: '#95a5a6',
      }}
    >
      <Drawer.Screen
        name="App"
        component={TabRoutes}
        options={{ drawerLabel: 'Início' }}
      />
      <Drawer.Screen
        name="Sobre"
        component={SobreScreen}
        options={{ drawerLabel: 'Sobre o App' }}
      />
    </Drawer.Navigator>
  );
}