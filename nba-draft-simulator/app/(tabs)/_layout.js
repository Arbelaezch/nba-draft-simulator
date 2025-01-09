import { Stack } from 'expo-router';
import { DraftProvider } from '../../context/DraftContext';

export default function RootLayout() {
  return (
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
  );
}