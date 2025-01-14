import _ from "lodash";

import { convertHeightToInches } from "./utilities";
import { LEGENDARY_DUOS, LEGENDARY_TRIOS } from "../data/legendaryCombos";
import { assignPositionalRoles } from "./assignPositionalRoles";

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
    const { assignments } = assignPositionalRoles(roster);
    const assignedRoster = Array.from(assignments.entries()).map(([player, position]) => ({
        ...player,
        assignedPosition: position
    }));

    // Spacing assessment based on assigned positions
    const shooters = assignedRoster.filter((p) => p.shooting.three_point >= 80).length;
    const slashers = assignedRoster.filter(
        (p) => p.inside_scoring.driving_dunk >= 80 || p.inside_scoring.layup >= 80
    ).length;

    // Playmaker evaluation based on assigned positions
    const playmakers = assignedRoster.filter(
        (p) => p.assignedPosition === "PG" || 
        ((p.playmaking.pass_vision + p.playmaking.pass_iq) / 2 >= 85)
    ).length;
    
    const finishers = assignedRoster.filter(
        (p) => p.inside_scoring.standing_dunk >= 80 || p.shooting.three_point >= 80
    ).length;

    // Position-specific chemistry evaluation
    const positionChemistry = assignedRoster.reduce((score, player) => {
        const positionFit = calculatePositionalScore(player, player.assignedPosition);
        return score + (positionFit >= 80 ? 20 : positionFit >= 70 ? 10 : 0);
    }, 0);

    let score = 0;
    // Good balance of shooters and slashers (0-80)
    if ((shooters / roster.length >= 0.3) && (slashers / roster.length >= 0.3)) score += 80;
    
    // Enough playmakers to feed finishers (0-60)
    if (playmakers * 2 >= finishers) score += 60;
    
    // Not too many ball-dominant players (0-60)
    const ballDominantPlayers = assignedRoster.filter(
        (p) => p.playmaking.ball_handle >= 85 && p.assignedPosition !== "PG"
    ).length;
    score += Math.min(60, (3 - ballDominantPlayers) * 20);

    // Add position chemistry score (0-40)
    score += Math.min(40, (positionChemistry / roster.length) * 2);

    return Math.min(200, score);
};

const calculateLineupVersatility = (roster) => {
    const { assignments } = assignPositionalRoles(roster);

    // Small ball viability - check for athletic PFs who can defend perimeter
    const smallBallViable = Array.from(assignments).some(
        ([player, position]) =>
            position === "PF" &&
            player.defense.perimeter >= 70 &&
            player.athleticism.speed >= 70
    );

    // Tall ball viability - check for shooting bigs
    const tallBallViable = Array.from(assignments).some(
        ([player, position]) => 
            position === "C" && 
            player.shooting.three_point >= 65
    );

    // Count switchable defenders (can guard multiple positions)
    const switchableDefenders = Array.from(assignments).filter(
        ([player, _]) =>
            player.defense.perimeter >= 70 &&
            player.defense.interior >= 70 &&
            player.athleticism.agility >= 70
    ).length;

    // Calculate positional flexibility score
    const flexibilityScore = roster.reduce((score, player) => {
        if (player.secondaryPosition) {
            // Higher score if both positions are viable based on attributes
            const primaryScore = calculatePositionalScore(player, player.primaryPosition);
            const secondaryScore = calculatePositionalScore(player, player.secondaryPosition);
            if (primaryScore >= 75 && secondaryScore >= 75) {
                score += 20;
            } else if (primaryScore >= 75 || secondaryScore >= 75) {
                score += 10;
            }
        }
        return score;
    }, 0);

    // Calculate base versatility score
    let score = 0;

    // Small ball capability (0-70)
    if (smallBallViable) score += 70;
    
    // Tall ball capability (0-70)
    if (tallBallViable) score += 70;
    
    // Switchable defenders (0-60)
    const switchableScore = (switchableDefenders / roster.length) * 60;
    score += switchableScore;

    // Add flexibility score (0-40)
    score += Math.min(40, (flexibilityScore / roster.length) * 40);

    // Additional bonuses for exceptional versatility
    if (smallBallViable && tallBallViable) {
        score += 20; // Bonus for having both small and tall ball options
    }

    // If more than 40% of roster is switchable, add bonus
    if (switchableDefenders / roster.length > 0.4) {
        score += 20;
    }

    return Math.min(200, score);
};

const calculateHeightScore = (roster) => {
    const heightsInInches = roster.map((p) => convertHeightToInches(p.height));
    const avgHeightInches = heightsInInches.reduce((sum, h) => sum + h, 0) / roster.length;

    // Count number of 7-footers (84 inches or taller)
    const sevenFooters = heightsInInches.filter(height => height >= 84).length;
    
    // Position-specific height evaluation
    const positionHeightScores = roster.map(player => {
        const playerHeight = convertHeightToInches(player.height);
        switch (player.primaryPosition) {
            case "PG":
                return playerHeight >= 73 && playerHeight <= 78 ? 100 : // 6'1" to 6'6" ideal
                    Math.max(0, 100 - Math.abs(playerHeight - 75.5) * 15); // 6'3.5" optimal
            case "SG":
                return playerHeight >= 75 && playerHeight <= 79 ? 100 : // 6'3" to 6'7" ideal
                    Math.max(0, 100 - Math.abs(playerHeight - 77) * 15); // 6'5" optimal
            case "SF":
                return playerHeight >= 77 && playerHeight <= 81 ? 100 : // 6'5" to 6'9" ideal
                    Math.max(0, 100 - Math.abs(playerHeight - 79) * 15); // 6'7" optimal
            case "PF":
                return playerHeight >= 79 && playerHeight <= 84 ? 100 : // 6'7" to 7'0" ideal
                    Math.max(0, 100 - Math.abs(playerHeight - 81.5) * 15); // 6'9.5" optimal
            case "C":
                return playerHeight >= 81 && playerHeight <= 87 ? 100 : // 6'9" to 7'3" ideal
                    Math.max(0, 100 - Math.abs(playerHeight - 84) * 15); // 7'0" optimal
            default:
                return 0;
        }
    });

    // Average of position-specific height scores (0-100 scale)
    const positionHeightScore = positionHeightScores.reduce((sum, score) => sum + score, 0) / roster.length;

    // Calculate seven footer ratio score
    const expectedSevenFooters = Math.ceil(roster.length / 5); // One 7-footer per 5 players
    const sevenFooterScore = sevenFooters >= expectedSevenFooters ? 100 :
        Math.max(0, (sevenFooters / expectedSevenFooters) * 100);

    // Overall team average height baseline (expecting 6'6" to 6'8" average)
    const avgHeightScore = avgHeightInches >= 78 && avgHeightInches <= 80 ? 100 :
        Math.max(0, 100 - Math.abs(avgHeightInches - 79) * 10);

    // Combine scores:
    // 50% position-specific height
    // 30% seven-footer ratio
    // 20% team average height
    const finalScore = (
        positionHeightScore * 0.5 +
        sevenFooterScore * 0.3 +
        avgHeightScore * 0.2
    ) * 2; // Scale to 0-200

    return Math.min(200, Math.max(0, finalScore));
};

const calculatePositionalScore = (player, position) => {
    switch (position) {
        case "PG":
            return (
                (player.playmaking.pass_vision + 
                player.playmaking.pass_iq + 
                player.playmaking.ball_handle) / 3
            );
        case "SG":
            return (
                (player.shooting.three_point * 0.4 +
                player.shooting.mid_range * 0.3 +
                player.playmaking.ball_handle * 0.3)
            );
        case "SF":
            return (
                (player.shooting.three_point * 0.3 +
                player.inside_scoring.driving_dunk * 0.3 +
                player.defense.perimeter * 0.4)
            );
        case "PF":
            return (
                (player.defense.interior * 0.4 +
                player.defense.defensive_rebound * 0.3 +
                player.inside_scoring.post_control * 0.3)
            );
        case "C":
            return (
                (player.defense.interior * 0.4 +
                player.defense.defensive_rebound * 0.4 +
                player.inside_scoring.standing_dunk * 0.2)
            );
        default:
            return 0;
    }
};

const calculatePositionBalance = (roster) => {
    const { assignments, positionPenalty, rolesFilled, assignmentsList } = assignPositionalRoles(roster);

    // Log the simplified assignments
    console.log("Positional Roles:", assignmentsList);
    console.log("Position Penalty:", positionPenalty);
    console.log("Roles Filled:", rolesFilled);
    
    // Base score starts at 200
    let score = 200;
    
    // Apply position coverage penalty
    score -= positionPenalty;
    
    // Calculate fit bonus/penalty based on how well players fit their assigned positions
    let totalFitScore = 0;
    assignments.forEach((position, player) => {
        const positionScore = calculatePositionalScore(player, position);
        totalFitScore += positionScore;
    });
    
    // Average fit score (0-100)
    const averageFitScore = totalFitScore / assignments.size;
    
    // Add fit bonus (up to 50 points)
    score += (averageFitScore - 70) * 0.5; // Assuming 70 is baseline competency
    
    return Math.max(0, Math.min(200, score));
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
        return roster.reduce((score, player) => {
            const insideScore = (
                player.inside_scoring.close_shot * 0.3 +
                player.inside_scoring.post_control * 0.3 +
                player.inside_scoring.driving_dunk * 0.2 +
                player.badges.inside_scoring * 5
            );
            return score + insideScore;
        }, 0) / roster.length;
    };

    const calculateOutsideScoring = (roster) => {
        return roster.reduce((score, player) => {
            const shootingScore = (
                player.shooting.three_point * 0.4 +
                player.shooting.mid_range * 0.3 +
                player.shooting.shot_iq * 0.2 +
                player.badges.outside_scoring * 5
            );
            return score + shootingScore;
        }, 0) / roster.length;
    };

    const calculateOffBallEfficiency = (roster) => {
        return roster.reduce((score, player) => {
            // Evaluate off-ball movement and scoring potential
            const offBallScore = (
                player.athleticism.speed * 0.2 +
                player.athleticism.agility * 0.2 +
                player.shooting.shot_iq * 0.3 +
                player.intangibles.offensive_consistency * 0.2 +
                (player.badges.outside_scoring + player.badges.inside_scoring) * 2.5
            );

            // Additional bonus for players with high shooting ratings (catch-and-shoot potential)
            const shootingBonus = (player.shooting.three_point > 85 || player.shooting.mid_range > 85) ? 20 : 0;

            return score + offBallScore + shootingBonus;
        }, 0) / roster.length;
    };

    const calculateTransitionEfficiency = (roster) => {
        return roster.reduce((score, player) => {
            const transitionScore = (
                player.athleticism.speed * 0.25 +
                player.athleticism.stamina * 0.15 +
                player.playmaking.speed_with_ball * 0.2 +
                player.playmaking.pass_vision * 0.2 +
                player.athleticism.hustle * 0.1
            );

            // Bonus for finishing ability in transition
            const finishingBonus = (player.inside_scoring.driving_dunk > 85 || player.inside_scoring.layup > 85) ? 20 : 0;
            // Bonus for transition playmaking
            const playmakingBonus = (player.playmaking.pass_accuracy > 85 && player.playmaking.pass_vision > 85) ? 20 : 0;
            // Calculate leak-out potential (beneficial for transition offense)
            const leakOutPotential = (player.athleticism.speed > 85 && player.athleticism.stamina > 85) ? 10 : 0;

            return score + transitionScore + finishingBonus + playmakingBonus + leakOutPotential;
        }, 0) / roster.length;
    };

    const scores = {
        insidePresence: calculateInsidePresence(roster),
        outsideThreat: calculateOutsideScoring(roster),
        offBallMovement: calculateOffBallEfficiency(roster),
        transitionGame: calculateTransitionEfficiency(roster),
    };

    // Scale to 0-200 scale
    const rawScore = _.mean(Object.values(scores));
    return Math.min(200, rawScore * 1.5); // Apply scaling factor to get to appropriate range
};

const calculateLegendaryTeammateScore = (roster) => {
    let score = 0;
    let activatedCombos = [];
    const playerNames = roster.map(player => player.name);

    // Check for legendary trios first (they provide bigger bonuses)
    LEGENDARY_TRIOS.forEach(trio => {
        if (trio.players.every(player => playerNames.includes(player))) {
            score += trio.bonus;
            activatedCombos.push({
                players: trio.players,
                bonus: trio.bonus,
                description: trio.description
            });
        }
    });

    // Then check for legendary duos
    // Only count duos that aren't part of an already-counted trio
    LEGENDARY_DUOS.forEach(duo => {
        if (duo.players.every(player => playerNames.includes(player))) {
            // Check if these players weren't already part of a counted trio
            const alreadyCounted = activatedCombos.some(combo =>
                duo.players.every(player => combo.players.includes(player))
            );

            if (!alreadyCounted) {
                score += duo.bonus;
                activatedCombos.push({
                    players: duo.players,
                    bonus: duo.bonus,
                    description: duo.description
                });
            }
        }
    });

    // Log activated combinations for debugging and user feedback
    // if (activatedCombos.length > 0) {
    //     console.log("Legendary Teammate Combinations Found:", 
    //         activatedCombos.map(combo => ({
    //             players: combo.players.join(" & "),
    //             bonus: combo.bonus,
    //             description: combo.description
    //         }))
    //     );
    // }

    return {
        score: Math.min(200, score), // Cap at 200 to stay within our scale
        combinations: activatedCombos
    };
};


// #######################################
// ## Calculate Team Scoring
// #######################################
const calculateTeamScore = (roster) => {
    if (!roster || roster.length === 0) return {
        score: 0,
        breakdown: null,
        legendaryResults: null
    };

    // Core team attributes
    const coreAttributes = {
        // badgeSynergy: calculateBadgeSynergy(roster),
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
    const legendaryResults = calculateLegendaryTeammateScore(roster);
    const teamComposition = {
        positionBalance: calculatePositionBalance(roster),
        heightBalance: calculateHeightScore(roster),
        // depthQuality: calculateDepthQuality(roster),
        chemistry: calculateChemistryAndFit(roster),
        legendaryTeammates: legendaryResults.score,
    };

    // Calculate weighted scores
    const coreScore = _.mean(Object.values(coreAttributes)) * 0.25;
    const skillsScore = _.mean(Object.values(fundamentalSkills)) * 0.35;
    const compositionScore = _.mean(Object.values(teamComposition)) * 0.40;

    // Calculate final score (0-200 scale)
    const finalScore = Math.round(coreScore + skillsScore + compositionScore);

    console.log("Final Score (0-200):", finalScore);
    console.log("Breakdown:", coreAttributes, fundamentalSkills, teamComposition);
    console.log("\n");

    const breakdown = {
        coreAttributes,
        fundamentalSkills,
        teamComposition
    };

    return {
        score: finalScore,
        breakdown,
        legendaryResults
    };
};

export { calculateTeamScore, calculatePositionalScore };