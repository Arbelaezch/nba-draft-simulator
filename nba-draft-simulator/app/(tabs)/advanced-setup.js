import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useState } from 'react';

import { useSettings } from '../../context/SettingsContext';
import { settingsService } from '../../services/settingsService';
import { NBA_TEAMS_DATA } from '../../data/teamsList';

export default function AdvancedSetupScreen() {
  const { settings, dispatch } = useSettings();

  // Local state for draft setup
  const [draftSetup, setDraftSetup] = useState({
    aiTeamCount: 5,
    userTeam: settings.defaultTeam,
    draftType: settings.defaultDraftType,
    userDraftPosition: 'first',
    currentRounds: settings.defaultRounds,
    currentPlayerPool: settings.defaultPlayerPool
  });

  const updateDraftSetup = (key, value) => {
    setDraftSetup(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const startDraft = () => {
    console.log("draftSetup", draftSetup);
    router.push({
      pathname: '/draft',
      params: draftSetup
    });
  };

  // Format team data for Dropdown
  const teamData = NBA_TEAMS_DATA.map(team => ({
    key: team.name,
    value: team.name,
    label: team.name,
    logo: team.logo
  }));

  // Format AI teams count data
  const aiTeamsData = [3, 5, 7, 11].map(num => ({ 
    key: num.toString(),
    value: num.toString(), 
    label: num.toString() + ' Teams'
  }));

  // Format rounds data
  const roundsData = [5, 7, 10, 12].map(num => ({ 
    key: num.toString(),
    value: num.toString(), 
    label: num.toString() + ' Rounds'
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Advanced Draft Setup</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Number of AI Teams</Text>
        <Dropdown
          data={[3, 5, 7, 11].map(num => ({
            label: num.toString() + ' Teams',
            value: num
          }))}
          value={draftSetup.aiTeamCount}
          onChange={item => updateDraftSetup('aiTeamCount', item.value)}
          labelField="label"
          valueField="value"
          style={styles.dropdown}
          placeholder="Select Number of Teams"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Your Team</Text>
        <Dropdown
          data={teamData}
          value={draftSetup.userTeam}
          onChange={item => updateDraftSetup('userTeam', item.value)}
          labelField="label"
          valueField="value"
          style={styles.dropdown}
          search
          searchPlaceholder="Search for a team..."
          placeholder="Select Your Team"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Draft Type</Text>
        <Dropdown
          data={[
            { label: 'Snake', value: 'snake' },
            { label: 'Linear', value: 'linear' }
          ]}
          value={draftSetup.draftType}
          onChange={item => updateDraftSetup('draftType', item.value)}
          labelField="label"
          valueField="value"
          style={styles.dropdown}
          placeholder="Select Draft Type"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Your Draft Position</Text>
        <Dropdown
          data={[
            { label: 'First', value: 'first' },
            { label: 'Last', value: 'last' },
            { label: 'Random', value: 'random' }
          ]}
          value={draftSetup.userDraftPosition}
          onChange={item => updateDraftSetup('userDraftPosition', item.value)}
          labelField="label"
          valueField="value"
          style={styles.dropdown}
          placeholder="Select Draft Position"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Number of Rounds</Text>
        <Dropdown
          data={[5, 7, 10, 12].map(num => ({
            label: num.toString() + ' Rounds',
            value: num
          }))}
          value={draftSetup.currentRounds}
          onChange={item => updateDraftSetup('currentRounds', item.value)}
          labelField="label"
          valueField="value"
          style={styles.dropdown}
          placeholder="Select Number of Rounds"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Player Pool</Text>
        <Dropdown
            data={settingsService.getPlayerPools()}
            onChange={(item) => updateDraftSetup('currentPlayerPool', item.value)}
            value={draftSetup.currentPlayerPool}
            labelField="label"
            valueField="value"
            style={styles.dropdown}
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
      height: 50,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      backgroundColor: '#fff',
    },
    button: {
      marginTop: 24,
      paddingVertical: 8,
    }
});