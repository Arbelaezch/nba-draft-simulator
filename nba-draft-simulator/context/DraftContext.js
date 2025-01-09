// Context provider for managing draft state
import { createContext, useContext, useReducer } from 'react';
import { nbaService } from '../services/nbaService';

// Initial draft state
const initialState = {
  availablePlayers: [],
  teams: [],
  currentPick: 1,
  draftOrder: [],
  isUserTurn: true,
  draftComplete: false,
  draftedPlayers: [],
  processingAI: false
};

// Reducer for handling draft state updates
// Gets teamid, player, and action type.
function draftReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_DRAFT': {
      console.log("\n");
      console.log("INITIALIZE_DRAFT action received");
      // Set up initial draft state with provided data
      const firstTeamId = action.draftOrder[0];
      const firstTeam = action.teams.find(t => t.id === firstTeamId);
      const initial_player_list = action.players.map(player => player.name);
      // console.log("Players list:", initial_player_list);
      console.log("Teams list:", action.teams);
      console.log("Draft order:", action.draftOrder);
      
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
      console.log("\n")
      // const testAction = { type: 'MAKE_PICK', player: { id: 1, name: action.player.name }, teamId: 1 };
      console.log("current pick", state.currentPick);
      console.log("MAKE_PICK action received");
      console.log("teamId:", action.teamId);
      console.log("team needs:", state.teams.find(t => t.id === action.teamId).needs);
      console.log("player selected:", action.player.name);
      // console.log("Current state:", state);

      const updatedPlayers = state.availablePlayers.filter(p => p.id !== action.player.id);
      
      const updatedTeams = state.teams.map(team => {
        if (team.id === action.teamId) {
          const updatedRoster = [...(team.roster || []), action.player];
          return {
            ...team,
            roster: updatedRoster,
            // Recalculate needs based on updated roster
            needs: nbaService.calculateTeamNeeds(updatedRoster)
          };
        }
        return team;
      });
      
      const newPickNumber = state.currentPick + 1;
      const draftComplete = newPickNumber > state.draftOrder.length;
      
      // Get the next team in the draft order
      // Only try to get next team if draft isn't complete
      const nextTeamId = !draftComplete ? state.draftOrder[newPickNumber - 1] : null;
      const nextTeam = !draftComplete ? state.teams.find(t => t.id === nextTeamId) : null;

      // const updated_players_list = updatedPlayers.map(player => player.name);
      // console.log("Updated players:", updated_players_list);
      console.log("nextTeamId:", nextTeamId);
      // console.log("nextTeam:", nextTeam);
      // console.log("updatedTeams:", updatedTeams);
      // let drafted_players_list = state.draftedPlayers.map(player => player.name);
      // drafted_players_list.push(action.player.name);
      // console.log("draftedPlayers:", drafted_players_list);
      // console.log("currentPick at the end of MAKE_PICK:", newPickNumber);
      // console.log("isUserTurn:", nextTeam?.isUser ?? false);

      if (draftComplete) {
        console.log("Draft is complete!");
      }
      
      return { 
        ...state, 
        availablePlayers: updatedPlayers, 
        teams: updatedTeams, 
        draftedPlayers: [...state.draftedPlayers, { ...action.player, teamId: action.teamId }], 
        currentPick: newPickNumber, 
        isUserTurn: nextTeam?.isUser ?? false, 
        draftComplete 
      };
    }

    case 'SET_PROCESSING_AI':
      return {
        ...state,
        processingAI: action.value
      };
    
    case 'SET_USER_TURN':
      // console.log("\n")
      // console.log("SET_USER_TURN action received");
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