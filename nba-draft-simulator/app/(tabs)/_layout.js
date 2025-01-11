import { Stack } from 'expo-router';
import { DraftProvider } from '../../context/DraftContext';
import { SettingsProvider } from '../../context/SettingsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <DraftProvider>
        <Stack>
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
        </Stack>
      </DraftProvider>
    </SettingsProvider>
  );
}