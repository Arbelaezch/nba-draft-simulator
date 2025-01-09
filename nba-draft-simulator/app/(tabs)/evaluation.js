import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useDraft } from '../../context/DraftContext';

// Evaluate a team's overall score based on player ratings and positions
const evaluateTeam = (roster) => {
  if (!roster || roster.length === 0) return 0;
  
  // Basic scoring: average of player ratings with position coverage bonus
  const positionsCovered = new Set(roster.map(player => player.position));
  const positionBonus = positionsCovered.size * 2; // +2 points per unique position
  
  const averageRating = roster.reduce((sum, player) => 
    sum + player.overall_rating, 0) / roster.length;
    
  return Math.round(averageRating + positionBonus);
};

// Get feedback message based on score
const getFeedbackMessage = (score) => {
  if (score >= 90) return "Outstanding draft! Your team looks championship ready! 🏆";
  if (score >= 80) return "Great draft! Your team has serious potential! 🌟";
  if (score >= 70) return "Solid draft! Your team should be competitive. 👍";
  if (score >= 60) return "Decent draft. There's room for improvement. 🔄";
  return "Keep practicing! Every draft is a learning experience. 📚";
};

export default function EvaluationScreen() {
  const { state } = useDraft();
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  
  // Get user team
  const userTeam = state.teams.find(team => team.isUser);
  const userScore = evaluateTeam(userTeam.roster);
  
  // Get AI teams and their scores
  const aiTeams = state.teams
    .filter(team => !team.isUser)
    .map(team => ({
      ...team,
      score: evaluateTeam(team.roster)
    }))
    .sort((a, b) => b.score - a.score); // Sort by score descending

  // Handler for team row clicks
  const toggleTeamExpansion = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  // Render player stats row
  const renderPlayerStats = (player) => (
    <View key={player.id} style={styles.playerRow}>
      <Text style={styles.playerName}>{player.name}</Text>
      <Text style={styles.playerPosition}>{player.position}</Text>
      <Text style={styles.playerRating}>{player.overall_rating}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Team Section */}
      <View style={styles.userSection}>
        <Text style={styles.headerText}>Your Draft Results</Text>
        <Text style={styles.scoreText}>Overall Score: {userScore}</Text>
        <Text style={styles.feedbackText}>{getFeedbackMessage(userScore)}</Text>
        
        <View style={styles.rosterHeader}>
          <Text style={styles.columnHeader}>Player</Text>
          <Text style={styles.columnHeader}>Pos</Text>
          <Text style={styles.columnHeader}>OVR</Text>
        </View>
        
        {userTeam.roster.map(renderPlayerStats)}
      </View>

      {/* AI Teams Section */}
      <View style={styles.aiSection}>
        <Text style={styles.headerText}>Other Teams</Text>
        
        {aiTeams.map(team => (
          <View key={team.id}>
            <TouchableOpacity 
              style={styles.teamRow}
              onPress={() => toggleTeamExpansion(team.id)}
            >
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamScore}>Score: {team.score}</Text>
              <Text style={styles.expandIcon}>
                {expandedTeamId === team.id ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            {expandedTeamId === team.id && (
              <View style={styles.expandedContent}>
                <View style={styles.rosterHeader}>
                  <Text style={styles.columnHeader}>Player</Text>
                  <Text style={styles.columnHeader}>Pos</Text>
                  <Text style={styles.columnHeader}>OVR</Text>
                </View>
                {team.roster.map(renderPlayerStats)}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Return Button */}
      <TouchableOpacity 
        style={styles.returnButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.returnButtonText}>Return to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  userSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  aiSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c5282',
  },
  feedbackText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#4a5568',
    fontStyle: 'italic',
  },
  rosterHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 8,
  },
  columnHeader: {
    flex: 1,
    fontWeight: '600',
    color: '#4a5568',
  },
  playerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  playerName: {
    flex: 1,
    color: '#2d3748',
  },
  playerPosition: {
    flex: 1,
    color: '#4a5568',
  },
  playerRating: {
    flex: 1,
    color: '#2c5282',
    fontWeight: '500',
  },
  teamRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
  },
  teamScore: {
    marginRight: 8,
    color: '#2c5282',
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 16,
    color: '#4a5568',
  },
  expandedContent: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  returnButton: {
    backgroundColor: '#2c5282',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});