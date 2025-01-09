// Context provider for managing draft state
import { createContext, useContext, useReducer } from 'react';

// Initial draft state
const initialState = {
  availablePlayers: [],
  teams: [],
  currentPick: 1,
  draftOrder: [],
  isUserTurn: true,
  draftComplete: false,
  draftedPlayers: []
};

// Reducer for handling draft state updates
function draftReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_DRAFT': {
      // Set up initial draft state with provided data
      const firstTeamId = action.draftOrder[0];
      const firstTeam = action.teams.find(t => t.id === firstTeamId);
      
      return {
        ...state,
        availablePlayers: action.players,
        teams: action.teams.map(team => ({
          ...team,
          roster: []
        })),
        draftOrder: action.draftOrder,
        isUserTurn: firstTeam.isUser,
        draftedPlayers: [],
        currentPick: 1,
        draftComplete: false
      };
    }
      
    case 'MAKE_PICK': {
      // Update state when a pick is made
      const updatedPlayers = state.availablePlayers.filter(p => p.id !== action.player.id);
      const updatedTeams = state.teams.map(team => 
        team.id === action.teamId 
          ? { ...team, roster: [...(team.roster || []), action.player] }
          : team
      );
      
      const newPickNumber = state.currentPick + 1;
      const draftComplete = newPickNumber > state.draftOrder.length;
      
      return {
        ...state,
        availablePlayers: updatedPlayers,
        teams: updatedTeams,
        draftedPlayers: [...state.draftedPlayers, { ...action.player, teamId: action.teamId }],
        currentPick: newPickNumber,
        isUserTurn: false,
        draftComplete
      };
    }
    
    case 'SET_USER_TURN':
      // Toggle user's turn
      return {
        ...state,
        isUserTurn: action.value
      };

    default:
      return state;
  }
}

// Create context
const DraftContext = createContext();

// Context provider component
export function DraftProvider({ children }) {
  const [state, dispatch] = useReducer(draftReducer, initialState);

  return (
    <DraftContext.Provider value={{ state, dispatch }}>
      {children}
    </DraftContext.Provider>
  );
}

// Custom hook for accessing draft context
export function useDraft() {
  const context = useContext(DraftContext);
  if (context === undefined) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
}