import { createContext, useContext, useReducer } from 'react';

const initialState = {
  availablePlayers: [],
  teams: [],
  currentPick: 1,
  draftOrder: [],
  isUserTurn: false,
};

function draftReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_DRAFT':
      return {
        ...state,
        availablePlayers: action.players,
        teams: action.teams,
        draftOrder: action.draftOrder,
      };
    case 'MAKE_PICK':
      return {
        ...state,
        availablePlayers: state.availablePlayers.filter(p => p.id !== action.player.id),
        teams: state.teams.map(team => 
          team.id === action.teamId 
            ? { ...team, roster: [...team.roster, action.player] }
            : team
        ),
      };
    case 'ADVANCE_TURN':
      return {
        ...state,
        currentPick: state.currentPick + 1,
        isUserTurn: state.draftOrder[state.currentPick % state.draftOrder.length] === 1,
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