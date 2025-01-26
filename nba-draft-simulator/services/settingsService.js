export const settingsService = {
  getDraftTypes() {
    return [
      { value: 'snake', label: 'Snake Draft' },
      { value: 'linear', label: 'Linear Order' },
    ];
  },

  getPlayerPools() {
    return [
      { value: 'current', label: 'Current Players' },
      { value: 'allTime', label: 'All-Time Players' },
    ];
  },

  getDraftPositions() {
    return [
      { value: 'first', label: 'First Pick' },
      { value: 'last', label: 'Last Pick' },
      { value: 'random', label: 'Random Position' }
    ];
  },

  generateDraftOrder(settings, teams) {
    const totalTeams = teams.length;
    let baseOrder = [];
    const userTeam = teams.find(t => t.isUser);
    const userTeamId = userTeam ? userTeam.id : 1;
    
    // Generate base order for the round
    const generateBaseRoundOrder = () => {
      return [...Array(totalTeams)].map((_, index) => index + 1);
    };

    // Adjust team positions based on user preference
    const adjustForUserPosition = (roundOrder) => {
      switch (settings.userDraftPosition) {
        case 'first':
          // For first pick, just swap user to first position if needed
          if (roundOrder[0] !== userTeamId) {
            const userIndex = roundOrder.indexOf(userTeamId);
            [roundOrder[0], roundOrder[userIndex]] = [roundOrder[userIndex], roundOrder[0]];
          }
          break;
          
        case 'last':
          // For last pick, swap user to last position if needed
          if (roundOrder[roundOrder.length - 1] !== userTeamId) {
            const userIndex = roundOrder.indexOf(userTeamId);
            [roundOrder[roundOrder.length - 1], roundOrder[userIndex]] = 
              [roundOrder[userIndex], roundOrder[roundOrder.length - 1]];
          }
          break;
          
        case 'random':
          // Random position is already handled by default order
          break;
      }
      return roundOrder;
    };

    switch (settings.draftType) {
      case 'snake': {
        // Create base pattern for all rounds first
        let firstRoundOrder = generateBaseRoundOrder();
        firstRoundOrder = adjustForUserPosition(firstRoundOrder);
        
        for (let round = 0; round < settings.currentRounds; round++) {
          let roundOrder = [...firstRoundOrder];
          
          // For even-numbered rounds (0-based), use forward order
          // For odd-numbered rounds, use reverse order
          if (round % 2 === 1) {
            roundOrder = [...roundOrder].reverse();
          }
          
          baseOrder.push(...roundOrder);
        }
        break;
      }
        
      case 'linear': {
        // For linear draft, just repeat the same order each round
        let firstRoundOrder = generateBaseRoundOrder();
        firstRoundOrder = adjustForUserPosition(firstRoundOrder);
        
        for (let round = 0; round < settings.currentRounds; round++) {
          baseOrder.push(...firstRoundOrder);
        }
        break;
      }
    }
    
    return baseOrder;
  }
};