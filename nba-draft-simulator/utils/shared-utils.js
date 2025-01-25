export const calculatePositionalScore = (player, position) => {
    if (!player || !position) return 0;
    
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