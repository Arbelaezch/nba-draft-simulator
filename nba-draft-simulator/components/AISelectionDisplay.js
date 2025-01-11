import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { SvgCssUri } from 'react-native-svg/css';

export default function AISelectionDisplay({ player, visible, team }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  if (!player || !visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{
            scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1]
            })
          }]
        }
      ]}
    >
      <View style={styles.content}>
        <Image
          source={{ uri: player.image }}
          style={styles.playerImage}
          resizeMode="cover"
        />
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
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.rating}>{player.overall_rating} OVR</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
    teamContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    teamLogo: {
      marginRight: 8,
    },
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