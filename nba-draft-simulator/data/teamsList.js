export const NBA_TEAMS_DATA = [
  {
    "id": 1,
    "name": "Atlanta Hawks",
    "logo": "https://www.2kratings.com/wp-content/uploads/Atlanta-Hawks-Current-Logo.svg"
  },
  {
    "id": 2,
    "name": "Boston Celtics",
    "logo": "https://www.2kratings.com/wp-content/uploads/Boston-Celtics-Current-Logo.svg"
  },
  {
    "id": 3,
    "name": "Brooklyn Nets",
    "logo": "https://www.2kratings.com/wp-content/uploads/Brooklyn-Nets-Current-Logo.svg"
  },
  {
    "id": 4,
    "name": "Charlotte Hornets",
    "logo": "https://www.2kratings.com/wp-content/uploads/Charlotte-Hornets-Current-Logo.svg"
  },
  {
    "id": 5,
    "name": "Chicago Bulls",
    "logo": "https://www.2kratings.com/wp-content/uploads/Chicago-Bulls-Current-Logo.svg"
  },
  {
    "id": 6,
    "name": "Cleveland Cavaliers",
    "logo": "https://www.2kratings.com/wp-content/uploads/Cleveland-Cavaliers-Current-Logo.svg"
  },
  {
    "id": 7,
    "name": "Dallas Mavericks",
    "logo": "https://www.2kratings.com/wp-content/uploads/Dallas-Mavericks-Current-Logo.svg"
  },
  {
    "id": 8,
    "name": "Denver Nuggets",
    "logo": "https://www.2kratings.com/wp-content/uploads/Denver-Nuggets-Current-Logo.svg"
  },
  {
    "id": 9,
    "name": "Detroit Pistons",
    "logo": "https://www.2kratings.com/wp-content/uploads/Detroit-Pistons-Current-Logo.svg"
  },
  {
    "id": 10,
    "name": "Golden State Warriors",
    "logo": "https://www.2kratings.com/wp-content/uploads/Golden-State-Warriors-Current-Logo.svg"
  },
  {
    "id": 11,
    "name": "Houston Rockets",
    "logo": "https://www.2kratings.com/wp-content/uploads/Houston-Rockets-Current-Logo.svg"
  },
  {
    "id": 12,
    "name": "Indiana Pacers",
    "logo": "https://www.2kratings.com/wp-content/uploads/Indiana-Pacers-Current-Logo.svg"
  },
  {
    "id": 13,
    "name": "Los Angeles Clippers",
    "logo": "https://www.2kratings.com/wp-content/uploads/Los-Angeles-Clippers-Current-Logo.svg"
  },
  {
    "id": 14,
    "name": "Los Angeles Lakers",
    "logo": "https://www.2kratings.com/wp-content/uploads/Los-Angeles-Lakers-Current-Logo.svg"
  },
  {
    "id": 15,
    "name": "Memphis Grizzlies",
    "logo": "https://www.2kratings.com/wp-content/uploads/Memphis-Grizzlies-Current-Logo.svg"
  },
  {
    "id": 16,
    "name": "Miami Heat",
    "logo": "https://www.2kratings.com/wp-content/uploads/Miami-Heat-Current-Logo.svg"
  },
  {
    "id": 17,
    "name": "Milwaukee Bucks",
    "logo": "https://www.2kratings.com/wp-content/uploads/Milwaukee-Bucks-Current-Logo.svg"
  },
  {
    "id": 18,
    "name": "Minnesota Timberwolves",
    "logo": "https://www.2kratings.com/wp-content/uploads/Minnesota-Timberwolves-Current-Logo.svg"
  },
  {
    "id": 19,
    "name": "New Orleans Pelicans",
    "logo": "https://www.2kratings.com/wp-content/uploads/New-Orleans-Pelicans-Current-Logo.svg"
  },
  {
    "id": 20,
    "name": "New York Knicks",
    "logo": "https://www.2kratings.com/wp-content/uploads/New-York-Knicks-Current-Logo.svg"
  },
  {
    "id": 21,
    "name": "Oklahoma City Thunder",
    "logo": "https://www.2kratings.com/wp-content/uploads/Oklahoma-City-Thunder-Current-Logo.svg"
  },
  {
    "id": 22,
    "name": "Orlando Magic",
    "logo": "https://www.2kratings.com/wp-content/uploads/Orlando-Magic-Current-Logo.svg"
  },
  {
    "id": 23,
    "name": "Philadelphia 76ers",
    "logo": "https://www.2kratings.com/wp-content/uploads/Philadelphia-76ers-Current-Logo.svg"
  },
  {
    "id": 24,
    "name": "Phoenix Suns",
    "logo": "https://www.2kratings.com/wp-content/uploads/Phoenix-Suns-Current-Logo.svg"
  },
  {
    "id": 25,
    "name": "Portland Trail Blazers",
    "logo": "https://www.2kratings.com/wp-content/uploads/Portland-Trail-Blazers-Current-Logo.svg"
  },
  {
    "id": 26,
    "name": "Sacramento Kings",
    "logo": "https://www.2kratings.com/wp-content/uploads/Sacramento-Kings-Current-Logo.svg"
  },
  {
    "id": 27,
    "name": "San Antonio Spurs",
    "logo": "https://www.2kratings.com/wp-content/uploads/San-Antonio-Spurs-Current-Logo.svg"
  },
  {
    "id": 28,
    "name": "Toronto Raptors",
    "logo": "https://www.2kratings.com/wp-content/uploads/Toronto-Raptors-Current-Logo.svg"
  },
  {
    "id": 29,
    "name": "Utah Jazz",
    "logo": "https://www.2kratings.com/wp-content/uploads/Utah-Jazz-Current-Logo.svg"
  },
  {
    "id": 30,
    "name": "Washington Wizards",
    "logo": "https://www.2kratings.com/wp-content/uploads/Washington-Wizards-Current-Logo.svg"
  }
];

export const teamsConfig = {
  // Get a random selection of AI teams
  getRandomTeams: (count = 5, availableTeams = NBA_TEAMS_DATA) => {
    const shuffled = [...availableTeams].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(team => team.name);
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

    // Find the team logo if it exists
    const teamData = NBA_TEAMS_DATA.find(team => team.name === teamName);
    
    return {
      id,
      name: teamName,
      logo: teamData?.logo || null,
      isUser,
      roster: [],
      needs: createInitialNeeds(),
      roundsCompleted: 0,
      totalRounds: numberOfRounds
    };
  }
};