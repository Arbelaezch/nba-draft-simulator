import { View, Text, StyleSheet } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { useSettings } from '../../context/SettingsContext';
import { settingsService } from '../../services/settingsService';
import { NBA_TEAMS } from '../../data/teamsList';

export default function SettingsScreen() {
  const { settings, dispatch } = useSettings();

  const updateSettings = (key, value) => {
    dispatch({
      type: 'UPDATE_DEFAULT_SETTINGS',
      settings: { [key]: value }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Default Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Favorite Team</Text>
        <SelectList
          setSelected={(value) => updateSettings('defaultTeam', value)}
          data={NBA_TEAMS.map(team => ({ value: team, label: team }))}
          save="value"
          defaultOption={{ value: settings.defaultTeam, label: settings.defaultTeam }}
          search={true}
          boxStyles={styles.dropdown}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Default Player Pool</Text>
        <SelectList
          setSelected={(value) => updateSettings('defaultPlayerPool', value)}
          data={settingsService.getPlayerPools()}
          save="value"
          defaultOption={settingsService.getPlayerPools()
            .find(pool => pool.value === settings.defaultPlayerPool)}
          boxStyles={styles.dropdown}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Default Draft Rounds</Text>
        <SelectList
          setSelected={(value) => updateSettings('defaultRounds', parseInt(value))}
          data={[5, 7, 10, 12, 15].map(num => ({ 
            value: num.toString(), 
            label: num.toString() + ' Rounds'
          }))}
          save="value"
          defaultOption={{ 
            value: settings.defaultRounds.toString(),
            label: settings.defaultRounds.toString() + ' Rounds'
          }}
          boxStyles={styles.dropdown}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 24,
    },
    section: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      fontWeight: '500',
    },
    dropdown: {
      borderColor: '#ddd',
      backgroundColor: '#fff',
    },
    button: {
      marginTop: 24,
      paddingVertical: 8,
    },
});