import React, {useState} from 'react';
import {View, ActivityIndicator, Text, StyleSheet, ViewStyle} from 'react-native';
import Video, {OnProgressData, OnBufferData, LoadError} from 'react-native-video';

interface VideoPlayerProps {
  uri: string;
  paused: boolean;
  style?: ViewStyle;
  onProgress?: (watchTime: number) => void;
  onEnd?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  paused,
  style,
  onProgress,
  onEnd,
}) => {
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuffer = ({isBuffering}: OnBufferData) => {
    setBuffering(isBuffering);
  };

  const handleProgress = ({currentTime}: OnProgressData) => {
    onProgress?.(Math.floor(currentTime));
  };

  const handleError = (err: LoadError) => {
    setError('Failed to load video');
    console.error('Video error:', err);
  };

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Video
        source={{uri}}
        style={[styles.video, style]}
        resizeMode="cover"
        paused={paused}
        repeat={false}
        useTextureView={true}
        onBuffer={handleBuffer}
        onProgress={handleProgress}
        onError={handleError}
        onEnd={onEnd}
        progressUpdateInterval={1000}
      />
      {buffering && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
});
