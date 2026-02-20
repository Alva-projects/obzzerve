import 'react-native-gesture-handler';
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../../screens/HomeScreen';
import AddObservationScreen from '../../screens/AddObservationScreen';
import SeasonScreen from '../../screens/SeasonScreen';
import ObservationDetailScreen from '../../screens/ObservationDetailScreen';
import StatsScreen from '../../screens/StatsScreen';
import HowToUseScreen from '../../screens/HowToUseScreen';

import ProfileScreen from '../../screens/ProfileScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeView" component={HomeScreen} />
      <Stack.Screen name="AddObservation" component={AddObservationScreen} />
      <Stack.Screen
        name="ObservationDetail"
        component={ObservationDetailScreen}
        options={{
          headerShown: true,
          title: 'Din Nektar',
          headerStyle: { backgroundColor: '#FFF9E6' },
          headerTintColor: '#F5A623',
        }}
      />
    </Stack.Navigator>
  );
}

function VarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SeasonView" component={SeasonScreen} initialParams={{ season: 'Vår' }} />
      <Stack.Screen name="ObservationDetail" component={ObservationDetailScreen} options={{ headerShown: true, title: 'Din Nektar', headerStyle: { backgroundColor: '#FFF9E6' }, headerTintColor: '#F5A623' }} />
      <Stack.Screen name="AddObservation" component={AddObservationScreen} />
    </Stack.Navigator>
  );
}

function SommarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SeasonView" component={SeasonScreen} initialParams={{ season: 'Sommar' }} />
      <Stack.Screen name="ObservationDetail" component={ObservationDetailScreen} options={{ headerShown: true, title: 'Din Nektar', headerStyle: { backgroundColor: '#FFF9E6' }, headerTintColor: '#F5A623' }} />
      <Stack.Screen name="AddObservation" component={AddObservationScreen} />
    </Stack.Navigator>
  );
}

function HostStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SeasonView" component={SeasonScreen} initialParams={{ season: 'Höst' }} />
      <Stack.Screen name="ObservationDetail" component={ObservationDetailScreen} options={{ headerShown: true, title: 'Din Nektar', headerStyle: { backgroundColor: '#FFF9E6' }, headerTintColor: '#F5A623' }} />
      <Stack.Screen name="AddObservation" component={AddObservationScreen} />
    </Stack.Navigator>
  );
}

function VinterStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SeasonView" component={SeasonScreen} initialParams={{ season: 'Vinter' }} />
      <Stack.Screen name="ObservationDetail" component={ObservationDetailScreen} options={{ headerShown: true, title: 'Din Nektar', headerStyle: { backgroundColor: '#FFF9E6' }, headerTintColor: '#F5A623' }} />
      <Stack.Screen name="AddObservation" component={AddObservationScreen} />
    </Stack.Navigator>
  );
}

function StatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatsView" component={StatsScreen} />
    </Stack.Navigator>
  );
}

function HowToUseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HowToUseView" component={HowToUseScreen} />
      <Stack.Screen name="AddObservation" component={AddObservationScreen} />
    </Stack.Navigator>
  );
}

export default function Index() {
  return (
    <Drawer.Navigator
      initialRouteName="Hem"
      screenOptions={{
        drawerStyle: { backgroundColor: '#FFF9E6' },
        drawerActiveTintColor: '#F5A623',
        drawerInactiveTintColor: '#8B6914',
      }}
    >
      <Drawer.Screen
        name="Hem"
        component={HomeStack}
        options={{ title: '🐝 Bikupan', headerTitle: '' }}
      />
      <Drawer.Screen
        name="Vår"
        component={VarStack}
        options={{ title: '🌼 Vår', headerTitle: '' }}
      />
      <Drawer.Screen
        name="Sommar"
        component={SommarStack}
        options={{ title: '☀️ Sommar', headerTitle: '' }}
      />
      <Drawer.Screen
        name="Höst"
        component={HostStack}
        options={{ title: '🍂 Höst', headerTitle: '' }}
      />
      <Drawer.Screen
        name="Vinter"
        component={VinterStack}
        options={{ title: '❄️ Vinter', headerTitle: '' }}
      />
      <Drawer.Screen
        name="Statistik"
        component={StatsStack}
        options={{ title: '📊 Nektar-statistik', headerTitle: '' }}
      />
      <Drawer.Screen
        name="HurAnvanda"
        component={HowToUseStack}
        options={{ title: '❓ Hur man använder appen', headerTitle: '' }}
      />
      <Stack.Screen name="👤 Profil" component={ProfileScreen} />

    </Drawer.Navigator>
  );
}