import { View, Text, StyleSheet, Pressable } from 'react-native';
import { calculateCompositeRating } from '../services/nbaService';

export default function PlayerCard({ player, onSelect, disabled }) {
  const getRatingColor = (rating) => {
    if (rating >= 90) return '#00C853';
    if (rating >= 80) return '#2962FF';
    if (rating >= 70) return '#FF6D00';
    return '#757575';
  };

  return (
    <Pressable 
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={() => !disabled && onSelect(player)}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={[styles.rating, { color: getRatingColor(player.overall_rating) }]}>
          {player.overall_rating}
        </Text>
      </View>

      <Text style={styles.position}>{player.position} • {player.height}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Inside</Text>
          <Text style={styles.statValue}>
            {calculateCompositeRating(player.inside_scoring)}
          </Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Shooting</Text>
          <Text style={styles.statValue}>
            {calculateCompositeRating(player.shooting)}
          </Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Playmaking</Text>
          <Text style={styles.statValue}>
            {calculateCompositeRating(player.playmaking)}
          </Text>
        </View>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Defense</Text>
          <Text style={styles.statValue}>
            {calculateCompositeRating(player.defense)}
          </Text>
        </View>
      </View>

      <View style={styles.detailedStats}>
        <Text style={styles.detailText}>3PT: {player.shooting.three_point}</Text>
        <Text style={styles.detailText}>Speed: {player.athleticism.speed}</Text>
        <Text style={styles.detailText}>
          Defense: {Math.round((player.defense.interior + player.defense.perimeter) / 2)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  rating: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  position: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statColumn: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
});