import playerData from '../data/nba2k_players.json';

export const nbaService = {
  getPlayers: () => {
    // Transform the data to match needs
    const players = playerData.map((player, index) => ({
      id: index + 1,
      name: player.name,
      team: player.team,
      height: player.height,
      position: player.position,
      overall_rating: player.overallAttribute,
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

    // Sort players by overall rating
    return players.sort((a, b) => b.overall_rating - a.overall_rating);
  },

  // Get available teams (using teams from the player data)
  getTeams: () => {
    const uniqueTeams = [...new Set(playerData.map(player => player.team))];
    return [
      { id: 1, name: "Your Team", isUser: true, roster: [] },
      ...uniqueTeams
        .filter(team => team) // Remove any undefined/null teams
        .map((team, index) => ({
          id: index + 2,
          name: team,
          isUser: false,
          roster: []
        }))
    ].slice(0, 8); // Limit to 8 teams total including user team
  }
};

// Helper function to calculate composite ratings
export const calculateCompositeRating = (ratings) => {
  return Math.round(
    Object.values(ratings).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) / 
    Object.values(ratings).filter(val => typeof val === 'number').length
  );
};