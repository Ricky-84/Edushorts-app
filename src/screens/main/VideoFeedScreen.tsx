import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export const VideoFeedScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Feed</Text>
      <Text style={styles.subtitle}>TikTok-style learning videos coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
  },
});