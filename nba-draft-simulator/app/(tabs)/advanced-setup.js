import { View, Text, StyleSheet } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';

import { useSettings } from '../../context/SettingsContext';
import { settingsService } from '../../services/settingsService';
import { NBA_TEAMS_DATA } from '../../data/teamsList';

export default function AdvancedSetupScreen() {
  const { settings, dispatch } = useSettings();

  const updateAdvancedSetup = (key, value) => {
    dispatch({
      type: 'UPDATE_ADVANCED_SETUP',
      settings: { [key]: value }
    });
  };

  const startDraft = () => {
    router.push('/draft');
  };

  // Format team data for SelectList
  const teamData = NBA_TEAMS_DATA.map(team => ({
    key: team.name,
    value: team.name,
    label: team.name,
    logo: team.logo
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Advanced Draft Setup</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Number of AI Teams</Text>
        <SelectList
          setSelected={(value) => updateAdvancedSetup('aiTeamCount', parseInt(value))}
          data={[3, 5, 7, 11].map(num => ({ 
            value: num.toString(), 
            label: num.toString() + ' Teams'
          }))}
          save="value"
          defaultOption={{ 
            value: settings.aiTeamCount.toString(),
            label: settings.aiTeamCount.toString() + ' Teams'
          }}
          boxStyles={styles.dropdown}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Your Team</Text>
        <SelectList
          setSelected={(value) => updateAdvancedSetup('userTeam', value)}
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
        <Text style={styles.label}>Draft Type</Text>
        <SelectList
          setSelected={(value) => updateAdvancedSetup('draftType', value)}
          data={settingsService.getDraftTypes()}
          save="value"
          defaultOption={settingsService.getDraftTypes()
            .find(type => type.value === settings.draftType)}
          boxStyles={styles.dropdown}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Your Draft Position</Text>
        <SelectList
          setSelected={(value) => updateAdvancedSetup('userDraftPosition', value)}
          data={settingsService.getDraftPositions()}
          save="value"
          defaultOption={settingsService.getDraftPositions()
            .find(pos => pos.value === settings.userDraftPosition)}
          boxStyles={styles.dropdown}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Number of Rounds</Text>
        <SelectList
          setSelected={(value) => updateAdvancedSetup('currentRounds', parseInt(value))}
          data={[5, 7, 10, 12, 15].map(num => ({ 
            value: num.toString(), 
            label: num.toString() + ' Rounds'
          }))}
          save="value"
          defaultOption={{ 
            value: (settings.currentRounds || settings.defaultRounds).toString(),
            label: (settings.currentRounds || settings.defaultRounds).toString() + ' Rounds'
          }}
          boxStyles={styles.dropdown}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Player Pool</Text>
        <SelectList
          setSelected={(value) => updateAdvancedSetup('currentPlayerPool', value)}
          data={settingsService.getPlayerPools()}
          save="value"
          defaultOption={settingsService.getPlayerPools()
            .find(pool => pool.value === (settings.currentPlayerPool || settings.defaultPlayerPool))}
          boxStyles={styles.dropdown}
        />
      </View>

      <Button 
        mode="contained" 
        onPress={startDraft}
        style={styles.button}
      >
        Start Draft
      </Button>
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
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    dropdownItemText: {
      fontSize: 16,
      marginLeft: 12,
    },
    selectedTeam: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    selectedTeamText: {
      fontSize: 16,
      marginLeft: 12,
    },
});