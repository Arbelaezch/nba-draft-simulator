// Main component for handling the draft interface and logic
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { useDraft } from '../../context/DraftContext';
import { useSettings } from '../../context/SettingsContext';
import { nbaService } from '../../services/nbaService';
import { settingsService } from '../../services/settingsService';
import PlayerCard from '../../components/PlayerCard';


export default function DraftScreen() {
  // Access draft state and dispatch from context
  const { state, dispatch } = useDraft();
  // Loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();

  // Initialize draft data when component mounts
  useEffect(() => {
    initializeDraft();
  }, []);

  useEffect(() => {
    if (state.processingAI && !state.isUserTurn && !state.draftComplete) {
      const timer = setTimeout(() => {
        console.log("\n");
        console.log("Process AI Picks called");
        console.log("Current pick:", state.currentPick);
        
        const nextTeamId = state.draftOrder[state.currentPick - 1];
        const nextTeam = state.teams.find(t => t.id === nextTeamId);
        
        // If no next team, draft is complete
        if (!nextTeam) {
          console.log("No next team - draft complete");
          router.push('/evaluation');
          return;
        }
      
        // If next pick is user's turn, we're already done
        if (nextTeam.isUser) {
          console.log("Next team is user - ending AI picks");
          dispatch({ type: 'SET_PROCESSING_AI', value: false });
          return;
        }
      
        // Make AI pick...
        console.log("Making AI pick for team:", nextTeam.name);
        const aiPick = makeAIPick(state.availablePlayers, nextTeam);
        
        if (!aiPick) {
          console.error('No available players for AI to pick');
          return;
        }

        // console.log("AI selected player:", aiPick.name);
      
        dispatch({
          type: 'MAKE_PICK',
          player: aiPick,
          teamId: nextTeam.id
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
    
    if (state.draftComplete) {
      console.log("No next team - draft complete");
      router.push('/evaluation');
      return;
    }
  }, [state.processingAI, state.currentPick, state.isUserTurn]);

  

  // Fetch initial draft data and set up draft order
  const initializeDraft = async () => {
    try {
      // Get draft settings (either from advanced setup or defaults)
      const draftSettings = {
        currentRounds: settings.currentRounds || settings.defaultRounds,
        currentPlayerPool: settings.currentPlayerPool || settings.defaultPlayerPool,
        aiTeamCount: settings.aiTeamCount || 5,
        userTeam: settings.userTeam || settings.defaultTeam,
        draftType: settings.draftType || 'snake',
        userDraftPosition: settings.userDraftPosition || 'first'
      };

      // Get players based on selected pool
      const players = await nbaService.getPlayers(draftSettings.currentPlayerPool);
      
      // Get teams with proper count and user team
      const teams = nbaService.getTeams(draftSettings.currentRounds, draftSettings.aiTeamCount);

      // Update user team name if specified
      const userTeamIndex = teams.findIndex(t => t.isUser);
      if (userTeamIndex !== -1) {
        teams[userTeamIndex].name = draftSettings.userTeam;
      }
      
      // Generate snake draft order based on number of teams
      // const draftOrder = generateSnakeDraftOrder(teams.length);

      // Generate draft order based on settings
      const draftOrder = settingsService.generateDraftOrder(draftSettings, teams);
      
      // Initialize draft state
      dispatch({
        type: 'INITIALIZE_DRAFT',
        players,
        teams,
        draftOrder,
        settings: draftSettings
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing draft:', error);
    }
  };

  // Generate snake draft order where order reverses each round
  const generateSnakeDraftOrder = (numTeams) => {
    const rounds = 5; // Number of draft rounds
    const order = [];
    
    for (let round = 0; round < rounds; round++) {
      // Create array of team numbers for this round
      const roundTeams = [...Array(numTeams)].map((_, index) => index + 1);
      // Reverse order for odd-numbered rounds (snake draft)
      if (round % 2 === 1) {
        roundTeams.reverse();
      }
      order.push(...roundTeams);
    }
    // console.log("order", order);
    // [1, 2, 3, 4, 5, 6, 6, 5,.. 6]
    return order;
  };

  // AI logic for selecting players based on team needs
  const makeAIPick = (availablePlayers, team) => {
    console.log('\nMaking AI pick for team:', team.name);
    // console.log('Available players:', availablePlayers.length);
    
    // Calculate current team needs based on roster
    const needs = nbaService.calculateTeamNeeds(team.roster, state.settings.currentRounds);
    console.log('Team needs:', needs);

    // Create priority list based on needs
    const priorities = Object.entries(needs).map(([position, stats]) => ({
      position,
      priority: (stats.target - stats.current) / stats.target
    })).sort((a, b) => b.priority - a.priority);

    // Filter players by primary and secondary positions based on priorities
    const candidatePlayers = availablePlayers.filter(player => {
      const primaryMatch = priorities.some(p => 
        p.position === player.primaryPosition && p.priority > 0
      );
      const secondaryMatch = priorities.some(p => 
        p.position === player.secondaryPosition && p.priority > 0
      );
      return primaryMatch || secondaryMatch;
    });

    // If no players match needs, use all available players
    const selectablePlayers = candidatePlayers.length > 0 ? 
      candidatePlayers : availablePlayers;
    
    if (selectablePlayers.length === 0) {
      console.error('No candidate players available!');
      return null;
    }

    // Sort by rating with random factor for variety
    const selectedPlayer = selectablePlayers.sort((a, b) => {
      const ratingDiff = b.overall_rating - a.overall_rating;
      const randomFactor = Math.random() * 10 - 5;
      return ratingDiff + randomFactor;
    })[0];

    console.log('Selected player:', selectedPlayer.name);
    return selectedPlayer;
  };

  // Handle user selecting a player
  const handlePlayerSelect = (player) => {
    console.log("\nhandlePlayerSelect called");
    if (!state.isUserTurn) return;
    
    // Process user's pick
    dispatch({
      type: 'MAKE_PICK',
      player,
      teamId: state.teams.find(team => team.isUser).id
    });
    
    // Start AI processing
    dispatch({ type: 'SET_PROCESSING_AI', value: true });
  };

  // Get current team's name for display
  const getCurrentTeamName = () => {
    if (!state.draftOrder.length || state.currentPick > state.draftOrder.length) return '';
    const currentTeamId = state.draftOrder[state.currentPick - 1];
    const team = state.teams.find(t => t.id === currentTeamId);
    return team ? team.name : '';
  };

  // Loading state UI
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading draft data...</Text>
      </View>
    );
  }

  // Main draft UI
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {state.isUserTurn ? "Your Pick" : `${getCurrentTeamName()} is picking...`}
        </Text>
        <Text style={styles.pickNumber}>
          Pick #{state.currentPick} of {state.draftOrder.length}
        </Text>
      </View>

      <FlatList
        data={state.availablePlayers}
        renderItem={({ item }) => (
          <PlayerCard
            player={item}
            onSelect={handlePlayerSelect}
            disabled={!state.isUserTurn}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.playerList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pickNumber: {
    fontSize: 16,
    color: '#666',
  },
  playerList: {
    padding: 16,
  },
});