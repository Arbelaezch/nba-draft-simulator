export const NBA_TEAMS = [
  "Atlanta Hawks",
  "Boston Celtics",
  "Brooklyn Nets",
  "Charlotte Hornets",
  "Chicago Bulls",
  "Cleveland Cavaliers",
  "Dallas Mavericks",
  "Denver Nuggets",
  "Detroit Pistons",
  "Golden State Warriors",
  "Houston Rockets",
  "Indiana Pacers",
  "Los Angeles Clippers",
  "Los Angeles Lakers",
  "Memphis Grizzlies",
  "Miami Heat",
  "Milwaukee Bucks",
  "Minnesota Timberwolves",
  "New Orleans Pelicans",
  "New York Knicks",
  "Oklahoma City Thunder",
  "Orlando Magic",
  "Philadelphia 76ers",
  "Phoenix Suns",
  "Portland Trail Blazers",
  "Sacramento Kings",
  "San Antonio Spurs",
  "Toronto Raptors",
  "Utah Jazz",
  "Washington Wizards"
];

export const teamsConfig = {
  // Get a random selection of AI teams
  getRandomTeams: (count = 5) => {
    const shuffled = [...NBA_TEAMS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  // Create a team object with initial state
  createTeamObject: (teamName, id, isUser = false, numberOfRounds = 5) => {
    const createInitialNeeds = () => ({
      PG: { current: 0, target: Math.ceil(numberOfRounds * 0.2) },
      SG: { current: 0, target: Math.ceil(numberOfRounds * 0.2) },
      SF: { current: 0, target: Math.ceil(numberOfRounds * 0.2) },
      PF: { current: 0, target: Math.ceil(numberOfRounds * 0.2) },
      C: { current: 0, target: Math.ceil(numberOfRounds * 0.2) }
    });

    return {
      id,
      name: teamName,
      isUser,
      roster: [],
      needs: createInitialNeeds(),
      roundsCompleted: 0,
      totalRounds: numberOfRounds
    };
  }
};