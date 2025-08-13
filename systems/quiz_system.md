# Interactive Quiz and Assessment System

## System Overview

### Quiz Integration with Video Content
```
Video End → Quiz Trigger → Question Display → Answer Submission → 
Feedback → XP Rewards → Progress Update → Next Video/Topic
```

## Quiz Types and Formats

### 1. Instant Quizzes (MVP)

#### Multiple Choice Questions
```typescript
interface MultipleChoiceQuestion {
  id: string;
  videoId: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // seconds
  points: number;
  hints?: string[];
}

const sampleQuestion: MultipleChoiceQuestion = {
  id: 'q_calc_derivative_001',
  videoId: 'v_calc_basic_derivatives',
  question: 'What is the derivative of f(x) = 3x²?',
  options: [
    { id: 'a', text: '6x', isCorrect: true, explanation: 'Using the power rule: d/dx(ax^n) = n·ax^(n-1)' },
    { id: 'b', text: '3x', isCorrect: false, explanation: 'This would be the derivative of 3x²/2, not 3x²' },
    { id: 'c', text: '6x²', isCorrect: false, explanation: 'This doesn\'t apply the power rule correctly' },
    { id: 'd', text: '3', isCorrect: false, explanation: 'This would be the derivative of 3x, not 3x²' }
  ],
  difficulty: 'easy',
  timeLimit: 30,
  points: 10,
  hints: ['Remember the power rule: d/dx(x^n) = n·x^(n-1)', 'The coefficient stays in front']
};
```

### 2. Advanced Question Types (Phase 2)

#### True/False Questions
```typescript
interface TrueFalseQuestion {
  id: string;
  videoId: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
  commonMisconception?: string;
  points: number;
}
```

#### Fill-in-the-Blank
```typescript
interface FillInBlankQuestion {
  id: string;
  videoId: string;
  questionText: string;
  blanks: {
    id: string;
    acceptedAnswers: string[];
    caseSensitive: boolean;
    placeholder?: string;
  }[];
  explanation: string;
  points: number;
}
```

#### Drag and Drop
```typescript
interface DragDropQuestion {
  id: string;
  videoId: string;
  instruction: string;
  draggableItems: {
    id: string;
    content: string;
    correctDropZone: string;
  }[];
  dropZones: {
    id: string;
    label: string;
    maxItems: number;
  }[];
  points: number;
}
```

#### Image/Diagram Selection
```typescript
interface ImageSelectionQuestion {
  id: string;
  videoId: string;
  question: string;
  imageUrl: string;
  selectableAreas: {
    id: string;
    coordinates: { x: number; y: number; width: number; height: number; };
    isCorrect: boolean;
    feedback: string;
  }[];
  points: number;
}
```

## Quiz Generation System

### 1. AI-Powered Question Generation

#### Automated Quiz Creation
```typescript
interface QuizGenerationRequest {
  videoId: string;
  videoScript: string;
  keyLearningObjectives: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionTypes: QuestionType[];
}

const generateQuiz = async (request: QuizGenerationRequest): Promise<Quiz> => {
  const prompt = `
    Create ${request.questionCount} educational questions based on this video content:
    
    Video Script: "${request.videoScript}"
    Learning Objectives: ${request.keyLearningObjectives.join(', ')}
    Difficulty: ${request.difficulty}
    
    For each multiple choice question:
    1. Focus on key concepts from the video
    2. Create 4 options with only 1 correct answer
    3. Include plausible distractors based on common mistakes
    4. Provide clear explanations for correct answers
    5. Add brief explanations for why wrong answers are incorrect
    
    Format as JSON array.
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "You are an expert educational content creator specializing in creating effective quiz questions for college students."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });
  
  const questions = JSON.parse(response.choices[0].message.content);
  
  // Validate and process questions
  return {
    id: generateQuizId(),
    videoId: request.videoId,
    questions: await validateAndProcessQuestions(questions),
    metadata: {
      generatedAt: new Date(),
      difficulty: request.difficulty,
      estimatedDuration: questions.length * 30 // 30 seconds per question
    }
  };
};
```

### 2. Human-Created Questions (Quality Control)

#### Question Review Interface
```typescript
interface QuestionReview {
  questionId: string;
  reviewerId: string;
  status: 'approved' | 'rejected' | 'needs_revision';
  feedback: string;
  suggestedChanges?: {
    question?: string;
    options?: { id: string; text: string; }[];
    explanation?: string;
  };
  quality_score: number; // 1-10
}

const reviewQuestion = async (question: Question, review: QuestionReview) => {
  await db.questionReviews.create({
    data: {
      questionId: question.id,
      reviewerId: review.reviewerId,
      status: review.status,
      feedback: review.feedback,
      qualityScore: review.quality_score,
      createdAt: new Date()
    }
  });
  
  if (review.status === 'approved') {
    await publishQuestion(question.id);
  } else if (review.suggestedChanges) {
    await createQuestionRevision(question.id, review.suggestedChanges);
  }
};
```

## Database Schema

### Quiz and Question Tables
```sql
-- Quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES videos(id),
    title VARCHAR(255),
    description TEXT,
    question_count INTEGER NOT NULL,
    estimated_duration_seconds INTEGER,
    difficulty difficulty_level NOT NULL,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    creation_method quiz_creation_method NOT NULL, -- 'ai_generated' | 'human_created' | 'hybrid'
    version INTEGER DEFAULT 1,
    status quiz_status DEFAULT 'draft', -- 'draft' | 'review' | 'published' | 'archived'
    
    -- Analytics
    total_attempts INTEGER DEFAULT 0,
    average_score DECIMAL(5,4) DEFAULT 0,
    average_completion_time INTEGER, -- seconds
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_quizzes_video (video_id),
    INDEX idx_quizzes_difficulty (difficulty),
    INDEX idx_quizzes_status (status)
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL, -- 'multiple_choice' | 'true_false' | 'fill_blank' | 'drag_drop' | 'image_selection'
    
    -- Question data (JSON for flexibility)
    question_data JSONB NOT NULL, -- stores options, correct answers, etc.
    
    -- Metadata
    difficulty difficulty_level NOT NULL,
    points INTEGER DEFAULT 10,
    time_limit_seconds INTEGER,
    order_index INTEGER NOT NULL,
    
    -- Educational metadata
    learning_objective TEXT,
    explanation TEXT,
    hints TEXT[],
    tags TEXT[],
    
    -- Analytics
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    average_response_time INTEGER, -- seconds
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_questions_quiz (quiz_id),
    INDEX idx_questions_type (question_type),
    INDEX idx_questions_difficulty (difficulty)
);

-- User quiz attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_id UUID NOT NULL REFERENCES quizzes(id),
    
    -- Attempt data
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Scoring
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    earned_points INTEGER DEFAULT 0,
    percentage_score DECIMAL(5,4) DEFAULT 0,
    
    -- Status
    status attempt_status DEFAULT 'in_progress', -- 'in_progress' | 'completed' | 'abandoned'
    
    -- Metadata
    device_type VARCHAR(50),
    user_agent TEXT,
    
    INDEX idx_attempts_user (user_id),
    INDEX idx_attempts_quiz (quiz_id),
    INDEX idx_attempts_completed (completed_at) WHERE completed_at IS NOT NULL,
    UNIQUE(user_id, quiz_id) -- One attempt per user per quiz (MVP)
);

-- Individual question responses
CREATE TABLE question_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_attempt_id UUID NOT NULL REFERENCES quiz_attempts(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    
    -- Response data
    user_answer JSONB NOT NULL, -- flexible storage for different question types
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER DEFAULT 0,
    
    -- Timing data
    question_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE,
    response_time_seconds INTEGER,
    
    -- Engagement
    hints_used INTEGER DEFAULT 0,
    explanation_viewed BOOLEAN DEFAULT FALSE,
    
    INDEX idx_responses_attempt (quiz_attempt_id),
    INDEX idx_responses_question (question_id),
    UNIQUE(quiz_attempt_id, question_id)
);
```

## Quiz Flow and User Experience

### 1. Quiz Trigger System

#### Post-Video Quiz Flow
```typescript
interface QuizTrigger {
  videoId: string;
  userId: string;
  videoCompletionPercentage: number;
  trigger: 'video_end' | 'manual' | 'scheduled_review';
}

const handleQuizTrigger = async (trigger: QuizTrigger): Promise<QuizSession> => {
  // 1. Check if user should take quiz
  const shouldTakeQuiz = await shouldUserTakeQuiz(trigger.userId, trigger.videoId);
  if (!shouldTakeQuiz) {
    return { skip: true, reason: 'already_mastered' };
  }
  
  // 2. Get appropriate quiz for user
  const quiz = await getQuizForUser(trigger.videoId, trigger.userId);
  
  // 3. Create quiz session
  const session = await createQuizSession({
    userId: trigger.userId,
    quizId: quiz.id,
    trigger: trigger.trigger
  });
  
  return {
    sessionId: session.id,
    quiz: quiz,
    timeLimit: quiz.estimated_duration_seconds,
    pointsAvailable: quiz.questions.reduce((sum, q) => sum + q.points, 0)
  };
};
```

### 2. Adaptive Quiz Difficulty

#### Performance-Based Adjustment
```typescript
interface UserPerformanceMetrics {
  userId: string;
  subject: string;
  topic: string;
  averageScore: number;
  responseTime: number;
  consistency: number;
  learningVelocity: number;
}

const getAdaptiveQuizDifficulty = async (
  userId: string, 
  videoId: string
): Promise<'easy' | 'medium' | 'hard'> => {
  const userMetrics = await getUserPerformanceMetrics(userId);
  const videoMetadata = await getVideoMetadata(videoId);
  
  // Calculate difficulty based on multiple factors
  const factors = {
    userProficiency: userMetrics.averageScore, // 0-1
    topicFamiliarity: await getTopicFamiliarity(userId, videoMetadata.topic),
    prerequisiteCompletion: await getPrerequisiteCompletion(userId, videoId),
    learningPace: userMetrics.learningVelocity
  };
  
  const difficultyScore = 
    (factors.userProficiency * 0.4) +
    (factors.topicFamiliarity * 0.3) +
    (factors.prerequisiteCompletion * 0.2) +
    (factors.learningPace * 0.1);
  
  if (difficultyScore >= 0.8) return 'hard';
  if (difficultyScore >= 0.6) return 'medium';
  return 'easy';
};
```

### 3. Spaced Repetition System

#### Review Scheduling Algorithm
```typescript
interface SpacedRepetitionCard {
  questionId: string;
  userId: string;
  easinessFactor: number; // 1.3 to 2.5
  repetitionNumber: number;
  previousInterval: number; // days
  nextReviewDate: Date;
  lastReviewedAt: Date;
  consecutiveCorrect: number;
}

const calculateNextReviewDate = (
  card: SpacedRepetitionCard,
  responseQuality: number // 0-5 scale
): Date => {
  let { easinessFactor, repetitionNumber, previousInterval } = card;
  
  // Update easiness factor based on response quality
  easinessFactor = easinessFactor + (0.1 - (5 - responseQuality) * (0.08 + (5 - responseQuality) * 0.02));
  easinessFactor = Math.max(1.3, easinessFactor);
  
  let interval: number;
  
  if (responseQuality < 3) {
    // Reset if answer was too difficult
    repetitionNumber = 0;
    interval = 1;
  } else {
    if (repetitionNumber === 0) {
      interval = 1;
    } else if (repetitionNumber === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * easinessFactor);
    }
    repetitionNumber++;
  }
  
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  return nextReviewDate;
};
```

## React Native Quiz Components

### 1. Multiple Choice Question Component
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface MultipleChoiceProps {
  question: MultipleChoiceQuestion;
  onAnswer: (answerId: string, isCorrect: boolean) => void;
  timeLimit?: number;
}

const MultipleChoiceComponent: React.FC<MultipleChoiceProps> = ({
  question,
  onAnswer,
  timeLimit
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.fadeIn(fadeAnim, { duration: 300, useNativeDriver: true }).start();
  }, []);
  
  useEffect(() => {
    if (timeLimit && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLimit && timeRemaining === 0) {
      handleTimeout();
    }
  }, [timeRemaining]);
  
  const handleAnswerSelect = (optionId: string) => {
    if (selectedAnswer || showFeedback) return;
    
    setSelectedAnswer(optionId);
    setShowFeedback(true);
    
    const selectedOption = question.options.find(opt => opt.id === optionId);
    const isCorrect = selectedOption?.isCorrect || false;
    
    // Haptic feedback
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    // Delay before calling onAnswer to show feedback
    setTimeout(() => {
      onAnswer(optionId, isCorrect);
    }, 2000);
  };
  
  const handleTimeout = () => {
    setShowFeedback(true);
    onAnswer('', false);
  };
  
  const getOptionStyle = (option: QuestionOption) => {
    if (!showFeedback) return styles.option;
    
    if (option.id === selectedAnswer) {
      return option.isCorrect ? styles.optionCorrect : styles.optionIncorrect;
    } else if (option.isCorrect && selectedAnswer) {
      return styles.optionCorrect;
    }
    
    return styles.option;
  };
  
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {timeLimit && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeRemaining}s</Text>
          <View style={styles.timerBar}>
            <Animated.View 
              style={[
                styles.timerProgress, 
                { width: `${(timeRemaining / timeLimit) * 100}%` }
              ]} 
            />
          </View>
        </View>
      )}
      
      <Text style={styles.questionText}>{question.question}</Text>
      
      <View style={styles.optionsContainer}>
        {question.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={getOptionStyle(option)}
            onPress={() => handleAnswerSelect(option.id)}
            disabled={showFeedback}
          >
            <Text style={styles.optionText}>{option.text}</Text>
            {showFeedback && option.id === selectedAnswer && option.explanation && (
              <Text style={styles.explanationText}>{option.explanation}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {question.hints && question.hints.length > 0 && !showFeedback && (
        <TouchableOpacity style={styles.hintButton}>
          <Text style={styles.hintButtonText}>💡 Need a hint?</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};
```

### 2. Quiz Results Component
```typescript
interface QuizResultsProps {
  attempt: QuizAttempt;
  questions: Question[];
  onContinue: () => void;
  onRetry: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  attempt,
  questions,
  onContinue,
  onRetry
}) => {
  const [celebrationAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (attempt.percentage_score >= 0.8) {
      // Celebration animation for good scores
      Animated.sequence([
        Animated.timing(celebrationAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(celebrationAnim, { toValue: 0, duration: 500, useNativeDriver: true })
      ]).start();
    }
  }, []);
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };
  
  const getEncouragementMessage = (score: number) => {
    if (score >= 0.9) return "🎉 Excellent work!";
    if (score >= 0.8) return "👏 Great job!";
    if (score >= 0.6) return "👍 Good effort!";
    return "💪 Keep practicing!";
  };
  
  return (
    <View style={styles.resultsContainer}>
      <Animated.View style={[styles.scoreCircle, { transform: [{ scale: celebrationAnim }] }]}>
        <Text style={[styles.scoreText, { color: getScoreColor(attempt.percentage_score) }]}>
          {Math.round(attempt.percentage_score * 100)}%
        </Text>
      </Animated.View>
      
      <Text style={styles.encouragementText}>
        {getEncouragementMessage(attempt.percentage_score)}
      </Text>
      
      <View style={styles.statsContainer}>
        <StatItem 
          label="Correct Answers" 
          value={`${attempt.correct_answers}/${attempt.total_questions}`} 
        />
        <StatItem 
          label="Points Earned" 
          value={`${attempt.earned_points}/${attempt.total_points}`} 
        />
        <StatItem 
          label="Time Taken" 
          value={formatDuration(attempt.duration_seconds)} 
        />
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue Learning</Text>
        </TouchableOpacity>
        
        {attempt.percentage_score < 0.7 && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
```

## Quiz Analytics and Insights

### 1. Performance Analytics
```typescript
interface QuizAnalytics {
  questionId: string;
  totalAttempts: number;
  correctRate: number;
  averageResponseTime: number;
  commonWrongAnswers: { answer: string; frequency: number; }[];
  difficultyRating: number; // calculated based on performance
}

const generateQuizAnalytics = async (questionId: string): Promise<QuizAnalytics> => {
  const responses = await db.questionResponses.findMany({
    where: { questionId },
    include: { quizAttempt: { include: { user: true } } }
  });
  
  const totalAttempts = responses.length;
  const correctResponses = responses.filter(r => r.is_correct);
  const correctRate = totalAttempts > 0 ? correctResponses.length / totalAttempts : 0;
  
  const avgResponseTime = responses.reduce((sum, r) => 
    sum + (r.response_time_seconds || 0), 0) / totalAttempts;
  
  // Identify common wrong answers
  const wrongAnswers = responses
    .filter(r => !r.is_correct)
    .map(r => JSON.stringify(r.user_answer));
  
  const answerCounts = wrongAnswers.reduce((acc, answer) => {
    acc[answer] = (acc[answer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const commonWrongAnswers = Object.entries(answerCounts)
    .map(([answer, count]) => ({ answer, frequency: count / totalAttempts }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3);
  
  return {
    questionId,
    totalAttempts,
    correctRate,
    averageResponseTime: avgResponseTime,
    commonWrongAnswers,
    difficultyRating: 1 - correctRate // Inverse of success rate
  };
};
```

### 2. Personalized Learning Insights
```typescript
interface LearningInsights {
  userId: string;
  strengths: string[]; // Topics user excels at
  weaknesses: string[]; // Topics needing improvement
  studyRecommendations: {
    topic: string;
    videosToReview: string[];
    questionsToRetry: string[];
    estimatedStudyTime: number; // minutes
  }[];
  progressTrends: {
    subject: string;
    improvementRate: number;
    confidenceLevel: number;
  }[];
}

const generateLearningInsights = async (userId: string): Promise<LearningInsights> => {
  // Get user's quiz performance across all topics
  const attempts = await getUserQuizAttempts(userId, { limit: 100 });
  
  // Analyze performance by topic
  const topicPerformance = analyzeTopicPerformance(attempts);
  
  // Identify strengths (topics with consistently high scores)
  const strengths = topicPerformance
    .filter(tp => tp.averageScore >= 0.85 && tp.consistency >= 0.8)
    .map(tp => tp.topic);
  
  // Identify weaknesses (topics with low scores or declining performance)
  const weaknesses = topicPerformance
    .filter(tp => tp.averageScore < 0.7 || tp.trend < -0.1)
    .map(tp => tp.topic);
  
  // Generate study recommendations
  const studyRecommendations = await generateStudyRecommendations(userId, weaknesses);
  
  return {
    userId,
    strengths,
    weaknesses,
    studyRecommendations,
    progressTrends: topicPerformance.map(tp => ({
      subject: tp.subject,
      improvementRate: tp.trend,
      confidenceLevel: tp.consistency
    }))
  };
};
```

This comprehensive quiz system provides engaging, adaptive assessments that enhance learning while providing valuable analytics for both users and content creators.