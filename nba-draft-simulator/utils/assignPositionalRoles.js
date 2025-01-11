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
    
    // Step 2: Calculate available positions for remaining players
    const playerScores = unassignedPlayers.map(player => {
        // Get all possible positions for the player
        let possiblePositions = [player.primaryPosition];
        if (player.secondaryPosition) possiblePositions.push(player.secondaryPosition);
        
        // Remove positions that are already fully filled
        possiblePositions = possiblePositions.filter(pos => 
            rolesFilled[pos] < positionsPerRole
        );
        
        // Calculate scores for remaining possible positions
        const scores = possiblePositions.map(pos => ({
            position: pos,
            score: calculatePositionalScore(player, pos)
        }));
        
        return {
            player,
            scores,
            // Track original possible positions for penalty calculation
            originalPositions: possiblePositions
        };
    });
    
    // Step 3: Assign remaining players based on scores and team needs
    while (unassignedPlayers.length > 0) {
        let bestAssignment = null;
        let bestScore = -1;
        let playerToAssignIndex = -1;
        
        // Find best assignment considering reduced position options
        playerScores.forEach((playerScore, index) => {
            playerScore.scores.forEach(({position, score}) => {
                if (rolesFilled[position] < positionsPerRole) {
                    // Boost score for primary position
                    const positionBonus = position === playerScore.player.primaryPosition ? 10 : 0;
                    // Add penalty if this is player's only remaining position option
                    const necessityBonus = playerScore.scores.length === 1 ? 20 : 0;
                    const adjustedScore = score + positionBonus + necessityBonus;
                    
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
            
            // Update remaining players' possible positions
            playerScores.forEach(ps => {
                // Remove the filled position from possible positions if it's full
                if (rolesFilled[bestAssignment] >= positionsPerRole) {
                    ps.scores = ps.scores.filter(score => score.position !== bestAssignment);
                }
            });
        } else {
            // If we can't make a valid assignment, break out
            break;
        }
    }
    
    // Calculate position coverage penalty
    let positionPenalty = 0;
    const validTeamSizes = [5, 7, 10, 12];
    
    // Only apply penalty if the team size is not valid
    if (!validTeamSizes.includes(roster.length)) {
        positions.forEach(pos => {
            const missing = Math.max(0, positionsPerRole - rolesFilled[pos]);
            positionPenalty += missing * 50; // 50 point penalty per missing position
        });
    }
    
    // Add penalty for players forced into non-preferred positions
    playerScores.forEach(ps => {
        if (ps.originalPositions.length > ps.scores.length) {
            positionPenalty += 20; // Penalty for each player with reduced position options
        }
    });

    // Convert assignments Map to array of simple name/position objects
    const assignmentsList = Array.from(positionAssignments).map(([player, position]) => ({
        name: player.name,
        position: position
    }));
    
    return {
        assignments: positionAssignments,
        positionPenalty,
        rolesFilled,
        assignmentsList
    };
};