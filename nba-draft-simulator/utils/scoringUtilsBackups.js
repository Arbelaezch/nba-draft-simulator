const calculateChemistryAndFit = (roster) => {
    // Position compatibility
    const positionBalance = calculatePositionBalance(roster);

    // Playstyle compatibility
    const playstyleScore = calculatePlaystyleCompatibility(roster);

    // Skill complementarity
    const skillComplementScore = calculateSkillComplementarity(roster);

    return (positionBalance + playstyleScore + skillComplementScore) / 3;
  };

  const calculatePlaystyleCompatibility = (roster) => {
    const playstyles = roster.map((player) => ({
      isShooter: player.shooting.three_point > 85,
      isSlasher: player.inside_scoring.driving_dunk > 85,
      isPlaymaker: player.playmaking.pass_vision > 85,
      isDefender: player.defense.perimeter > 85 || player.defense.interior > 85,
    }));

    // Check for balanced distribution of playstyles
    const playstyleCounts = _.countBy(
      playstyles,
      (p) => Object.entries(p).filter(([, value]) => value).length
    );

    return Math.min(100, Object.values(playstyleCounts).length * 20);
  };

  const calculateSkillComplementarity = (roster) => {
    // Check if team has complementary skills
    const hasEliteShooters = roster.some((p) => p.shooting.three_point > 90);
    const hasEliteRebounder = roster.some(
      (p) => p.defense.defensive_rebound > 90
    );
    const hasElitePlaymaker = roster.some((p) => p.playmaking.pass_vision > 90);
    const hasEliteDefender = roster.some(
      (p) => Math.max(p.defense.interior, p.defense.perimeter) > 90
    );

    return (
      (hasEliteShooters +
        hasEliteRebounder +
        hasElitePlaymaker +
        hasEliteDefender) *
      25
    );
  };


  const calculateFloorStretch = (roster) => {
  const avgThreePoint =
    roster.reduce((sum, p) => sum + p.shooting.three_point, 0) / roster.length;
  const avgMidRange =
    roster.reduce((sum, p) => sum + p.shooting.mid_range, 0) / roster.length;
  const avgInsideScore =
    roster.reduce(
      (sum, p) =>
        sum +
        (p.inside_scoring.layup +
          p.inside_scoring.standing_dunk +
          p.inside_scoring.driving_dunk) /
          3,
      0
    ) / roster.length;

  return (
    100 -
    (Math.abs(avgThreePoint - avgMidRange) +
      Math.abs(avgMidRange - avgInsideScore)) /
      2
  );
};

    const calculateDepthAndVersatility = (roster) => {
        // Calculate starter vs bench quality
        const sortedByOverall = _.sortBy(roster, "overall_rating").reverse();
        const starters = sortedByOverall.slice(0, 5);
        const bench = sortedByOverall.slice(5);

        const starterAvg = _.meanBy(starters, "overall_rating");
        const benchAvg = bench.length ? _.meanBy(bench, "overall_rating") : 0;

        // Penalize if bench is too weak compared to starters
        const depthScore = Math.min(100, (benchAvg / starterAvg) * 100);

        // Bonus for players who can play multiple positions
        const versatilityBonus =
            roster.filter((p) => p.secondaryPosition).length * 10;

        return depthScore * 0.7 + Math.min(100, versatilityBonus) * 0.3;
    };


    //! New
const calculateEnhancedTeamScore = (roster) => {



    // Calculate final weighted score
    const weights = {
        offensiveVersatility: 0.25,
        chemistry: 0.2,
        clutchFactor: 0.15,
        depthAndVersatility: 0.15,
        defense: 0.15,
        rebounding: 0.1,
    };

    const scores = {
        offensiveVersatility: evaluateOffensiveVersatility(roster),
        chemistry: calculateChemistryAndFit(roster),
        clutchFactor: calculateClutchFactor(roster),
        depthAndVersatility: calculateDepthAndVersatility(roster),
        defense: calculateDefense(roster),
        rebounding: calculateRebounding(roster),
    };

    const finalScore = Object.entries(weights).reduce(
        (total, [category, weight]) => {
            return total + scores[category] * weight;
        },
        0
    );

    console.log("scores", scores);

    return Math.round(finalScore);
};
// !end new




// Main evaluation function
const evaluateTeam = (roster) => {
    if (!roster || roster.length === 0) return 0;

    // Scoring weights
    const weights = {
        positionBalance: 15,
        floorStretch: 12,
        rebounding: 10,
        defense: 15,
        playmaking: 10,
        freeThrows: 8,
        hustle: 8,
        shotIQ: 8,
        badges: 7,
        heightBalance: 7,
    };

    // Calculate all scores
    const scores = {
        positionBalance: calculatePositionBalance(roster),
        floorStretch: calculateFloorStretch(roster),
        rebounding: calculateRebounding(roster),
        defense: calculateDefense(roster),
        playmaking: calculatePlaymaking(roster),
        freeThrows: calculateFreeThrows(roster),
        hustle: calculateHustle(roster),
        shotIQ: calculateShotIQ(roster),
        badges: calculateBadges(roster),
        heightBalance: calculateHeightScore(roster),
    };

    // Calculate weighted final score
    const finalScore = Object.entries(weights).reduce(
        (total, [category, weight]) => {
            return total + (scores[category] * weight) / 100;
        },
        0
    );

    return Math.round(finalScore);
};