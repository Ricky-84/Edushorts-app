import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Text,
  StyleSheet,
  ViewToken,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {VideoPlayer} from '../../components/VideoPlayer';
import {videoService} from '../../services/videoService';
import {setVideos, setLoading, setCurrentIndex} from '../../store/slices/videoSlice';
import {RootState} from '../../store';
import {Video} from '../../types';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');

const VideoFeedItem: React.FC<{
  item: Video;
  isActive: boolean;
  shouldMount: boolean;
  onEnd: () => void;
}> = ({item, isActive, shouldMount, onEnd}) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [localPaused, setLocalPaused] = useState(false);
  const streamUrl = videoService.getStreamUrl(item.id);

  // Reset local pause when this item is scrolled away
  useEffect(() => {
    if (!isActive) {
      setLocalPaused(false);
    }
  }, [isActive]);

  return (
    <View style={styles.itemContainer}>
      {shouldMount && (
        <VideoPlayer
          uri={streamUrl}
          paused={!isActive || localPaused}
          style={{width: SCREEN_WIDTH, height: SCREEN_HEIGHT}}
          onEnd={onEnd}
        />
      )}

      {/* Transparent overlay for tap-to-pause — sits above the native video surface */}
      <Pressable style={styles.videoTouchArea} onPress={() => setLocalPaused(p => !p)} />

      {/* Bottom-left info overlay */}
      <View style={styles.infoOverlay}>
        <Text style={styles.subject}>{item.subject} · {item.topic}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.difficulty} · +{item.xpReward} XP</Text>
        </View>
      </View>

      {/* Right-side action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setLiked(prev => !prev)}>
          <Icon
            name={liked ? 'favorite' : 'favorite-border'}
            size={32}
            color={liked ? '#ff4444' : '#fff'}
          />
          <Text style={styles.actionLabel}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share" size={32} color="#fff" />
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setBookmarked(prev => !prev)}>
          <Icon
            name={bookmarked ? 'bookmark' : 'bookmark-border'}
            size={32}
            color={bookmarked ? '#FFD700' : '#fff'}
          />
          <Text style={styles.actionLabel}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const VideoFeedScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {videos, loading, currentIndex} = useSelector(
    (state: RootState) => state.video,
  );
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      dispatch(setLoading(true));
      try {
        const data = await videoService.getVideos();
        dispatch(setVideos(data));
      } catch (err) {
        console.error('Failed to fetch videos:', err);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchVideos();
  }, [dispatch]);

  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 95}).current;

  const onViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        dispatch(setCurrentIndex(viewableItems[0].index));
      }
    },
    [dispatch],
  );

  const handleVideoEnd = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex, videos.length]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!loading && videos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No videos available yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={videos}
      keyExtractor={item => item.id}
      renderItem={({item, index}) => (
        <VideoFeedItem
          item={item}
          isActive={index === currentIndex}
          shouldMount={index === currentIndex}
          onEnd={handleVideoEnd}
        />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(_, index) => ({
        length: SCREEN_HEIGHT,
        offset: SCREEN_HEIGHT * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  videoTouchArea: {
    ...StyleSheet.absoluteFillObject,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 80,
  },
  subject: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    color: '#ddd',
    fontSize: 13,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(0,122,255,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    position: 'absolute',
    bottom: 80,
    right: 12,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionLabel: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
  },
});
