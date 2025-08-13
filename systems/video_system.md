# Video Content Management and Delivery System

## System Architecture Overview

### High-Level Architecture
```
Content Creation → Processing → Storage → CDN → Mobile App
     ↓              ↓           ↓        ↓         ↓
AI Generation → Transcoding → AWS S3 → CloudFront → React Native
Human Upload → Optimization → Metadata → Caching → Video Player
```

## Content Creation Pipeline

### 1. AI-Generated Video Creation

#### Script Generation (OpenAI GPT-4)
```typescript
interface VideoScript {
  topic: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // seconds (15-60)
  script: string;
  keyPoints: string[];
  visualCues: string[];
}

const generateScript = async (topic: string, subject: string): Promise<VideoScript> => {
  const prompt = `
    Create a 45-second educational script for college students about "${topic}" in ${subject}.
    Format: Engaging, concise explanation with visual cues for animations.
    Include: Hook (first 3 seconds), main concept, example, conclusion.
    Style: Conversational, use analogies, avoid jargon.
  `;
  
  return await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }]
  });
};
```

#### Video Generation (Synthesia API)
```typescript
interface SynthesiaVideo {
  script: string;
  avatar: string;
  voice: string;
  background: string;
  aspect_ratio: '9:16'; // Vertical format
}

const generateVideo = async (script: VideoScript): Promise<string> => {
  const response = await synthesia.createVideo({
    script: script.script,
    avatar: 'educational_avatar_1',
    voice: 'en-US-neural-female',
    background: 'educational_clean',
    aspect_ratio: '9:16',
    webhook_url: process.env.SYNTHESIA_WEBHOOK
  });
  
  return response.video_id;
};
```

### 2. Human-Created Content Upload

#### Upload Interface (Admin Dashboard)
```typescript
interface VideoUpload {
  file: File;
  metadata: {
    title: string;
    subject: string;
    topic: string;
    difficulty: string;
    duration: number;
    description: string;
    tags: string[];
    prerequisites: string[];
  };
  creator: {
    name: string;
    credentials: string;
    university?: string;
  };
}

const uploadVideo = async (upload: VideoUpload) => {
  // 1. Upload to S3 staging bucket
  const s3Key = await uploadToS3(upload.file, 'staging');
  
  // 2. Queue for processing
  await addToProcessingQueue({
    s3Key,
    metadata: upload.metadata,
    source: 'human_upload'
  });
  
  // 3. Return processing job ID
  return { jobId: generateJobId(), status: 'queued' };
};
```

## Video Processing Pipeline

### 1. Video Transcoding (AWS Lambda + FFmpeg)

#### Processing Workflow
```typescript
interface VideoProcessingJob {
  inputS3Key: string;
  outputFormats: VideoFormat[];
  metadata: VideoMetadata;
  source: 'ai_generated' | 'human_upload';
}

interface VideoFormat {
  resolution: '720p' | '1080p';
  bitrate: number;
  codec: 'h264' | 'h265';
  container: 'mp4';
}

const processVideo = async (job: VideoProcessingJob) => {
  const inputFile = await downloadFromS3(job.inputS3Key);
  
  // 1. Extract metadata
  const videoInfo = await ffprobe(inputFile);
  
  // 2. Validate format (vertical 9:16 aspect ratio)
  validateAspectRatio(videoInfo);
  
  // 3. Generate multiple quality versions
  const outputs = await Promise.all([
    transcodeVideo(inputFile, { resolution: '720p', bitrate: 2000 }),
    transcodeVideo(inputFile, { resolution: '1080p', bitrate: 4000 }),
    generateThumbnails(inputFile, { count: 3, timestamps: [1, 15, 30] })
  ]);
  
  // 4. Upload processed files to S3
  const s3Keys = await uploadProcessedFiles(outputs);
  
  // 5. Update database with video metadata
  await saveVideoRecord({
    ...job.metadata,
    formats: s3Keys,
    processing_status: 'completed'
  });
  
  return { status: 'completed', s3Keys };
};
```

### 2. Quality Control and Validation

#### Automated Checks
```typescript
interface QualityCheck {
  duration: boolean; // 15-60 seconds
  aspectRatio: boolean; // 9:16 vertical
  resolution: boolean; // minimum 720p
  audio: boolean; // clear audio levels
  fileSize: boolean; // under 50MB
  content: boolean; // appropriate educational content
}

const performQualityChecks = async (videoPath: string): Promise<QualityCheck> => {
  const info = await ffprobe(videoPath);
  
  return {
    duration: info.duration >= 15 && info.duration <= 60,
    aspectRatio: Math.abs((info.height / info.width) - (16/9)) < 0.1,
    resolution: info.height >= 720,
    audio: info.audioLevel > -40, // dB threshold
    fileSize: info.size < 50 * 1024 * 1024, // 50MB
    content: await checkContentAppropriateness(videoPath)
  };
};
```

### 3. Closed Caption Generation

#### Auto-Generated Captions (Whisper API)
```typescript
const generateCaptions = async (videoS3Key: string): Promise<string> => {
  // 1. Extract audio track
  const audioFile = await extractAudio(videoS3Key);
  
  // 2. Generate transcription
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    response_format: "srt",
    language: "en"
  });
  
  // 3. Upload SRT file to S3
  const captionS3Key = await uploadCaptions(transcription, videoS3Key);
  
  return captionS3Key;
};
```

## Storage and Content Delivery

### 1. AWS S3 Storage Structure

#### Bucket Organization
```
educational-videos-prod/
├── raw/                    # Original uploaded files
│   ├── ai-generated/
│   └── human-uploaded/
├── processed/              # Transcoded videos
│   ├── 720p/
│   ├── 1080p/
│   └── thumbnails/
├── captions/              # SRT files
└── metadata/              # JSON metadata files
```

#### S3 Configuration
```typescript
const s3Config = {
  bucket: 'educational-videos-prod',
  region: 'us-east-1',
  lifecycle: {
    transitions: [
      { days: 30, storageClass: 'STANDARD_IA' },
      { days: 90, storageClass: 'GLACIER' }
    ]
  },
  versioning: true,
  encryption: 'AES256'
};
```

### 2. CloudFront CDN Setup

#### Distribution Configuration
```typescript
const cloudFrontConfig = {
  origins: [{
    domainName: 'educational-videos-prod.s3.amazonaws.com',
    originPath: '/processed',
    s3OriginConfig: {
      originAccessIdentity: 'origin-access-identity'
    }
  }],
  behaviors: [{
    pathPattern: '*.mp4',
    cachePolicyId: 'video-cache-policy',
    ttl: { default: 86400, max: 31536000 } // 1 day default, 1 year max
  }],
  geoRestriction: { type: 'none' },
  priceClass: 'PriceClass_All'
};
```

## Database Schema

### Video Metadata Storage

#### Core Tables
```sql
-- Videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty difficulty_level NOT NULL,
    duration INTEGER NOT NULL, -- seconds
    description TEXT,
    tags TEXT[],
    prerequisites UUID[], -- references videos.id
    
    -- File references
    video_720p_url VARCHAR(500),
    video_1080p_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    captions_url VARCHAR(500),
    
    -- Content metadata
    creator_type content_source NOT NULL, -- 'ai_generated' | 'human_created'
    creator_id UUID REFERENCES creators(id),
    educational_objectives TEXT[],
    key_concepts TEXT[],
    
    -- Technical metadata
    file_size_mb DECIMAL(10,2),
    aspect_ratio VARCHAR(10) DEFAULT '9:16',
    encoding_quality VARCHAR(20),
    processing_status processing_status DEFAULT 'pending',
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,4) DEFAULT 0,
    average_score DECIMAL(5,4) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_videos_subject_topic (subject, topic),
    INDEX idx_videos_difficulty (difficulty),
    INDEX idx_videos_published (published_at) WHERE published_at IS NOT NULL
);

-- Video sequences for learning paths
CREATE TABLE video_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    description TEXT,
    video_order UUID[], -- ordered array of video IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User video interactions
CREATE TABLE user_video_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    video_id UUID NOT NULL REFERENCES videos(id),
    
    -- Viewing data
    watch_time_seconds INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,4) DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Engagement
    liked BOOLEAN DEFAULT FALSE,
    bookmarked BOOLEAN DEFAULT FALSE,
    shared_count INTEGER DEFAULT 0,
    
    -- Learning progress
    quiz_attempts INTEGER DEFAULT 0,
    quiz_best_score DECIMAL(5,4) DEFAULT 0,
    mastery_achieved BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, video_id),
    INDEX idx_user_interactions_user (user_id),
    INDEX idx_user_interactions_video (video_id)
);
```

## Content Delivery API

### Video Feed API

#### Recommendation Endpoint
```typescript
interface VideoFeedRequest {
  userId: string;
  limit?: number; // default 10
  offset?: number; // pagination
  subject?: string; // filter by subject
  difficulty?: string; // filter by difficulty
  refreshCache?: boolean;
}

interface VideoFeedResponse {
  videos: VideoItem[];
  hasMore: boolean;
  nextOffset: number;
  recommendations: {
    algorithm: string;
    confidence: number;
  };
}

app.get('/api/videos/feed', async (req: Request, res: Response) => {
  const { userId, limit = 10, offset = 0, subject, difficulty } = req.query;
  
  // 1. Get user profile and preferences
  const userProfile = await getUserProfile(userId as string);
  
  // 2. Generate recommendations
  const recommendedVideos = await getRecommendedVideos({
    userProfile,
    filters: { subject, difficulty },
    limit: Number(limit),
    offset: Number(offset)
  });
  
  // 3. Add CDN URLs and user-specific data
  const videosWithUrls = await Promise.all(
    recommendedVideos.map(async (video) => ({
      ...video,
      videoUrl: getCDNUrl(video.video_720p_url), // Default to 720p
      thumbnailUrl: getCDNUrl(video.thumbnail_url),
      userProgress: await getUserVideoProgress(userId as string, video.id),
      isCompleted: await isVideoCompleted(userId as string, video.id)
    }))
  );
  
  res.json({
    videos: videosWithUrls,
    hasMore: recommendedVideos.length === Number(limit),
    nextOffset: Number(offset) + Number(limit)
  });
});
```

#### Individual Video Endpoint
```typescript
app.get('/api/videos/:videoId', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { userId, quality = '720p' } = req.query;
  
  // 1. Get video metadata
  const video = await getVideoById(videoId);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  
  // 2. Get user-specific data
  const userProgress = userId ? await getUserVideoProgress(userId as string, videoId) : null;
  
  // 3. Select appropriate video quality
  const videoUrl = quality === '1080p' && video.video_1080p_url 
    ? getCDNUrl(video.video_1080p_url)
    : getCDNUrl(video.video_720p_url);
  
  // 4. Track view (asynchronously)
  if (userId) {
    trackVideoView(userId as string, videoId).catch(console.error);
  }
  
  res.json({
    ...video,
    videoUrl,
    thumbnailUrl: getCDNUrl(video.thumbnail_url),
    captionsUrl: video.captions_url ? getCDNUrl(video.captions_url) : null,
    userProgress,
    relatedVideos: await getRelatedVideos(videoId, 5)
  });
});
```

## Mobile App Integration

### React Native Video Player

#### Custom Video Component
```typescript
import Video from 'react-native-video';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

interface EducationalVideoPlayerProps {
  videoUrl: string;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onProgressUpdate: (progress: number) => void;
  onVideoEnd: () => void;
}

const EducationalVideoPlayer: React.FC<EducationalVideoPlayerProps> = ({
  videoUrl,
  onSwipeUp,
  onSwipeDown,
  onProgressUpdate,
  onVideoEnd
}) => {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      
      if (Math.abs(velocityY) > 500) {
        if (velocityY < 0) {
          onSwipeUp(); // Next video
        } else {
          onSwipeDown(); // Previous video
        }
      }
    }
  };
  
  const handleProgress = (data: any) => {
    const currentProgress = data.currentTime / data.seekableDuration;
    setProgress(currentProgress);
    onProgressUpdate(currentProgress);
  };
  
  return (
    <PanGestureHandler
      onGestureEvent={handleGestureStateChange}
      activeOffsetY={[-20, 20]}
    >
      <View style={styles.container}>
        <Video
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          onProgress={handleProgress}
          onEnd={onVideoEnd}
          progressUpdateInterval={1000}
        />
        
        <TouchableOpacity
          style={styles.playPause}
          onPress={() => setPaused(!paused)}
        >
          <Icon name={paused ? 'play' : 'pause'} size={30} color="white" />
        </TouchableOpacity>
        
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </PanGestureHandler>
  );
};
```

### Caching and Offline Support

#### Video Caching Strategy
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

class VideoCacheManager {
  private cacheDir = `${RNFS.DocumentDirectoryPath}/video_cache`;
  private maxCacheSize = 500 * 1024 * 1024; // 500MB
  
  async cacheVideo(videoId: string, videoUrl: string): Promise<string> {
    const localPath = `${this.cacheDir}/${videoId}.mp4`;
    
    // Check if already cached
    const exists = await RNFS.exists(localPath);
    if (exists) return localPath;
    
    // Download and cache
    await RNFS.downloadFile({
      fromUrl: videoUrl,
      toFile: localPath,
      progress: (res) => {
        const progress = (res.bytesWritten / res.contentLength) * 100;
        this.notifyDownloadProgress(videoId, progress);
      }
    }).promise;
    
    // Update cache metadata
    await this.updateCacheMetadata(videoId, localPath);
    
    // Clean up old cached videos if needed
    await this.cleanupCache();
    
    return localPath;
  }
  
  private async cleanupCache() {
    const cacheInfo = await this.getCacheInfo();
    if (cacheInfo.totalSize > this.maxCacheSize) {
      // Remove oldest cached videos
      const sortedFiles = cacheInfo.files.sort((a, b) => a.lastAccessed - b.lastAccessed);
      
      for (const file of sortedFiles) {
        await RNFS.unlink(file.path);
        cacheInfo.totalSize -= file.size;
        
        if (cacheInfo.totalSize <= this.maxCacheSize * 0.8) break;
      }
    }
  }
}
```

## Performance Optimization

### Video Loading Optimization

#### Adaptive Bitrate Streaming
```typescript
const getOptimalVideoQuality = (networkSpeed: number, deviceCapability: string) => {
  // Network speed in Mbps
  if (networkSpeed > 5 && deviceCapability === 'high') {
    return '1080p';
  } else if (networkSpeed > 2) {
    return '720p';
  } else {
    return '480p'; // Fallback for slow connections
  }
};

// Preload next video for smooth experience
const preloadNextVideo = async (videoId: string) => {
  const nextVideo = await getNextVideoInSequence(videoId);
  if (nextVideo) {
    // Preload first 10 seconds of next video
    await prefetchVideoSegment(nextVideo.videoUrl, { start: 0, duration: 10 });
  }
};
```

### Analytics and Monitoring

#### Video Performance Tracking
```typescript
interface VideoAnalytics {
  videoId: string;
  loadTime: number;
  bufferEvents: number;
  qualitySwitches: number;
  completionRate: number;
  userEngagement: {
    pauses: number;
    seeks: number;
    replays: number;
  };
}

const trackVideoPerformance = async (analytics: VideoAnalytics) => {
  await fetch('/api/analytics/video-performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analytics)
  });
};
```

This video system provides a robust, scalable foundation for delivering educational content with optimal performance and user experience.