// Player pool imports
import currentPlayers from '../data/current-players-jan10-2025.json';
import allTimePlayers from '../data/all-time-players-jan10-2025.json';
import { teamsConfig } from '../data/teamsList';

export const nbaService = {
  getPlayers: (poolType = 'current') => {
    // Select the appropriate player pool based on type
    let playerPool;
    switch (poolType) {
      case 'current':
        playerPool = currentPlayers;
        break;
      case 'allTime':
        playerPool = allTimePlayers;
        break;
      case 'combined':
        playerPool = [...currentPlayers, ...allTimePlayers];
        break;
      default:
        playerPool = currentPlayers;
    }

    // Transform the data to match needs and ensure all required fields
    const players = playerPool
      .filter(player => player.name && player.overallAttribute)
      .map((player) => ({
        id: player.id,
        name: player.name,
        team: player.team,
        height: player.height,
        primaryPosition: player.primaryPosition,
        secondaryPosition: player.secondaryPosition || null,
        image: player.profilePicture,
        overall_rating: parseInt(player.overallAttribute) || 0,
        inside_scoring: {
          close_shot: player.closeShot,
          layup: player.layup,
          standing_dunk: player.standingDunk,
          driving_dunk: player.drivingDunk,
          post_control: player.postControl,
          post_hook: player.postHook,
          post_fade: player.postFade
        },
        shooting: {
          mid_range: player.midRangeShot,
          three_point: player.threePointShot,
          free_throw: player.freeThrow,
          shot_iq: player.shotIQ
        },
        playmaking: {
          pass_accuracy: player.passAccuracy,
          ball_handle: player.ballHandle,
          speed_with_ball: player.speedWithBall,
          pass_iq: player.passIQ,
          pass_vision: player.passVision
        },
        defense: {
          interior: player.interiorDefense,
          perimeter: player.perimeterDefense,
          steal: player.steal,
          block: player.block,
          defensive_rebound: player.defensiveRebound,
          offensive_rebound: player.offensiveRebound
        },
        athleticism: {
          speed: player.speed,
          agility: player.agility,
          strength: player.strength,
          vertical: player.vertical,
          stamina: player.stamina,
          hustle: player.hustle
        },
        intangibles: {
          offensive_consistency: player.offensiveConsistency,
          defensive_consistency: player.defensiveConsistency,
          help_defense_iq: player.helpDefenseIQ,
          durability: player.overallDurability
        }
      }));

    return players
      .filter(player => !isNaN(player.overall_rating))
      .sort((a, b) => b.overall_rating - a.overall_rating);
  },

  getTeams: (numberOfRounds = 5, aiTeamCount = 5) => {
    const aiTeams = teamsConfig.getRandomTeams(aiTeamCount);
    
    const teams = [
      teamsConfig.createTeamObject("Your Team", 1, true, numberOfRounds),
      ...aiTeams.map((teamName, index) => 
        teamsConfig.createTeamObject(teamName, index + 2, false, numberOfRounds)
      )
    ];

    return teams;
  },

  // Needs calculation considers both primary and secondary positions
  calculateTeamNeeds: (roster, totalRounds) => {
    const positionCounts = {
      PG: 0,
      SG: 0,
      SF: 0,
      PF: 0,
      C: 0
    };

    // Count primary positions
    roster.forEach(player => {
      if (positionCounts.hasOwnProperty(player.primaryPosition)) {
        positionCounts[player.primaryPosition]++;
      }
      // Add 0.5 count for secondary positions
      if (player.secondaryPosition && positionCounts.hasOwnProperty(player.secondaryPosition)) {
        positionCounts[player.secondaryPosition] += 0.5;
      }
    });

    // Calculate target number for each position based on total rounds
    const targetPerPosition = Math.ceil(totalRounds * 0.2); // 20% of total rounds per position

    // Return object with current count and target for each position
    return {
      PG: { current: positionCounts.PG, target: targetPerPosition },
      SG: { current: positionCounts.SG, target: targetPerPosition },
      SF: { current: positionCounts.SF, target: targetPerPosition },
      PF: { current: positionCounts.PF, target: targetPerPosition },
      C: { current: positionCounts.C, target: targetPerPosition }
    };
  },

  // Helper function to determine position priority for AI drafting
  getPositionPriority: (needs) => {
    const priorities = Object.entries(needs).map(([position, stats]) => ({
      position,
      priority: (stats.target - stats.current) / stats.target
    }));

    return priorities.sort((a, b) => b.priority - a.priority);
  },

  // Helper function to calculate composite ratings
  calculateCompositeRating: (ratings) => {
    const validRatings = Object.values(ratings).filter(val => 
      typeof val === 'number' && !isNaN(val)
    );
    
    return validRatings.length === 0 ? 0 : Math.round(
      validRatings.reduce((sum, val) => sum + val, 0) / validRatings.length
    );
  }
};

export const calculateCompositeRating = nbaService.calculateCompositeRating;