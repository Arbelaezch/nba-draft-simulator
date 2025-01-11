import _ from "lodash";

import { convertHeightToInches } from "./utilities";

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
    // Good ratio of playmaking to finishing badges (0-60)
    score += Math.min(60, (playmakingBadges / finishingBadges) * 60);
    // Enough defensive badges (0-80)
    score += Math.min(80, (defensiveBadges / roster.length) * 20);
    // Value elite badges (0-60)
    score += Math.min(60, (eliteBadges / roster.length) * 10);

    return score;
};

const calculateClutchCapability = (roster) => {
    // Identify primary scoring options
    const clutchScorers = roster.filter(
        (p) =>
            (p.shooting.shot_iq >= 85 && p.intangibles.offensive_consistency >= 85) ||
            (p.inside_scoring.close_shot >= 85 && p.intangibles.offensive_consistency >= 85)
    ).length;

    // Free throw reliability in clutch
    //! Make a separate function penalizing a high density of poor FT shooters
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
    // Scale based on roster percentage rather than absolute numbers
    score += (clutchScorers / roster.length) * 100;
    score += (reliableFTShooters / roster.length) * 40;
    score += (clutchDefenders / roster.length) * 60;

    return Math.min(200, score);
};

//! Might want to break this up into separate functions. Floor spacing should probably be separate.
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
    // Good balance of shooters and slashers (0-80)
    if ((shooters / roster.length >= 0.3) && (slashers / roster.length >= 0.3)) score += 80;
    // Enough playmakers to feed finishers (0-60)
    if (playmakers * 2 >= finishers) score += 60;
    // Not too many ball-dominant players (0-60)
    const ballDominantPlayers = roster.filter(
        (p) => p.playmaking.ball_handle >= 85
    ).length;
    score += Math.min(60, (3 - ballDominantPlayers) * 20);

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
    if (smallBallViable) score += 60;
    if (tallBallViable) score += 60;
    score += (switchableDefenders / roster.length) * 80;

    return score;
};

// !Improve
const calculateHeightScore = (roster) => {
    const heightsInInches = roster.map((p) => convertHeightToInches(p.height));
    const avgHeightInches = heightsInInches.reduce((sum, h) => sum + h, 0) / roster.length;

    const minHeight = 72; // 6'0"
    const idealMinHeight = 78; // 6'6"
    const idealMaxHeight = 81; // 6'9"
    const maxHeight = 84; // 7'0"

    let heightScore;
    if (avgHeightInches < minHeight) {
        heightScore = 0;
    } else if (avgHeightInches >= idealMinHeight && avgHeightInches <= idealMaxHeight) {
        heightScore = 200;
    } else if (avgHeightInches < idealMinHeight) {
        heightScore = ((avgHeightInches - minHeight) / (idealMinHeight - minHeight)) * 200;
    } else {
        heightScore = Math.max(
            0,
            200 - ((avgHeightInches - idealMaxHeight) / (maxHeight - idealMaxHeight)) * 200
        );
    }

    return Math.min(200, Math.max(0, heightScore));
};

const calculatePositionBalance = (roster) => {
    const requiredPositions = ["PG", "SG", "SF", "PF", "C"];
    const primaryPositions = roster.map((p) => p.primaryPosition);
    const secondaryPositions = roster.map((p) => p.secondaryPosition).filter(Boolean);
    const coveredPositions = new Set([...primaryPositions, ...secondaryPositions]);
    return (coveredPositions.size / requiredPositions.length) * 200;
};

const calculateRebounding = (roster) => {
    const avgOffRebounding = roster.reduce((sum, p) => sum + p.defense.offensive_rebound, 0) / roster.length;
    const avgDefRebounding = roster.reduce((sum, p) => sum + p.defense.defensive_rebound, 0) / roster.length;
    return (avgOffRebounding * 0.4 + avgDefRebounding * 0.6) * 2;
};

const calculateDefense = (roster) => {
    const avgInteriorDef = roster.reduce((sum, p) => sum + p.defense.interior, 0) / roster.length;
    const avgPerimeterDef = roster.reduce((sum, p) => sum + p.defense.perimeter, 0) / roster.length;
    const avgHelpDefense = roster.reduce((sum, p) => sum + p.intangibles.help_defense_iq, 0) / roster.length;
    return (avgInteriorDef * 0.35 + avgPerimeterDef * 0.35 + avgHelpDefense * 0.3) * 2;
};

const calculatePlaymaking = (roster) => {
    const avgPlaymaking = roster.reduce((sum, p) => 
        sum + (p.playmaking.pass_accuracy + p.playmaking.pass_iq + p.playmaking.pass_vision) / 3, 
    0) / roster.length;
    return Math.min(200, avgPlaymaking * 2);
};

// Penalize team for high density of poor FT shooters
const calculateFreeThrows = (roster) => {
    const weakFTShooters = roster.filter((p) => p.shooting.free_throw < 75).length;
    return 200 - (weakFTShooters / roster.length) * 200;
};

// Penalize team for having more players with low hustle ratings
const calculateHustle = (roster) => {
    return (roster.reduce((sum, p) => sum + p.athleticism.hustle, 0) / roster.length) * 2;
};

const calculateBadges = (roster) => {
    const avgBadges = roster.reduce((sum, p) => sum + p.badges.total, 0) / roster.length;
    return Math.min(200, (avgBadges / 20) * 200);
};

const calculateOffensiveRating = (roster) => {
    // Core evaluation categories with weighted sub-components

    const calculateInsidePresence = (roster) => {
        return (roster.reduce((score, player) => {
            const insideScore = (
                player.inside_scoring.close_shot * 0.3 +
                player.inside_scoring.post_control * 0.3 +
                player.inside_scoring.driving_dunk * 0.2 +
                player.badges.inside_scoring * 5
            ) / (100 + 20) * 2;
            return score + insideScore;
        }, 0) / roster.length);
    };

    const calculateOutsideScoring = (roster) => {
        return (roster.reduce((score, player) => {
            const shootingScore = (
                player.shooting.three_point * 0.4 +
                player.shooting.mid_range * 0.3 +
                player.shooting.shot_iq * 0.2 +
                player.badges.outside_scoring * 5
            ) / (100 + 20) * 2;
            return score + shootingScore;
        }, 0) / roster.length);
    };

    const calculateOffBallEfficiency = (roster) => {
        return (roster.reduce((score, player) => {
            // Evaluate off-ball movement and scoring potential
            const offBallScore = (
                player.athleticism.speed * 0.2 +
                player.athleticism.agility * 0.2 +
                player.shooting.shot_iq * 0.3 +
                player.intangibles.offensive_consistency * 0.2 +
                (player.badges.outside_scoring + player.badges.inside_scoring) * 2.5
            ) / (100 + 10) * 2;

            // Additional bonus for players with high shooting ratings (catch-and-shoot potential)
            const shootingBonus = (player.shooting.three_point > 85 || player.shooting.mid_range > 85) ? 20 : 0;

            return score + offBallScore + shootingBonus / 100;
        }, 0) / roster.length);
    };

    const calculateTransitionEfficiency = (roster) => {
        return (roster.reduce((score, player) => {
            const transitionScore = (
                player.athleticism.speed * 0.25 +
                player.athleticism.stamina * 0.15 +
                player.playmaking.speed_with_ball * 0.2 +
                player.playmaking.pass_vision * 0.2 +
                player.athleticism.hustle * 0.1
            ) / 100 * 2;

            // Bonus for finishing ability in transition
            const finishingBonus = (player.inside_scoring.driving_dunk > 85 || player.inside_scoring.layup > 85) ? 20 : 0;
            // Bonus for transition playmaking
            const playmakingBonus = (player.playmaking.pass_accuracy > 85 && player.playmaking.pass_vision > 85) ? 20 : 0;
            // Calculate leak-out potential (beneficial for transition offense)
            const leakOutPotential = (player.athleticism.speed > 85 && player.athleticism.stamina > 85) ? 10 : 0;

            return score + transitionScore + (finishingBonus + playmakingBonus + leakOutPotential) / 100;
        }, 0) / roster.length);
    };

    const scores = {
        insidePresence: calculateInsidePresence(roster),
        outsideThreat: calculateOutsideScoring(roster),
        offBallMovement: calculateOffBallEfficiency(roster),
        transitionGame: calculateTransitionEfficiency(roster),
    };

    return _.mean(Object.values(scores));
};


// #######################################
// ## Calculate Team Scoring
// #######################################
const calculateTeamScore = (roster) => {
    if (!roster || roster.length === 0) return 0;

    // Core team attributes
    const coreAttributes = {
        badgeSynergy: calculateBadgeSynergy(roster),
        chemistry: calculateChemistryAndFit(roster), //!Move to teamComposition
        versatility: calculateLineupVersatility(roster),
        clutch: calculateClutchCapability(roster),
    };

    // Fundamental skills
    const fundamentalSkills = {
        offense: calculateOffensiveRating(roster),
        defense: calculateDefense(roster),
        playmaking: calculatePlaymaking(roster),
        rebounding: calculateRebounding(roster),
    };

    // Team composition
    const teamComposition = {
        positionBalance: calculatePositionBalance(roster),
        heightBalance: calculateHeightScore(roster),
        // depthQuality: calculateDepthQuality(roster),
    };

    // Calculate weighted scores
    const coreScore = _.mean(Object.values(coreAttributes)) * 0.4;
    const skillsScore = _.mean(Object.values(fundamentalSkills)) * 0.35;
    const compositionScore = _.mean(Object.values(teamComposition)) * 0.25;

    // Calculate final score (0-200 scale)
    const finalScore = Math.round(coreScore + skillsScore + compositionScore);

    console.log("Final Score (0-200):", finalScore);
    console.log("Breakdown:", coreAttributes, fundamentalSkills, teamComposition);

    return finalScore;
};

export { calculateTeamScore };