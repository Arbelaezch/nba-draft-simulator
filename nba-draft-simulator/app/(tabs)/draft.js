import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useDraft } from '../../context/DraftContext';
import { nbaService } from '../../services/nbaService';
import PlayerCard from '../../components/PlayerCard';
import { router } from 'expo-router';

export default function DraftScreen() {
  const { state, dispatch } = useDraft();
  const [isLoading, setIsLoading] = useState(true);
  const [currentTeam, setCurrentTeam] = useState(null);

  useEffect(() => {
    initializeDraft();
  }, []);

  const initializeDraft = async () => {
    try {
      // Fetch players and initialize teams
      const players = await nbaService.getPlayers();
      const teams = nbaService.getTeams();
      
      // Generate draft order (snake draft format)
      const draftOrder = generateSnakeDraftOrder(teams.length);
      
      dispatch({
        type: 'INITIALIZE_DRAFT',
        players,
        teams,
        draftOrder,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing draft:', error);
      // Add error handling UI here
    }
  };

  const generateSnakeDraftOrder = (numTeams) => {
    const rounds = 5; // Number of draft rounds
    const order = [];
    
    for (let round = 0; round < rounds; round++) {
      if (round % 2 === 0) {
        // Forward round
        for (let team = 1; team <= numTeams; team++) {
          order.push(team);
        }
      } else {
        // Reverse round (snake)
        for (let team = numTeams; team >= 1; team--) {
          order.push(team);
        }
      }
    }
    return order;
  };

  const makeAIPick = (availablePlayers, team) => {
    // Simple AI logic - can be expanded later
    const bestPlayer = availablePlayers.reduce((best, current) => {
      const bestRating = best.overall_rating;
      const currentRating = current.overall_rating;
      return currentRating > bestRating ? current : best;
    });
    
    return bestPlayer;
  };

  const handlePlayerSelect = (player) => {
    if (!state.isUserTurn) return;
    
    // Make user's pick
    dispatch({
      type: 'MAKE_PICK',
      player,
      teamId: state.teams.find(team => team.isUser).id
    });
    
    // Process AI picks
    processAIPicks();
  };

  const processAIPicks = () => {
    const currentPickIndex = state.currentPick - 1;
    let nextPick = currentPickIndex;
    
    // Process AI picks until it's user's turn again or draft is over
    while (nextPick < state.draftOrder.length) {
      const nextTeamId = state.draftOrder[nextPick];
      const team = state.teams.find(t => t.id === nextTeamId);
      
      if (team.isUser) {
        dispatch({ type: 'SET_USER_TURN', value: true });
        break;
      }

      // Make AI pick
      const aiPick = makeAIPick(state.availablePlayers, team);
      dispatch({
        type: 'MAKE_PICK',
        player: aiPick,
        teamId: team.id
      });

      nextPick++;

      // Check if draft is complete
      if (nextPick >= state.draftOrder.length) {
        router.push('/evaluation');
        break;
      }
    }
  };

  const getCurrentTeamName = () => {
    if (!state.draftOrder.length) return '';
    const currentTeamId = state.draftOrder[state.currentPick - 1];
    const team = state.teams.find(t => t.id === currentTeamId);
    return team ? team.name : '';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading draft data...</Text>
      </View>
    );
  }

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