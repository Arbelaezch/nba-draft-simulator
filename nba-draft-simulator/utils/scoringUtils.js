import _ from "lodash";

const calculateBadgeSynergy = (roster) => {
  // Count complementary badge combinations
  const playmakingBadges = roster.reduce(
    (sum, p) => sum + p.badges.playmaking,
    0
  );
  const finishingBadges = roster.reduce(
    (sum, p) => sum + p.badges.inside_scoring + p.badges.outside_scoring,
    0
  );

  // Evaluate badge distribution
  const defensiveBadges = roster.reduce(
    (sum, p) => sum + p.badges.defensive + p.badges.rebounding,
    0
  );

  // Value higher tier badges more
  const eliteBadges = roster.reduce(
    (sum, p) =>
      sum + p.badges.legendary * 3 + p.badges.purple * 2 + p.badges.gold,
    0
  );

  let score = 0;
  // Good ratio of playmaking to finishing badges
  score += Math.min(30, (playmakingBadges / finishingBadges) * 30);
  // Enough defensive badges
  score += Math.min(40, (defensiveBadges / roster.length) * 10);
  // Value elite badges
  score += Math.min(30, (eliteBadges / roster.length) * 5);

  return score;
};

const calculateClutchCapability = (roster) => {
  // Identify primary scoring options
  const clutchScorers = roster.filter(
    (p) =>
      (p.shooting.shot_iq >= 85 && p.intangibles.offensive_consistency >= 85) ||
      (p.inside_scoring.close_shot >= 85 &&
        p.intangibles.offensive_consistency >= 85)
  ).length;

  // Free throw reliability in clutch
  const reliableFTShooters = roster.filter(
    (p) => p.shooting.free_throw >= 85
  ).length;

  // Defensive stoppers for clutch situations
  const clutchDefenders = roster.filter(
    (p) =>
      p.defense.perimeter >= 85 ||
      (p.defense.interior >= 85 && p.intangibles.defensive_consistency >= 85)
  ).length;

  let score = 0;
  score += clutchScorers * 30;
  score += reliableFTShooters * 10;
  score += clutchDefenders * 20;

  return Math.min(100, score);
};

const calculateChemistryAndFit = (roster) => {
  // Spacing assessment - need shooters around slashers
  const shooters = roster.filter((p) => p.shooting.three_point >= 80).length;
  const slashers = roster.filter(
    (p) => p.inside_scoring.driving_dunk >= 80 || p.inside_scoring.layup >= 80
  ).length;

  // Playmaker-to-finisher ratio
  const playmakers = roster.filter(
    (p) => (p.playmaking.pass_vision + p.playmaking.pass_iq) / 2 >= 80
  ).length;
  const finishers = roster.filter(
    (p) => p.inside_scoring.standing_dunk >= 80 || p.shooting.three_point >= 80
  ).length;

  let score = 0;
  // Good balance of shooters and slashers
  if (shooters >= 2 && slashers >= 2) score += 40;
  // Enough playmakers to feed finishers
  if (playmakers * 2 >= finishers) score += 30;
  // Not too many ball-dominant players
  const ballDominantPlayers = roster.filter(
    (p) => p.playmaking.ball_handle >= 85
  ).length;
  score += Math.min(30, (3 - ballDominantPlayers) * 10);

  return score;
};

const calculateLineupVersatility = (roster) => {
  // Can the team play "small ball"?
  const smallBallViable = roster.some(
    (p) =>
      p.primaryPosition === "PF" &&
      p.defense.perimeter >= 75 &&
      p.athleticism.speed >= 75
  );

  // Can the team play "tall ball"?
  const tallBallViable = roster.some(
    (p) => p.primaryPosition === "C" && p.shooting.three_point >= 70
  );

  // Position-less basketball capability
  const switchableDefenders = roster.filter(
    (p) =>
      p.defense.perimeter >= 75 &&
      p.defense.interior >= 75 &&
      p.athleticism.agility >= 75
  ).length;

  let score = 0;
  if (smallBallViable) score += 30;
  if (tallBallViable) score += 30;
  score += (switchableDefenders / roster.length) * 40;

  return score;
};

// Height calculation utilities
const convertHeightToInches = (heightStr) => {
  try {
    const [feet, inches] = heightStr
      .split("'")
      .map((num) => parseInt(num.trim()));
    return feet * 12 + (inches || 0); // Handle cases where inches might be missing
  } catch (error) {
    console.error(`Error parsing height: ${heightStr}`);
    return 72; // Default to 6'0" if parsing fails
  }
};

const calculateHeightScore = (roster) => {
  const heightsInInches = roster.map((p) => convertHeightToInches(p.height));
  const avgHeightInches =
    heightsInInches.reduce((sum, h) => sum + h, 0) / roster.length;

  const minHeight = 72; // 6'0"
  const idealMinHeight = 78; // 6'6"
  const idealMaxHeight = 81; // 6'9"
  const maxHeight = 84; // 7'0"

  let heightScore;
  if (avgHeightInches < minHeight) {
    heightScore = 0;
  } else if (
    avgHeightInches >= idealMinHeight &&
    avgHeightInches <= idealMaxHeight
  ) {
    heightScore = 100;
  } else if (avgHeightInches < idealMinHeight) {
    heightScore =
      ((avgHeightInches - minHeight) / (idealMinHeight - minHeight)) * 100;
  } else {
    heightScore = Math.max(
      0,
      100 -
        ((avgHeightInches - idealMaxHeight) / (maxHeight - idealMaxHeight)) *
          100
    );
  }

  return Math.min(100, Math.max(0, heightScore));
};

// Individual scoring category calculations
const calculatePositionBalance = (roster) => {
  const requiredPositions = ["PG", "SG", "SF", "PF", "C"];
  const primaryPositions = roster.map((p) => p.primaryPosition);
  const secondaryPositions = roster
    .map((p) => p.secondaryPosition)
    .filter(Boolean);
  const coveredPositions = new Set([
    ...primaryPositions,
    ...secondaryPositions,
  ]);
  return (coveredPositions.size / requiredPositions.length) * 100;
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

const calculateRebounding = (roster) => {
  const avgOffRebounding =
    roster.reduce((sum, p) => sum + p.defense.offensive_rebound, 0) /
    roster.length;
  const avgDefRebounding =
    roster.reduce((sum, p) => sum + p.defense.defensive_rebound, 0) /
    roster.length;
  return avgOffRebounding * 0.4 + avgDefRebounding * 0.6;
};

const calculateDefense = (roster) => {
  const avgInteriorDef =
    roster.reduce((sum, p) => sum + p.defense.interior, 0) / roster.length;
  const avgPerimeterDef =
    roster.reduce((sum, p) => sum + p.defense.perimeter, 0) / roster.length;
  const avgHelpDefense =
    roster.reduce((sum, p) => sum + p.intangibles.help_defense_iq, 0) /
    roster.length;
  return avgInteriorDef * 0.35 + avgPerimeterDef * 0.35 + avgHelpDefense * 0.3;
};

const calculatePlaymaking = (roster) => {
  const playmakers = roster.filter(
    (p) =>
      (p.playmaking.pass_accuracy +
        p.playmaking.pass_iq +
        p.playmaking.pass_vision) /
        3 >=
      85
  ).length;
  return Math.min(100, (playmakers / (roster.length * 0.3)) * 100);
};

const calculateFreeThrows = (roster) => {
  const weakFTShooters = roster.filter(
    (p) => p.shooting.free_throw < 75
  ).length;
  return 100 - (weakFTShooters / roster.length) * 100;
};

const calculateHustle = (roster) => {
  return (
    roster.reduce((sum, p) => sum + p.athleticism.hustle, 0) / roster.length
  );
};

const calculateShotIQ = (roster) => {
  return roster.reduce((sum, p) => sum + p.shooting.shot_iq, 0) / roster.length;
};

const calculateBadges = (roster) => {
  const avgBadges =
    roster.reduce((sum, p) => sum + p.badges.total, 0) / roster.length;
  return Math.min(100, (avgBadges / 20) * 100);
};

//! New
const calculateEnhancedTeamScore = (roster) => {
  // Core evaluation categories with weighted sub-components
  const evaluateOffensiveVersatility = (roster) => {
    const scores = {
      insidePresence: calculateInsidePresence(roster),
      outsideThreat: calculateOutsideScoring(roster),
      offBallMovement: calculateOffBallEfficiency(roster),
      transitionGame: calculateTransitionEfficiency(roster),
    };
    return _.mean(Object.values(scores));
  };

  const calculateInsidePresence = (roster) => {
    return (
      roster.reduce((score, player) => {
        const insideScore =
          (player.inside_scoring.close_shot * 0.3 +
            player.inside_scoring.post_control * 0.3 +
            player.inside_scoring.driving_dunk * 0.2 +
            player.badges.inside_scoring * 5) /
          (100 + 20); // Normalizing to 0-100 scale
        return score + insideScore;
      }, 0) / roster.length
    );
  };

  const calculateOutsideScoring = (roster) => {
    return (
      roster.reduce((score, player) => {
        const shootingScore =
          (player.shooting.three_point * 0.4 +
            player.shooting.mid_range * 0.3 +
            player.shooting.shot_iq * 0.2 +
            player.badges.outside_scoring * 5) /
          (100 + 20);
        return score + shootingScore;
      }, 0) / roster.length
    );
  };

  const calculateOffBallEfficiency = (roster) => {
    return (
      roster.reduce((score, player) => {
        // Evaluate off-ball movement and scoring potential
        const offBallScore =
          (player.athleticism.speed * 0.2 +
            player.athleticism.agility * 0.2 +
            player.shooting.shot_iq * 0.3 +
            player.intangibles.offensive_consistency * 0.2 +
            (player.badges.outside_scoring + player.badges.inside_scoring) *
              2.5) /
          (100 + 10); // Normalizing to 0-100 scale

        // Additional bonus for players with high shooting ratings (catch-and-shoot potential)
        const shootingBonus =
          player.shooting.three_point > 85 || player.shooting.mid_range > 85
            ? 10
            : 0;

        return score + offBallScore + shootingBonus / 100;
      }, 0) / roster.length
    );
  };

  const calculateTransitionEfficiency = (roster) => {
    return (
      roster.reduce((score, player) => {
        // Core transition attributes
        const transitionScore =
          (player.athleticism.speed * 0.25 +
            player.athleticism.stamina * 0.15 +
            player.playmaking.speed_with_ball * 0.2 +
            player.playmaking.pass_vision * 0.2 +
            player.athleticism.hustle * 0.1) /
          100;

        // Bonus for finishing ability in transition
        const finishingBonus =
          player.inside_scoring.driving_dunk > 85 ||
          player.inside_scoring.layup > 85
            ? 10
            : 0;

        // Bonus for transition playmaking
        const playmakingBonus =
          player.playmaking.pass_accuracy > 85 &&
          player.playmaking.pass_vision > 85
            ? 10
            : 0;

        // Calculate leak-out potential (beneficial for transition offense)
        const leakOutPotential =
          player.athleticism.speed > 85 && player.athleticism.stamina > 85
            ? 5
            : 0;

        return (
          score +
          transitionScore +
          (finishingBonus + playmakingBonus + leakOutPotential) / 100
        );
      }, 0) / roster.length
    );
  };

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

  const calculateClutchFactor = (roster) => {
    return (
      roster.reduce((total, player) => {
        const clutchScore =
          (player.shooting.shot_iq * 0.3 +
            player.intangibles.offensive_consistency * 0.3 +
            player.badges.legendary * 10 +
            player.badges.purple * 5) /
          (100 + 45); // Normalized to 0-100
        return total + clutchScore;
      }, 0) / roster.length
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

export { evaluateTeam, calculateEnhancedTeamScore };
