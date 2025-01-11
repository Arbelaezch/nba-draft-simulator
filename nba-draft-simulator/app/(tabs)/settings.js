import { View, Text, StyleSheet } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { useSettings } from '../../context/SettingsContext';
import { settingsService } from '../../services/settingsService';
import { NBA_TEAMS_DATA } from '../../data/teamsList';
import { useEffect, useState } from 'react';

export default function SettingsScreen() {
  const { settings, dispatch } = useSettings();
  const [selectedTeam, setSelectedTeam] = useState(settings.defaultTeam);
  const [selectedPool, setSelectedPool] = useState(settings.defaultPlayerPool);
  const [selectedRounds, setSelectedRounds] = useState(settings.defaultRounds.toString());

  // Initialize local state when settings change
  useEffect(() => {
    setSelectedTeam(settings.defaultTeam);
    setSelectedPool(settings.defaultPlayerPool);
    setSelectedRounds(settings.defaultRounds.toString());
  }, [settings]);

  const updateSettings = (key, value) => {
    dispatch({
      type: 'UPDATE_DEFAULT_SETTINGS',
      settings: { [key]: value }
    });
  };

  // Format team data with logos
  const teamData = NBA_TEAMS_DATA.map(team => ({
    key: team.name,
    value: team.name,
    label: team.name,
    logo: team.logo,
  }));

  // Format rounds data once
  const roundsData = [5, 7, 10, 12, 15].map(num => ({ 
    key: num.toString(),
    value: num.toString() + ' Rounds'
  }));

  // Format pool data once
  const poolData = settingsService.getPlayerPools().map(pool => ({
    key: pool.value,
    value: pool.label || pool.value
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Default Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Favorite Team</Text>
        <SelectList
            setSelected={(value) => {
                setSelectedTeam(value);
                updateSettings('defaultTeam', value);
            }}
            data={teamData}
            save="value"
            defaultOption={teamData.find(team => 
                team.value === (settings.userTeam || settings.defaultTeam)
            )}
            search={true}
            boxStyles={styles.dropdown}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Default Player Pool</Text>
        <SelectList
          setSelected={(value) => {
            setSelectedPool(value);
            updateSettings('defaultPlayerPool', value);
          }}
          data={poolData}
          defaultOption={poolData.find(item => item.key === selectedPool)}
          boxStyles={styles.dropdown}
          inputStyles={styles.input}
          dropdownStyles={styles.dropdownList}
          save="key"
          value={selectedPool}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Default Draft Rounds</Text>
        <SelectList
          setSelected={(value) => {
            setSelectedRounds(value);
            updateSettings('defaultRounds', parseInt(value));
          }}
          data={roundsData}
          defaultOption={roundsData.find(item => item.key === selectedRounds)}
          boxStyles={styles.dropdown}
          inputStyles={styles.input}
          dropdownStyles={styles.dropdownList}
          save="key"
          value={selectedRounds}
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
  dropdownList: {
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    color: '#000',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
  },
});