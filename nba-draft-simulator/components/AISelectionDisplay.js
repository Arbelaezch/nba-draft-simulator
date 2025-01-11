// AISelectionDisplay.js
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { SvgCssUri } from 'react-native-svg/css';

export default function AISelectionDisplay({ player, team, visible }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Initial fade in of the overlay
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (player && team) {
      // Fade out current content
      Animated.sequence([
        Animated.timing(contentFade, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        // Fade in new content
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [player?.id, team?.name]); // Only trigger on actual content changes

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: contentFade,
            transform: [{
              scale: contentFade.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1]
              })
            }]
          }
        ]}
      >
        {player?.image && (
          <Image
            source={{ uri: player.image }}
            style={styles.playerImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.textContainer}>
          <View style={styles.teamContainer}>
            {team?.logo && (
              <SvgCssUri
                width={28}
                height={28}
                uri={team.logo}
                style={styles.teamLogo}
              />
            )}
            <Text style={styles.selectionText}>
              {team?.name} select
            </Text>
          </View>
          <Text style={styles.playerName}>{player?.name}</Text>
          <Text style={styles.rating}>{player?.overall_rating} OVR</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  playerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  teamLogo: {
    marginRight: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 20,
    color: '#444',
    fontWeight: '500',
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  rating: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2962FF',
  },
});