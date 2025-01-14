import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LobbyScreen() {
  const buttons = [
    { href: '/draft', text: 'Start Draft', iconName: 'basketball-outline' },
    { href: '/advanced-setup', text: 'Advanced Setup', iconName: 'settings-outline' },
    { href: '/settings', text: 'Settings', iconName: 'cog-outline' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Ionicons name="basketball" size={40} color="#1e88e5" />
          <Text style={styles.title}>NBA Draft Simulator</Text>
          <Text style={styles.subtitle}>Build Your Dream Team</Text>
        </View>

        <View style={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <Link key={button.href} href={button.href} asChild>
              <TouchableOpacity style={styles.button}>
                <View style={styles.buttonContent}>
                  <Ionicons 
                    name={button.iconName} 
                    size={24} 
                    color="white"
                  />
                  <Text style={styles.buttonText}>{button.text}</Text>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <Text style={styles.footer}>
          Version 0.9.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e1e1e',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 20, // Vertical spacing between buttons
  },
  button: {
    backgroundColor: '#1e88e5',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginVertical: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Aligns items from the left
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12, // Horizontal spacing between icon and text
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  }
});