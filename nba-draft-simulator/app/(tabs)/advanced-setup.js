import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useState } from 'react';

import { useSettings } from '../../context/SettingsContext';
import { settingsService } from '../../services/settingsService';
import { NBA_TEAMS_DATA } from '../../data/teamsList';

export default function AdvancedSetupScreen() {
  const { settings, dispatch } = useSettings();
  const [isFocus, setIsFocus] = useState(false);

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
    // console.log("draftSetup", draftSetup);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Advanced Draft Setup</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Number of AI Teams</Text>
        <Dropdown
          data={[3, 5, 7, 11, 20, 29].map(num => ({
            label: num.toString() + ' Teams',
            value: num
          }))}
          value={draftSetup.aiTeamCount}
          onChange={item => updateDraftSetup('aiTeamCount', item.value)}
          labelField="label"
          valueField="value"
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.dropdownContainer}
          itemStyle={styles.dropdownItem}
          itemContainerStyle={styles.dropdownItemContainer}
          placeholder="Select Number of Teams"
          maxHeight={300}
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
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.dropdownContainer}
          itemStyle={styles.dropdownItem}
          itemContainerStyle={styles.dropdownItemContainer}
          search
          searchPlaceholder="Search for a team..."
          placeholder="Select Your Team"
          maxHeight={300}
          searchContainerStyle={styles.searchContainer}
          renderInputSearch={(onSearch) => (
            <View style={styles.searchInputContainer}>
              <TextInput
                onChangeText={onSearch}
                placeholder="Search for a team..."
                style={styles.searchInput}
                placeholderTextColor="#666666"
                accessible={true}
                accessibilityRole="search"
                accessibilityLabel="Search for a team"
                accessibilityHint={null}
              />
            </View>
          )}
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
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.dropdownContainer}
          itemStyle={styles.dropdownItem}
          itemContainerStyle={styles.dropdownItemContainer}
          placeholder="Select Draft Type"
          maxHeight={300}
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
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.dropdownContainer}
          itemStyle={styles.dropdownItem}
          itemContainerStyle={styles.dropdownItemContainer}
          placeholder="Select Draft Position"
          maxHeight={300}
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
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.dropdownContainer}
          itemStyle={styles.dropdownItem}
          itemContainerStyle={styles.dropdownItemContainer}
          placeholder="Select Number of Rounds"
          maxHeight={300}
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
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={styles.dropdownContainer}
          itemStyle={styles.dropdownItem}
          itemContainerStyle={styles.dropdownItemContainer}
          placeholder="Select Player Pool"
          maxHeight={300}
        />
      </View>

      <Button 
        mode="contained" 
        onPress={startDraft}
        style={styles.button}
        contentStyle={{ height: 50 }}
        accessible={true}
        accessibilityLabel="Start Draft"
        accessibilityHint="Begin the draft with your selected settings"
        accessibilityRole="button"
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
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdown: {
    height: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    pointerEvents: 'auto',
  },
  dropdownContainer: {
    marginTop: 4,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#666',
    height: 90,
    textAlignVertical: 'center',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#000',
    height: 90,
    textAlignVertical: 'center',
  },
  dropdownItem: {
    height: 48,
    justifyContent: 'center',
    textAlignVertical: 'center',
  },
  dropdownItemContainer: {
    height: 70,
    justifyContent: 'center',
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  searchContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInputContainer: {
    height: 60,
    justifyContent: 'center',
  },
  searchInput: {
    height: 60,
    fontSize: 16,
    paddingHorizontal: 8,
  },
});