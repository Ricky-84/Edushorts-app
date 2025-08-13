# User Flow and App Navigation Structure

## App Navigation Architecture

### Navigation Pattern: Tab-Based with Modal Overlays
```
Bottom Tab Navigation (5 tabs)
├── Learn (Home Feed)
├── Explore (Subject Browser)
├── Progress (Stats & Achievements)
├── Social (Friends & Leagues)
└── Profile (Settings & Account)

Modal Overlays
├── Video Player (Full Screen)
├── Quiz Interface
├── Achievement Popup
├── Settings Panel
└── Onboarding Flow
```

## Core User Flows

### 1. First-Time User Onboarding Flow

#### Flow Steps
```
App Launch → Splash Screen → Welcome → Registration → Profile Setup → 
Tutorial → Subject Selection → First Video → Onboarding Quiz → Dashboard
```

#### Detailed User Journey
```typescript
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  duration: number; // seconds
  skippable: boolean;
}

const ONBOARDING_FLOW: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to EduShorts',
    description: 'Learn college subjects through engaging short videos',
    component: 'WelcomeScreen',
    duration: 5,
    skippable: false
  },
  {
    id: 'registration',
    title: 'Create Your Account',
    description: 'Quick sign-up to get started',
    component: 'RegistrationScreen',
    duration: 60,
    skippable: false
  },
  {
    id: 'profile_setup',
    title: 'Tell Us About Yourself',
    description: 'Help us personalize your learning experience',
    component: 'ProfileSetupScreen',
    duration: 90,
    skippable: false
  },
  {
    id: 'tutorial',
    title: 'How It Works',
    description: 'Learn the app basics in 60 seconds',
    component: 'TutorialScreen',
    duration: 60,
    skippable: true
  },
  {
    id: 'subject_selection',
    title: 'Choose Your Subjects',
    description: 'Select your current courses',
    component: 'SubjectSelectionScreen',
    duration: 45,
    skippable: false
  },
  {
    id: 'first_video',
    title: 'Your First Video',
    description: 'Watch and learn',
    component: 'VideoPlayerScreen',
    duration: 45,
    skippable: false
  },
  {
    id: 'first_quiz',
    title: 'Quick Quiz',
    description: 'Test what you learned',
    component: 'QuizScreen',
    duration: 60,
    skippable: false
  }
];
```

#### Onboarding Components Flow
```typescript
// Welcome Screen
const WelcomeScreen = () => (
  <View style={styles.welcomeContainer}>
    <LottieView source={welcomeAnimation} autoPlay />
    <Text style={styles.welcomeTitle}>Welcome to EduShorts</Text>
    <Text style={styles.welcomeSubtitle}>
      Master college subjects through bite-sized video learning
    </Text>
    <TouchableOpacity style={styles.getStartedButton}>
      <Text style={styles.buttonText}>Get Started</Text>
    </TouchableOpacity>
  </View>
);

// Profile Setup Screen
const ProfileSetupScreen = () => {
  const [formData, setFormData] = useState({
    university: '',
    major: '',
    year: '',
    courses: [],
    learningGoals: []
  });
  
  return (
    <ScrollView style={styles.setupContainer}>
      <ProgressBar current={2} total={7} />
      <Text style={styles.setupTitle}>Tell us about yourself</Text>
      
      <UniversitySelector 
        value={formData.university}
        onChange={(value) => setFormData({...formData, university: value})}
      />
      
      <MajorSelector
        value={formData.major}
        onChange={(value) => setFormData({...formData, major: value})}
      />
      
      <YearSelector
        value={formData.year}
        onChange={(value) => setFormData({...formData, year: value})}
      />
      
      <CourseSelector
        selectedCourses={formData.courses}
        onChange={(courses) => setFormData({...formData, courses})}
      />
      
      <Button title="Continue" onPress={handleContinue} />
    </ScrollView>
  );
};
```

### 2. Daily Learning Flow

#### Primary Learning Journey
```
App Open → Home Feed → Video Selection → Watch Video → Quiz → 
XP Reward → Next Video → Progress Update → Achievement Check
```

#### Home Feed User Experience
```typescript
const HomeFeedScreen = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const handleSwipeUp = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      preloadNextVideo(videos[currentVideoIndex + 2]);
    } else {
      loadMoreVideos();
    }
  };
  
  const handleSwipeDown = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };
  
  const handleVideoEnd = () => {
    // Trigger quiz if video completed
    if (shouldShowQuiz(videos[currentVideoIndex])) {
      navigation.navigate('QuizModal', { 
        videoId: videos[currentVideoIndex].id 
      });
    } else {
      handleSwipeUp(); // Auto-advance to next video
    }
  };
  
  return (
    <PagerView 
      style={styles.container}
      orientation="vertical"
      onPageSelected={handlePageChange}
    >
      {videos.map((video, index) => (
        <VideoPlayerScreen
          key={video.id}
          video={video}
          isActive={index === currentVideoIndex}
          onSwipeUp={handleSwipeUp}
          onSwipeDown={handleSwipeDown}
          onVideoEnd={handleVideoEnd}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      ))}
    </PagerView>
  );
};
```

### 3. Quiz Interaction Flow

#### Quiz Modal Experience
```
Video End → Quiz Trigger → Question Display → Answer Selection → 
Feedback → Score Display → XP Award → Continue/Retry Options
```

#### Quiz Flow Implementation
```typescript
const QuizModal = ({ route, navigation }) => {
  const { videoId } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  const handleAnswerSubmit = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    if (currentQuestion < quiz.questions.length - 1) {
      // Next question
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 1500); // Show feedback first
    } else {
      // Quiz complete
      setTimeout(() => {
        setShowResults(true);
      }, 1500);
    }
  };
  
  const handleQuizComplete = (score) => {
    // Award XP and update progress
    navigation.goBack();
    // Show achievement popup if earned
  };
  
  if (showResults) {
    return (
      <QuizResults
        quiz={quiz}
        answers={answers}
        onComplete={handleQuizComplete}
        onRetry={() => {
          setCurrentQuestion(0);
          setAnswers({});
          setShowResults(false);
        }}
      />
    );
  }
  
  return (
    <Modal transparent animationType="slide">
      <View style={styles.quizContainer}>
        <QuizHeader 
          current={currentQuestion + 1} 
          total={quiz?.questions.length} 
        />
        
        <QuestionComponent
          question={quiz?.questions[currentQuestion]}
          onAnswer={handleAnswerSubmit}
        />
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
```

### 4. Progress and Achievement Flow

#### Progress Dashboard Journey
```
Progress Tab → Overview Stats → Subject Breakdown → Achievement Gallery → 
Streak Status → Level Progress → Learning Insights
```

#### Progress Screen Layout
```typescript
const ProgressScreen = () => {
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <ScrollView style={styles.progressContainer}>
      <UserLevelCard level={userStats?.level} />
      
      <StreakCard 
        currentStreak={userStats?.currentStreak}
        longestStreak={userStats?.longestStreak}
      />
      
      <TabSelector
        tabs={['Overview', 'Subjects', 'Achievements']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {activeTab === 'overview' && (
        <OverviewStats stats={userStats} />
      )}
      
      {activeTab === 'subjects' && (
        <SubjectProgress subjects={userStats?.subjects} />
      )}
      
      {activeTab === 'achievements' && (
        <AchievementGallery achievements={achievements} />
      )}
    </ScrollView>
  );
};
```

### 5. Social Features Flow

#### Social Interaction Journey
```
Social Tab → Friends List → Leaderboards → Study Groups → 
Challenge Friends → Share Progress → Help Others
```

## Navigation Implementation

### React Navigation Structure
```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => (
        <TabIcon name={route.name} focused={focused} color={color} size={size} />
      ),
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: 'gray',
      headerShown: false
    })}
  >
    <Tab.Screen 
      name="Learn" 
      component={LearnStackNavigator}
      options={{ title: 'Learn' }}
    />
    <Tab.Screen 
      name="Explore" 
      component={ExploreScreen}
      options={{ title: 'Explore' }}
    />
    <Tab.Screen 
      name="Progress" 
      component={ProgressScreen}
      options={{ title: 'Progress' }}
    />
    <Tab.Screen 
      name="Social" 
      component={SocialScreen}
      options={{ title: 'Social' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

// Learn Stack with Video Player
const LearnStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeFeed" component={HomeFeedScreen} />
    <Stack.Screen 
      name="VideoPlayer" 
      component={VideoPlayerScreen}
      options={{ presentation: 'fullScreenModal' }}
    />
  </Stack.Navigator>
);

// App Root Navigator
const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Onboarding" component={OnboardingFlow} />
    <Stack.Screen name="MainApp" component={MainTabNavigator} />
    
    {/* Modal Screens */}
    <Stack.Group screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="QuizModal" component={QuizModal} />
      <Stack.Screen name="AchievementModal" component={AchievementModal} />
      <Stack.Screen name="SettingsModal" component={SettingsModal} />
    </Stack.Group>
  </Stack.Navigator>
);
```

### Deep Linking Structure
```typescript
const linkingConfig = {
  prefixes: ['edushorts://', 'https://edushorts.com'],
  config: {
    screens: {
      MainApp: {
        screens: {
          Learn: {
            screens: {
              HomeFeed: 'learn',
              VideoPlayer: 'video/:videoId'
            }
          },
          Explore: 'explore/:subject?',
          Progress: 'progress',
          Social: {
            screens: {
              Friends: 'friends',
              Leaderboard: 'leaderboard/:league?'
            }
          },
          Profile: 'profile'
        }
      },
      QuizModal: 'quiz/:videoId',
      AchievementModal: 'achievement/:achievementId'
    }
  }
};
```

## User Experience Patterns

### 1. Gesture Controls
```typescript
// Video Player Gestures
const videoGestures = {
  swipeUp: 'Next video',
  swipeDown: 'Previous video',
  swipeLeft: 'Skip to next topic',
  swipeRight: 'Bookmark video',
  tap: 'Play/Pause',
  doubleTap: 'Like video',
  longPress: 'Video options menu'
};

// Quiz Gestures
const quizGestures = {
  tap: 'Select answer',
  swipeLeft: 'Skip question (if allowed)',
  swipeDown: 'Close quiz'
};
```

### 2. Loading States and Transitions
```typescript
const LoadingStates = {
  videoLoading: <VideoSkeleton />,
  quizLoading: <QuizSkeleton />,
  progressLoading: <ProgressSkeleton />,
  pageTransition: <FadeTransition />,
  pullToRefresh: <RefreshIndicator />
};

// Smooth Transitions
const pageTransitionConfig = {
  duration: 300,
  easing: Easing.out(Easing.poly(4)),
  useNativeDriver: true
};
```

### 3. Error States and Recovery
```typescript
const ErrorHandling = {
  noInternet: {
    screen: 'OfflineScreen',
    actions: ['Retry', 'View Cached Content']
  },
  videoLoadError: {
    screen: 'VideoErrorScreen',
    actions: ['Retry', 'Skip Video', 'Report Issue']
  },
  quizError: {
    screen: 'QuizErrorScreen', 
    actions: ['Retry Quiz', 'Continue Learning']
  },
  serverError: {
    screen: 'ServerErrorScreen',
    actions: ['Retry', 'Contact Support']
  }
};
```

## Accessibility and Inclusive Design

### Accessibility Features
```typescript
const AccessibilityFeatures = {
  screenReader: {
    support: 'Full VoiceOver/TalkBack support',
    videoDescriptions: 'Audio descriptions for visual content',
    quizReadAloud: 'Question and answer reading'
  },
  
  visualAccessibility: {
    fontSize: 'Adjustable text sizes',
    contrast: 'High contrast mode',
    colorBlind: 'Color-blind friendly indicators',
    reduceMotion: 'Reduced animation option'
  },
  
  motorAccessibility: {
    largeTargets: 'Minimum 44pt touch targets',
    voiceControl: 'Voice command support',
    switchControl: 'External switch support'
  },
  
  cognitiveAccessibility: {
    simpleNavigation: 'Clear, consistent navigation',
    progressIndicators: 'Clear progress feedback',
    timeExtensions: 'Extended time for quizzes'
  }
};
```

### Internationalization Support
```typescript
const i18nConfig = {
  supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
  rtlSupport: true,
  dateTimeLocalization: true,
  numberFormatting: true,
  currencyFormatting: true
};
```

## Performance Optimization

### Navigation Performance
```typescript
const PerformanceOptimizations = {
  lazyLoading: 'Load screens on demand',
  preloading: 'Preload next video content',
  caching: 'Cache frequently accessed screens',
  memoryManagement: 'Automatic cleanup of unused screens',
  nativeOptimization: 'Use native navigation where possible'
};

// Screen-specific optimizations
const screenOptimizations = {
  HomeFeed: 'Virtualized video list, preload next 2 videos',
  Progress: 'Memoized statistics, lazy chart rendering',
  Social: 'Paginated friend lists, cached avatars',
  Quiz: 'Preload questions, optimistic UI updates'
};
```

This user flow design creates an intuitive, engaging learning experience that guides users seamlessly through educational content while maintaining high performance and accessibility standards.