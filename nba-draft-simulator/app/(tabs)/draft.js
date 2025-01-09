import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { useDraft } from '../../context/DraftContext';

export default function DraftScreen() {
  const { state, dispatch } = useDraft();

  useEffect(() => {
    // Initialize draft data
    // We'll implement this later
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Draft Screen (Coming Soon)</Text>
    </View>
  );
}