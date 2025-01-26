import { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@nba_draft_settings';

const initialSettings = {
  // User preferences (saved)
  defaultTeam: 'Miami Heat',
  defaultPlayerPool: 'current',
  defaultRounds: 5,
  
  // Internal state
  isLoading: true,
  hasLoadedInitialSettings: false
};

function settingsReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_SETTINGS':
      return {
        ...state,
        ...action.settings,
        isLoading: false,
        hasLoadedInitialSettings: true
      };
      
    case 'UPDATE_DEFAULT_SETTINGS':
      return {
        ...state,
        defaultTeam: action.settings.defaultTeam ?? state.defaultTeam,
        defaultPlayerPool: action.settings.defaultPlayerPool ?? state.defaultPlayerPool,
        defaultRounds: action.settings.defaultRounds ?? state.defaultRounds
      };


    default:
      return state;
  }
}

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

  // Load saved settings on mount
  useEffect(() => {
    loadSavedSettings();
  }, []);

  // Save settings when defaults change
  useEffect(() => {
    if (settings.hasLoadedInitialSettings) {
      saveSettings();
    }
  }, [settings.defaultTeam, settings.defaultPlayerPool, settings.defaultRounds]);

  const loadSavedSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        dispatch({ 
          type: 'INITIALIZE_SETTINGS', 
          settings: JSON.parse(savedSettings)
        });
      } else {
        dispatch({ 
          type: 'INITIALIZE_SETTINGS', 
          settings: initialSettings
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      dispatch({ 
        type: 'INITIALIZE_SETTINGS', 
        settings: initialSettings
      });
    }
  };

  const saveSettings = async () => {
    try {
      const settingsToSave = {
        defaultTeam: settings.defaultTeam,
        defaultPlayerPool: settings.defaultPlayerPool,
        defaultRounds: settings.defaultRounds
      };
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settingsToSave)
      );
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
