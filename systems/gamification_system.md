# Gamification System: Points, Streaks, and Achievements

## Gamification Philosophy

### Core Principles
- **Intrinsic Motivation**: Enhance natural curiosity and mastery drive
- **Progress Visibility**: Clear feedback on learning advancement
- **Social Connection**: Healthy competition and collaboration
- **Meaningful Rewards**: Recognition tied to actual learning outcomes
- **Balanced Challenge**: Maintain flow state between boredom and frustration

## Experience Points (XP) System

### XP Categories and Values

#### Learning Activities
```typescript
enum XPActivity {
  VIDEO_WATCHED = 10,           // Complete a video
  VIDEO_REWATCHED = 5,          // Rewatch for reinforcement
  QUIZ_QUESTION_CORRECT = 5,    // Each correct answer
  QUIZ_PERFECT_SCORE = 25,      // 100% on quiz
  QUIZ_FIRST_ATTEMPT = 10,      // Bonus for first try success
  TOPIC_COMPLETED = 50,         // Complete all videos in a topic
  SUBJECT_MILESTONE = 100,      // 25%, 50%, 75%, 100% subject completion
}

enum XPBonusMultipliers {
  STREAK_MULTIPLIER = 1.2,      // 20% bonus during active streak
  DIFFICULTY_HARD = 1.5,        // 50% bonus for hard content
  SPEED_BONUS = 1.3,            // 30% bonus for quick correct answers
  CONSISTENCY_BONUS = 1.1,      // 10% bonus for regular daily activity
}
```

#### Social and Engagement Activities
```typescript
enum SocialXP {
  DAILY_LOGIN = 5,              // Daily login bonus
  FRIEND_REFERRAL = 100,        // Successful friend invitation
  STUDY_GROUP_JOIN = 15,        // Participate in study group
  HELP_CLASSMATE = 20,          // Answer peer question
  CONTENT_SHARED = 10,          // Share educational content
  FEEDBACK_PROVIDED = 15,       // Rate/review content
}
```

### XP Calculation Engine
```typescript
interface XPCalculation {
  baseXP: number;
  multipliers: number[];
  bonuses: number[];
  totalXP: number;
  breakdown: string[];
}

class XPCalculator {
  static calculateVideoXP(
    userId: string,
    videoId: string,
    completionData: VideoCompletion
  ): XPCalculation {
    let baseXP = XPActivity.VIDEO_WATCHED;
    const multipliers: number[] = [];
    const bonuses: number[] = [];
    const breakdown: string[] = [];
    
    // Base points
    breakdown.push(`Video completion: +${baseXP} XP`);
    
    // Streak multiplier
    const userStreak = await getUserStreak(userId);
    if (userStreak >= 3) {
      multipliers.push(XPBonusMultipliers.STREAK_MULTIPLIER);
      breakdown.push(`${userStreak}-day streak: +20% bonus`);
    }
    
    // Difficulty bonus
    const videoDifficulty = await getVideoDifficulty(videoId);
    if (videoDifficulty === 'hard') {
      multipliers.push(XPBonusMultipliers.DIFFICULTY_HARD);
      breakdown.push(`Hard difficulty: +50% bonus`);
    }
    
    // First watch bonus
    if (!completionData.previouslyWatched) {
      bonuses.push(10);
      breakdown.push(`First watch: +10 XP bonus`);
    }
    
    // Calculate total
    const multiplier = multipliers.reduce((acc, mult) => acc * mult, 1);
    const bonus = bonuses.reduce((acc, b) => acc + b, 0);
    const totalXP = Math.round((baseXP * multiplier) + bonus);
    
    return {
      baseXP,
      multipliers,
      bonuses,
      totalXP,
      breakdown
    };
  }
  
  static calculateQuizXP(
    userId: string,
    quizAttempt: QuizAttempt
  ): XPCalculation {
    const { correct_answers, total_questions, duration_seconds } = quizAttempt;
    
    let baseXP = correct_answers * XPActivity.QUIZ_QUESTION_CORRECT;
    const breakdown: string[] = [`${correct_answers} correct answers: +${baseXP} XP`];
    
    // Perfect score bonus
    if (correct_answers === total_questions) {
      baseXP += XPActivity.QUIZ_PERFECT_SCORE;
      breakdown.push(`Perfect score: +${XPActivity.QUIZ_PERFECT_SCORE} XP`);
    }
    
    // Speed bonus (if completed quickly with high accuracy)
    const averageTimePerQuestion = duration_seconds / total_questions;
    const accuracy = correct_answers / total_questions;
    
    if (averageTimePerQuestion <= 20 && accuracy >= 0.8) {
      const speedBonus = Math.round(baseXP * (XPBonusMultipliers.SPEED_BONUS - 1));
      baseXP += speedBonus;
      breakdown.push(`Speed bonus: +${speedBonus} XP`);
    }
    
    return {
      baseXP,
      multipliers: [],
      bonuses: [],
      totalXP: baseXP,
      breakdown
    };
  }
}
```

## Level System

### Level Progression
```typescript
interface UserLevel {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  xpForCurrentLevel: number;
  progressToNext: number; // 0-1
  title: string;
  perks: string[];
}

class LevelSystem {
  // Progressive XP requirements (exponential growth)
  static getXPRequiredForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }
  
  static getLevelTitle(level: number): string {
    const titles = [
      { min: 1, max: 5, title: "Knowledge Seeker" },
      { min: 6, max: 10, title: "Curious Learner" },
      { min: 11, max: 20, title: "Dedicated Student" },
      { min: 21, max: 35, title: "Scholar" },
      { min: 36, max: 50, title: "Subject Expert" },
      { min: 51, max: 75, title: "Master Learner" },
      { min: 76, max: 100, title: "Academic Legend" }
    ];
    
    return titles.find(t => level >= t.min && level <= t.max)?.title || "Learning Prodigy";
  }
  
  static getLevelPerks(level: number): string[] {
    const perks: string[] = [];
    
    if (level >= 5) perks.push("Unlock video bookmarks");
    if (level >= 10) perks.push("Access to study groups");
    if (level >= 15) perks.push("Custom profile themes");
    if (level >= 20) perks.push("Priority customer support");
    if (level >= 25) perks.push("Beta feature access");
    if (level >= 30) perks.push("Mentor badge eligibility");
    if (level >= 50) perks.push("Create custom study plans");
    
    return perks;
  }
  
  static calculateUserLevel(totalXP: number): UserLevel {
    let level = 1;
    let xpUsed = 0;
    
    // Find current level
    while (true) {
      const xpForNextLevel = this.getXPRequiredForLevel(level + 1);
      if (totalXP < xpUsed + xpForNextLevel) break;
      
      xpUsed += xpForNextLevel;
      level++;
    }
    
    const xpForCurrentLevel = this.getXPRequiredForLevel(level);
    const xpForNextLevel = this.getXPRequiredForLevel(level + 1);
    const currentXP = totalXP - xpUsed;
    const progressToNext = xpForNextLevel > 0 ? currentXP / xpForNextLevel : 1;
    
    return {
      level,
      currentXP,
      xpForNextLevel,
      xpForCurrentLevel,
      progressToNext,
      title: this.getLevelTitle(level),
      perks: this.getLevelPerks(level)
    };
  }
}
```

## Streak System

### Daily Learning Streaks
```typescript
interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakFreezes: number; // Available freeze tokens
  milestones: StreakMilestone[];
}

interface StreakMilestone {
  days: number;
  reward: {
    xp: number;
    badge?: string;
    specialUnlock?: string;
  };
  achieved: boolean;
  achievedDate?: Date;
}

class StreakManager {
  private static readonly STREAK_MILESTONES: StreakMilestone[] = [
    { days: 3, reward: { xp: 50, badge: "Getting Started" }, achieved: false },
    { days: 7, reward: { xp: 100, badge: "Week Warrior" }, achieved: false },
    { days: 14, reward: { xp: 200, badge: "Two-Week Champion" }, achieved: false },
    { days: 30, reward: { xp: 500, badge: "Monthly Master", specialUnlock: "Custom themes" }, achieved: false },
    { days: 50, reward: { xp: 1000, badge: "Dedication Dynamo" }, achieved: false },
    { days: 100, reward: { xp: 2500, badge: "Century Scholar", specialUnlock: "Mentor status" }, achieved: false },
    { days: 365, reward: { xp: 10000, badge: "Year-Long Legend", specialUnlock: "Hall of Fame" }, achieved: false }
  ];
  
  static async updateStreak(userId: string, activityDate: Date): Promise<UserStreak> {
    const existingStreak = await this.getUserStreak(userId);
    const today = new Date(activityDate);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = existingStreak.currentStreak;
    
    if (!existingStreak.lastActivityDate) {
      // First activity
      newStreak = 1;
    } else {
      const lastActivity = new Date(existingStreak.lastActivityDate);
      const daysDifference = this.getDaysDifference(lastActivity, today);
      
      if (daysDifference === 1) {
        // Consecutive day - extend streak
        newStreak = existingStreak.currentStreak + 1;
      } else if (daysDifference === 0) {
        // Same day - no change
        newStreak = existingStreak.currentStreak;
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    }
    
    const updatedStreak: UserStreak = {
      ...existingStreak,
      currentStreak: newStreak,
      longestStreak: Math.max(existingStreak.longestStreak, newStreak),
      lastActivityDate: today
    };
    
    // Check for milestone achievements
    await this.checkStreakMilestones(updatedStreak);
    
    return updatedStreak;
  }
  
  static async useStreakFreeze(userId: string): Promise<boolean> {
    const streak = await this.getUserStreak(userId);
    
    if (streak.streakFreezes > 0) {
      await db.userStreaks.update({
        where: { userId },
        data: {
          streakFreezes: streak.streakFreezes - 1,
          lastActivityDate: new Date() // Extend the streak
        }
      });
      return true;
    }
    
    return false;
  }
  
  private static async checkStreakMilestones(streak: UserStreak): Promise<void> {
    const newMilestones = this.STREAK_MILESTONES.filter(
      milestone => 
        streak.currentStreak >= milestone.days && 
        !streak.milestones.some(m => m.days === milestone.days && m.achieved)
    );
    
    for (const milestone of newMilestones) {
      await this.awardStreakMilestone(streak.userId, milestone);
    }
  }
}
```

## Achievement System

### Achievement Categories
```typescript
enum AchievementCategory {
  LEARNING_PROGRESS = "Learning Progress",
  CONSISTENCY = "Consistency", 
  MASTERY = "Subject Mastery",
  SOCIAL = "Social Learning",
  EXPLORATION = "Content Exploration",
  SPEED = "Quick Learning",
  PERFECTIONIST = "High Performance"
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  requirements: AchievementRequirement[];
  rewards: {
    xp: number;
    badge: string;
    specialUnlock?: string;
  };
  hidden: boolean; // Secret achievements
}

interface AchievementRequirement {
  type: 'video_count' | 'quiz_score' | 'streak_days' | 'subject_completion' | 'time_spent' | 'social_interaction';
  value: number;
  subject?: string;
  timeframe?: string; // 'daily', 'weekly', 'monthly', 'all_time'
}
```

### Achievement Definitions
```typescript
const ACHIEVEMENTS: Achievement[] = [
  // Learning Progress
  {
    id: 'first_video',
    title: 'First Steps',
    description: 'Watch your first educational video',
    category: AchievementCategory.LEARNING_PROGRESS,
    icon: '🎬',
    rarity: 'common',
    requirements: [{ type: 'video_count', value: 1 }],
    rewards: { xp: 25, badge: 'Beginner' },
    hidden: false
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Watch 100 educational videos',
    category: AchievementCategory.LEARNING_PROGRESS,
    icon: '💯',
    rarity: 'uncommon',
    requirements: [{ type: 'video_count', value: 100 }],
    rewards: { xp: 500, badge: 'Century Scholar' },
    hidden: false
  },
  
  // Mastery
  {
    id: 'subject_master_math',
    title: 'Mathematics Master',
    description: 'Complete 90% of available Math content',
    category: AchievementCategory.MASTERY,
    icon: '🧮',
    rarity: 'rare',
    requirements: [{ type: 'subject_completion', value: 90, subject: 'Mathematics' }],
    rewards: { xp: 1000, badge: 'Math Master', specialUnlock: 'Advanced Math content' },
    hidden: false
  },
  
  // Perfectionist
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Score 100% on all quizzes for 7 consecutive days',
    category: AchievementCategory.PERFECTIONIST,
    icon: '⭐',
    rarity: 'legendary',
    requirements: [
      { type: 'quiz_score', value: 100, timeframe: 'daily' },
      { type: 'streak_days', value: 7 }
    ],
    rewards: { xp: 2000, badge: 'Perfectionist', specialUnlock: 'Golden profile theme' },
    hidden: true
  },
  
  // Speed Learning
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Answer 50 quiz questions correctly in under 15 seconds each',
    category: AchievementCategory.SPEED,
    icon: '⚡',
    rarity: 'rare',
    requirements: [{ type: 'quiz_speed', value: 50 }], // Custom requirement type
    rewards: { xp: 750, badge: 'Lightning Learner' },
    hidden: false
  },
  
  // Social
  {
    id: 'study_buddy',
    title: 'Study Buddy',
    description: 'Help 10 classmates by answering their questions',
    category: AchievementCategory.SOCIAL,
    icon: '🤝',
    rarity: 'uncommon',
    requirements: [{ type: 'social_interaction', value: 10 }],
    rewards: { xp: 300, badge: 'Helpful Peer' },
    hidden: false
  }
];
```

### Achievement Engine
```typescript
class AchievementEngine {
  static async checkAchievements(userId: string, activityType: string, activityData: any): Promise<Achievement[]> {
    const userStats = await this.getUserStats(userId);
    const unlockedAchievements: Achievement[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      const isAlreadyUnlocked = await this.isAchievementUnlocked(userId, achievement.id);
      if (isAlreadyUnlocked) continue;
      
      const meetsRequirements = this.checkRequirements(achievement.requirements, userStats, activityData);
      
      if (meetsRequirements) {
        await this.unlockAchievement(userId, achievement);
        unlockedAchievements.push(achievement);
      }
    }
    
    return unlockedAchievements;
  }
  
  private static checkRequirements(
    requirements: AchievementRequirement[], 
    userStats: UserStats, 
    activityData: any
  ): boolean {
    return requirements.every(req => {
      switch (req.type) {
        case 'video_count':
          return userStats.totalVideosWatched >= req.value;
        
        case 'quiz_score':
          if (req.timeframe === 'daily') {
            return userStats.dailyQuizAverage >= req.value;
          }
          return userStats.overallQuizAverage >= req.value;
        
        case 'streak_days':
          return userStats.currentStreak >= req.value;
        
        case 'subject_completion':
          const subjectProgress = userStats.subjectProgress[req.subject!];
          return subjectProgress >= req.value;
        
        case 'time_spent':
          return userStats.totalStudyTimeMinutes >= req.value;
        
        case 'social_interaction':
          return userStats.helpfulAnswersGiven >= req.value;
        
        default:
          return false;
      }
    });
  }
  
  private static async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    // Award XP
    await XPManager.addXP(userId, achievement.rewards.xp, `Achievement: ${achievement.title}`);
    
    // Save achievement record
    await db.userAchievements.create({
      data: {
        userId,
        achievementId: achievement.id,
        unlockedAt: new Date(),
        notificationSent: false
      }
    });
    
    // Trigger celebration notification
    await NotificationManager.sendAchievementNotification(userId, achievement);
  }
}
```

## League and Competition System

### League Structure
```typescript
enum League {
  BRONZE = "Bronze",
  SILVER = "Silver", 
  GOLD = "Gold",
  PLATINUM = "Platinum",
  DIAMOND = "Diamond",
  LEGENDARY = "Legendary"
}

interface LeagueUser {
  userId: string;
  username: string;
  league: League;
  weeklyXP: number;
  rank: number;
  profilePicture?: string;
}

interface WeeklyLeague {
  id: string;
  league: League;
  startDate: Date;
  endDate: Date;
  participants: LeagueUser[];
  promotionSpots: number; // Top X users get promoted
  relegationSpots: number; // Bottom X users get relegated
}

class LeagueManager {
  private static readonly LEAGUE_CONFIG = {
    [League.BRONZE]: { size: 50, promotions: 10, relegations: 0 },
    [League.SILVER]: { size: 50, promotions: 10, relegations: 10 },
    [League.GOLD]: { size: 30, promotions: 8, relegations: 8 },
    [League.PLATINUM]: { size: 30, promotions: 5, relegations: 5 },
    [League.DIAMOND]: { size: 20, promotions: 3, relegations: 5 },
    [League.LEGENDARY]: { size: 20, promotions: 0, relegations: 3 }
  };
  
  static async assignUserToLeague(userId: string): Promise<League> {
    const userStats = await getUserStats(userId);
    const userLevel = LevelSystem.calculateUserLevel(userStats.totalXP);
    
    // Initial league assignment based on level
    if (userLevel.level >= 50) return League.LEGENDARY;
    if (userLevel.level >= 35) return League.DIAMOND;
    if (userLevel.level >= 25) return League.PLATINUM;
    if (userLevel.level >= 15) return League.GOLD;
    if (userLevel.level >= 5) return League.SILVER;
    return League.BRONZE;
  }
  
  static async processWeeklyLeagueResults(): Promise<void> {
    const activeLeagues = await this.getActiveWeeklyLeagues();
    
    for (const league of activeLeagues) {
      const sortedUsers = league.participants.sort((a, b) => b.weeklyXP - a.weeklyXP);
      const config = this.LEAGUE_CONFIG[league.league];
      
      // Process promotions
      const toPromote = sortedUsers.slice(0, config.promotions);
      for (const user of toPromote) {
        await this.promoteUser(user.userId, league.league);
      }
      
      // Process relegations
      if (config.relegations > 0) {
        const toRelegate = sortedUsers.slice(-config.relegations);
        for (const user of toRelegate) {
          await this.relegateUser(user.userId, league.league);
        }
      }
      
      // Award league completion rewards
      await this.awardLeagueRewards(league, sortedUsers);
    }
    
    // Start new week
    await this.startNewLeagueWeek();
  }
  
  private static async awardLeagueRewards(league: WeeklyLeague, rankings: LeagueUser[]): Promise<void> {
    const rewards = {
      1: { xp: 500, badge: 'Weekly Champion' },
      2: { xp: 300, badge: 'Runner-up' },
      3: { xp: 200, badge: 'Third Place' }
    };
    
    rankings.slice(0, 3).forEach(async (user, index) => {
      const reward = rewards[index + 1 as keyof typeof rewards];
      if (reward) {
        await XPManager.addXP(user.userId, reward.xp, `League ${index + 1} place`);
        await BadgeManager.awardBadge(user.userId, reward.badge);
      }
    });
  }
}
```

## Database Schema

### Gamification Tables
```sql
-- User XP and levels
CREATE TABLE user_xp (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    weekly_xp INTEGER DEFAULT 0,
    monthly_xp INTEGER DEFAULT 0,
    last_xp_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_user_xp_level (current_level),
    INDEX idx_user_xp_weekly (weekly_xp)
);

-- Streaks
CREATE TABLE user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_freezes INTEGER DEFAULT 3, -- Monthly allowance
    streak_freeze_reset_date DATE,
    
    INDEX idx_streaks_current (current_streak),
    INDEX idx_streaks_activity (last_activity_date)
);

-- Achievements
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    rarity achievement_rarity NOT NULL,
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    hidden BOOLEAN DEFAULT FALSE,
    
    INDEX idx_achievements_category (category),
    INDEX idx_achievements_rarity (rarity)
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_sent BOOLEAN DEFAULT FALSE,
    
    UNIQUE(user_id, achievement_id),
    INDEX idx_user_achievements_user (user_id),
    INDEX idx_user_achievements_date (unlocked_at)
);

-- Leagues
CREATE TABLE weekly_leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_type league_type NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    status league_status DEFAULT 'active',
    
    INDEX idx_leagues_dates (week_start_date, week_end_date),
    INDEX idx_leagues_type (league_type)
);

CREATE TABLE league_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID NOT NULL REFERENCES weekly_leagues(id),
    user_id UUID NOT NULL REFERENCES users(id),
    weekly_xp INTEGER DEFAULT 0,
    final_rank INTEGER,
    promotion_earned BOOLEAN DEFAULT FALSE,
    relegation_suffered BOOLEAN DEFAULT FALSE,
    
    UNIQUE(league_id, user_id),
    INDEX idx_participants_league (league_id),
    INDEX idx_participants_xp (weekly_xp)
);

-- XP Transaction Log
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    xp_amount INTEGER NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_id UUID, -- Reference to video, quiz, etc.
    description TEXT,
    multipliers JSONB, -- Breakdown of multipliers applied
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_xp_transactions_user (user_id),
    INDEX idx_xp_transactions_date (created_at),
    INDEX idx_xp_transactions_activity (activity_type)
);
```

## React Native Gamification Components

### Level Progress Component
```typescript
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LevelProgressProps {
  userLevel: UserLevel;
  animated?: boolean;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ userLevel, animated = true }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: userLevel.progressToNext,
        duration: 1000,
        useNativeDriver: false
      }).start();
    } else {
      progressAnim.setValue(userLevel.progressToNext);
    }
  }, [userLevel.progressToNext]);
  
  return (
    <View style={styles.container}>
      <View style={styles.levelHeader}>
        <Text style={styles.levelNumber}>Level {userLevel.level}</Text>
        <Text style={styles.levelTitle}>{userLevel.title}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {userLevel.currentXP} / {userLevel.xpForNextLevel} XP
        </Text>
      </View>
      
      {userLevel.perks.length > 0 && (
        <Text style={styles.perksText}>
          Next perk: {userLevel.perks[0]}
        </Text>
      )}
    </View>
  );
};
```

### Achievement Notification
```typescript
interface AchievementPopupProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievement,
  visible,
  onClose
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Entry animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true })
          ])
        )
      ]).start();
      
      // Auto-close after 4 seconds
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      glowAnim.stopAnimation();
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.achievementCard,
            {
              transform: [{ scale: scaleAnim }],
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
              })
            }
          ]}
        >
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
          <Text style={styles.xpReward}>+{achievement.rewards.xp} XP</Text>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
```

This comprehensive gamification system creates engaging progression mechanics that motivate continued learning while providing meaningful recognition for educational achievements.