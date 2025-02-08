import { Stack } from 'expo-router';
import { DraftProvider } from '../../context/DraftContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { Platform } from 'react-native';

// Platform-specific adjustments
const defaultHeaderOptions = {
  headerStyle: {
    height: Platform.select({ ios: 96, android: 76 }),
  },
  headerTitleStyle: {
    fontSize: Platform.select({ ios: 17, android: 20 }),
    fontWeight: '600',
  },
};

export default function RootLayout() {
  return (
    <SettingsProvider>
      <DraftProvider>
        <Stack screenOptions={defaultHeaderOptions}>
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'NBA Draft Simulator',
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="draft" 
            options={{ 
              title: 'Draft In Progress',
              headerBackVisible: false 
            }} 
          />
          <Stack.Screen 
            name="evaluation" 
            options={{ 
              title: 'Team Evaluation',
              headerBackVisible: false 
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              title: 'Settings',
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="advanced-setup" 
            options={{ 
              title: 'Advanced Setup',
              headerShown: false 
            }} 
          />
        </Stack>
      </DraftProvider>
    </SettingsProvider>
  );
}