import { calculatePositionalScore } from "./scoringUtils";

export const assignPositionalRoles = (roster) => {
    const positions = ["PG", "SG", "SF", "PF", "C"];
    const positionsNeeded = Math.ceil(roster.length / 5) * 5;
    const positionsPerRole = positionsNeeded / 5;
    
    // Initialize position assignments
    const positionAssignments = new Map();
    const unassignedPlayers = [...roster];
    const rolesFilled = positions.reduce((acc, pos) => ({...acc, [pos]: 0}), {});
    
    // Step 1: Assign players with single position first
    unassignedPlayers.sort((a, b) => {
        // Prioritize players with only primary positions
        const aHasSecondary = Boolean(a.secondaryPosition);
        const bHasSecondary = Boolean(b.secondaryPosition);
        return aHasSecondary - bHasSecondary;
    });
    
    // First pass: Assign players with only primary positions
    for (let i = unassignedPlayers.length - 1; i >= 0; i--) {
        const player = unassignedPlayers[i];
        if (!player.secondaryPosition && rolesFilled[player.primaryPosition] < positionsPerRole) {
            positionAssignments.set(player, player.primaryPosition);
            rolesFilled[player.primaryPosition]++;
            unassignedPlayers.splice(i, 1);
        }
    }
    
    // Step 2: Score remaining players for their possible positions
    const playerScores = unassignedPlayers.map(player => {
        const possiblePositions = [player.primaryPosition];
        if (player.secondaryPosition) possiblePositions.push(player.secondaryPosition);
        
        return {
            player,
            scores: possiblePositions.map(pos => ({
                position: pos,
                score: calculatePositionalScore(player, pos)
            }))
        };
    });
    
    // Step 3: Assign remaining players based on scores and team needs
    while (unassignedPlayers.length > 0) {
        let bestAssignment = null;
        let bestScore = -1;
        let playerToAssignIndex = -1;
        
        playerScores.forEach((playerScore, index) => {
            playerScore.scores.forEach(({position, score}) => {
                if (rolesFilled[position] < positionsPerRole) {
                    // Boost score for primary position
                    const positionBonus = position === playerScore.player.primaryPosition ? 10 : 0;
                    const adjustedScore = score + positionBonus;
                    
                    if (adjustedScore > bestScore) {
                        bestScore = adjustedScore;
                        bestAssignment = position;
                        playerToAssignIndex = index;
                    }
                }
            });
        });
        
        if (bestAssignment) {
            const playerScore = playerScores[playerToAssignIndex];
            positionAssignments.set(playerScore.player, bestAssignment);
            rolesFilled[bestAssignment]++;
            
            // Remove assigned player
            playerScores.splice(playerToAssignIndex, 1);
            unassignedPlayers.splice(playerToAssignIndex, 1);
        } else {
            // If we can't make a valid assignment, we have a problem
            break;
        }
    }
    
    // Calculate position coverage penalty
    let positionPenalty = 0;
    positions.forEach(pos => {
        const missing = Math.max(0, positionsPerRole - rolesFilled[pos]);
        positionPenalty += missing * 50; // 50 point penalty per missing position
    });
    
    return {
        assignments: positionAssignments,
        positionPenalty,
        rolesFilled
    };
};