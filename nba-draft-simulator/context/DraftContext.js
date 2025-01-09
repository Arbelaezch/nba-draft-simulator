import { createContext, useContext, useReducer } from 'react';

const initialState = {
  availablePlayers: [],
  teams: [],
  currentPick: 1,
  draftOrder: [],
  isUserTurn: true,
  draftComplete: false
};

function draftReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_DRAFT':
      return {
        ...state,
        availablePlayers: action.players,
        teams: action.teams,
        draftOrder: action.draftOrder,
        isUserTurn: action.draftOrder[0] === 1 // Assuming team 1 is user's team
      };
      
    case 'MAKE_PICK': {
      const updatedPlayers = state.availablePlayers.filter(p => p.id !== action.player.id);
      const updatedTeams = state.teams.map(team => 
        team.id === action.teamId 
          ? { ...team, roster: [...team.roster, action.player] }
          : team
      );
      
      const newPickNumber = state.currentPick + 1;
      const draftComplete = newPickNumber > state.draftOrder.length;
      
      return {
        ...state,
        availablePlayers: updatedPlayers,
        teams: updatedTeams,
        currentPick: newPickNumber,
        draftComplete
      };
    }
    
    case 'SET_USER_TURN':
      return {
        ...state,
        isUserTurn: action.value
      };

    default:
      return state;
  }
}

const DraftContext = createContext();

export function DraftProvider({ children }) {
  const [state, dispatch] = useReducer(draftReducer, initialState);

  return (
    <DraftContext.Provider value={{ state, dispatch }}>
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft() {
  const context = useContext(DraftContext);
  if (context === undefined) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
}