// import playerData from '../data/nba2k_players.json';
import playerData from '../data/test_data.json';

export const nbaService = {
  getPlayers: () => {
    // Transform the data to match needs and ensure all required fields
    const players = playerData
      .filter(player => player.name && player.overallAttribute) // Filter out any invalid players
      .map((player, index) => ({
        id: index + 1,
        name: player.name,
        team: player.team,
        height: player.height,
        position: player.position,
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

    // Sort players by overall rating and ensure valid ratings
    return players
      .filter(player => !isNaN(player.overall_rating))
      .sort((a, b) => b.overall_rating - a.overall_rating);
  },

  getTeams: () => {
    // Create array of team names excluding user team
    const uniqueTeams = [...new Set(playerData
      .filter(player => player.team)
      .map(player => player.team))]
      .slice(0, 5); // Limit to 7 AI teams

    // Create teams array with user team first
    const teams = [
      {
        id: 1,
        name: "Your Team",
        isUser: true,
        roster: [],
        needs: { // Add team needs tracking
          PG: true,
          SG: true,
          SF: true,
          PF: true,
          C: true
        }
      },
      ...uniqueTeams.map((team, index) => ({
        id: index + 2,
        name: team,
        isUser: false,
        roster: [],
        needs: { // Add team needs tracking for AI teams
          PG: true,
          SG: true,
          SF: true,
          PF: true,
          C: true
        }
      }))
    ];

    // Create test team array that contains each teams id and name
    const testTeams = [
      {
        id: 1,
        name: "Your Team",
        roster: [],
      },
      ...uniqueTeams.map((team, index) => ({
        id: index + 2,
        name: team,
        roster: [],
      }))
    ];
    // console.log("teams", testTeams); // See team data
    // console.log("teams", teams); // See team data

    return teams;
  },

  // Helper function to calculate position needs
  calculateTeamNeeds: (roster) => {
    const positionCounts = {
      PG: 0,
      SG: 0,
      SF: 0,
      PF: 0,
      C: 0
    };

    roster.forEach(player => {
      if (positionCounts.hasOwnProperty(player.position)) {
        positionCounts[player.position]++;
      }
    });

    return {
      PG: positionCounts.PG < 2,
      SG: positionCounts.SG < 2,
      SF: positionCounts.SF < 2,
      PF: positionCounts.PF < 2,
      C: positionCounts.C < 2
    };
  },

  // Helper function to calculate composite ratings
  calculateCompositeRating: (ratings) => {
    const validRatings = Object.values(ratings).filter(val => 
      typeof val === 'number' && !isNaN(val)
    );
    
    if (validRatings.length === 0) return 0;
    
    return Math.round(
      validRatings.reduce((sum, val) => sum + val, 0) / validRatings.length
    );
  }
};

export const calculateCompositeRating = nbaService.calculateCompositeRating;