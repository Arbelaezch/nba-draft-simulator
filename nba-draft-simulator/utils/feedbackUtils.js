const getTeamWeakness = (breakdown) => {
    // Extract all numeric values from the nested objects
    const metrics = {
        ...breakdown.coreAttributes,
        ...breakdown.fundamentalSkills,
        ...breakdown.teamComposition
    };

    // Find the lowest scoring metric
    let lowestMetric = {
        name: '',
        value: Infinity
    };

    for (const [key, value] of Object.entries(metrics)) {
        if (value < lowestMetric.value) {
            lowestMetric = {
                name: key,
                value: value
            };
        }
    }

    // Generate improvement suggestions based on the weakest area
    const suggestions = {
        versatility: "Try drafting more players who can play multiple positions or have switchable defensive skills.",
        clutch: "Look for players with high shot IQ and consistency ratings for those crucial late-game situations.",
        defense: "Consider adding more defensive specialists or rim protectors to your roster.",
        offense: "Your team could use more scoring punch - look for efficient shooters and inside scorers.",
        playmaking: "Try to add more players with strong passing and ball-handling abilities.",
        rebounding: "Focus on drafting players with strong rebounding ratings to control the glass.",
        chemistry: "Look for players whose skills complement each other better.",
        heightBalance: "Try to balance your roster's height distribution across positions.",
        positionBalance: "Focus on filling gaps in your positional coverage.",
        legendaryTeammates: "Consider drafting players with established chemistry from historic teams."
    };

    return {
        metric: lowestMetric.name,
        value: lowestMetric.value,
        suggestion: suggestions[lowestMetric.name]
    };
};

const getLegendaryTeammateFeedback = (combinations) => {
    if (!combinations || combinations.length === 0) return '';
    
    return combinations.map(combo => {
        const playerNames = combo.players.join(' and ');
        return `Nice! ${playerNames} are ${combo.description}!`;
    }).join(' ');
};

const getOverallTierMessage = (score) => {
    if (score >= 160)
        return "Your team is ELITE! You've built a dynasty-caliber roster that could dominate any era.";
    if (score >= 150)
        return "You've assembled a true CHAMPIONSHIP CONTENDER! This team has what it takes to compete for titles.";
    if (score >= 140)
        return "Excellent work! Your team has the makings of a serious playoff threat with great overall balance.";
    if (score >= 130)
        return "Solid roster construction! Your team shows real potential to make noise in the playoffs.";
    if (score >= 120)
        return "Good foundation! With some tweaks, this team could become a real contender.";
    if (score >= 110)
        return "You're on the right track! A few key additions could really elevate this roster.";
    if (score >= 100)
        return "This team has potential but needs some work to compete at a higher level.";
    if (score >= 90)
        return "Your team is still developing. Focus on building a more cohesive roster.";
    if (score >= 80)
        return "Keep working on your team composition. There's room for improvement across the board.";
    return "Time to rebuild! Focus on establishing a stronger foundation with your next draft.";
};

const getFeedbackMessage = (scoreData) => {
    const weakness = getTeamWeakness(scoreData.breakdown);
    const legendaryFeedback = getLegendaryTeammateFeedback(scoreData.legendaryResults.combinations);
    const tierMessage = getOverallTierMessage(scoreData.score);

    // Combine feedback components
    let feedback = tierMessage;

    // Add legendary combinations if they exist
    if (legendaryFeedback) {
        feedback += '\n\n' + legendaryFeedback;
    }

    // Add improvement suggestion
    feedback += `\n\nRoom for improvement: Your team's ${weakness.metric} (${Math.round(weakness.value)}/200) could use work. ${weakness.suggestion}`;

    return feedback;
};

export { getFeedbackMessage };