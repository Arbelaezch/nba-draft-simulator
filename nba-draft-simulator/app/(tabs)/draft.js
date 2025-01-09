// Main component for handling the draft interface and logic
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useDraft } from '../../context/DraftContext';
import { nbaService } from '../../services/nbaService';
import PlayerCard from '../../components/PlayerCard';
import { router } from 'expo-router';

export default function DraftScreen() {
  // Access draft state and dispatch from context
  const { state, dispatch } = useDraft();
  // Loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);

  // Initialize draft data when component mounts
  useEffect(() => {
    initializeDraft();
  }, []);

  // Fetch initial draft data and set up draft order
  const initializeDraft = async () => {
    try {
      // Get player data from NBA service
      const players = await nbaService.getPlayers();
      // Get team data from NBA service
      const teams = nbaService.getTeams();
      // Generate snake draft order based on number of teams
      const draftOrder = generateSnakeDraftOrder(teams.length);
      
      // Initialize draft state with fetched data
      dispatch({
        type: 'INITIALIZE_DRAFT',
        players,
        teams,
        draftOrder,
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
    return order;
  };

  // AI logic for selecting players based on team needs
  const makeAIPick = (availablePlayers, team) => {
    // Calculate current team needs based on roster
    const needs = nbaService.calculateTeamNeeds(team.roster);
    
    // Filter available players by team positional needs
    const neededPlayers = availablePlayers.filter(player => needs[player.position]);
    
    // Use all available players if no players match needs
    const candidatePlayers = neededPlayers.length > 0 ? neededPlayers : availablePlayers;
    
    // Sort players by rating with random factor for variety
    return candidatePlayers.sort((a, b) => {
      const ratingDiff = b.overall_rating - a.overall_rating;
      const randomFactor = Math.random() * 10 - 5; // Add randomness of ±5 to rating
      return ratingDiff + randomFactor;
    })[0];
  };

  // Handle user selecting a player
  const handlePlayerSelect = (player) => {
    if (!state.isUserTurn) return;
    
    // Process user's pick
    dispatch({
      type: 'MAKE_PICK',
      player,
      teamId: state.teams.find(team => team.isUser).id
    });

    // Trigger AI picks after user's pick
    setTimeout(processAIPicks, 0);
  };

  // Process AI team picks
  const processAIPicks = () => {
    // Get next team in draft order
    const nextTeamId = state.draftOrder[state.currentPick - 1];
    const nextTeam = state.teams.find(t => t.id === nextTeamId);
    
    // If no next team, draft is complete
    if (!nextTeam) {
      router.push('/evaluation');
      return;
    }

    // If next pick is user's turn, set flag and return
    if (nextTeam.isUser) {
      dispatch({ type: 'SET_USER_TURN', value: true });
      return;
    }

    // Make AI pick for current team
    const aiPick = makeAIPick(
      state.availablePlayers,
      nextTeam
    );

    if (!aiPick) {
      console.error('No available players for AI to pick');
      return;
    }

    // Process the AI pick
    dispatch({
      type: 'MAKE_PICK',
      player: aiPick,
      teamId: nextTeam.id
    });

    // Check next team after this pick
    const pickAfterThis = state.currentPick + 1;
    const nextNextTeamId = state.draftOrder[pickAfterThis - 1];
    const nextNextTeam = state.teams.find(t => t.id === nextNextTeamId);
    
    // Continue AI picks or set user turn
    if (nextNextTeam && !nextNextTeam.isUser) {
      setTimeout(processAIPicks, 500); // Delay for visual feedback
    } else if (nextNextTeam && nextNextTeam.isUser) {
      dispatch({ type: 'SET_USER_TURN', value: true });
    } else {
      router.push('/evaluation');
    }
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
        <Text style={styles.pickNumber}>Pick #{state.currentPick}</Text>
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