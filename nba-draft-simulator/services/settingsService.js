export const settingsService = {
    getDraftTypes() {
      return [
        { value: 'snake', label: 'Snake Draft' },
        { value: 'fixed', label: 'Fixed Order' },
        { value: 'random', label: 'Random Order' }
      ];
    },
  
    getPlayerPools() {
      return [
        { value: 'current', label: 'Current Players' },
        { value: 'allTime', label: 'All-Time Players' },
        { value: 'combined', label: 'Combined Pool' }
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
      const order = [];
      
      switch (settings.draftType) {
        case 'snake':
          for (let round = 0; round < settings.currentRounds; round++) {
            const roundTeams = [...Array(totalTeams)].map((_, index) => index + 1);
            if (round % 2 === 1) roundTeams.reverse();
            order.push(...roundTeams);
          }
          break;
          
        case 'fixed':
          for (let round = 0; round < settings.currentRounds; round++) {
            order.push(...[...Array(totalTeams)].map((_, index) => index + 1));
          }
          break;
          
        case 'random':
          for (let round = 0; round < settings.currentRounds; round++) {
            const roundTeams = [...Array(totalTeams)]
              .map((_, index) => index + 1)
              .sort(() => Math.random() - 0.5);
            order.push(...roundTeams);
          }
          break;
      }
      
      return order;
    }
  };