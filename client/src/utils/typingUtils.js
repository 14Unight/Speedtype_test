// Calculate Words Per Minute
export const calculateWPM = (correctChars, timeInSeconds) => {
  if (timeInSeconds <= 0) return 0;
  
  // Standard word length is 5 characters
  const words = correctChars / 5;
  const minutes = timeInSeconds / 60;
  
  return words / minutes;
};

// Calculate accuracy percentage
export const calculateAccuracy = (correctChars, incorrectChars) => {
  const totalChars = correctChars + incorrectChars;
  if (totalChars === 0) return 100;
  
  return (correctChars / totalChars) * 100;
};

// Calculate raw WPM (including errors)
export const calculateRawWPM = (totalChars, timeInSeconds) => {
  if (timeInSeconds <= 0) return 0;
  
  const words = totalChars / 5;
  const minutes = timeInSeconds / 60;
  
  return words / minutes;
};

// Get typing speed category
export const getSpeedCategory = (wpm) => {
  if (wpm < 20) return { label: 'Beginner', color: '#ef4444' };
  if (wpm < 30) return { label: 'Slow', color: '#f97316' };
  if (wpm < 40) return { label: 'Average', color: '#eab308' };
  if (wpm < 50) return { label: 'Good', color: '#22c55e' };
  if (wpm < 70) return { label: 'Fast', color: '#3b82f6' };
  if (wpm < 90) return { label: 'Excellent', color: '#8b5cf6' };
  return { label: 'Professional', color: '#ec4899' };
};

// Get accuracy category
export const getAccuracyCategory = (accuracy) => {
  if (accuracy >= 98) return { label: 'Perfect', color: '#22c55e' };
  if (accuracy >= 95) return { label: 'Excellent', color: '#3b82f6' };
  if (accuracy >= 90) return { label: 'Good', color: '#eab308' };
  if (accuracy >= 80) return { label: 'Fair', color: '#f97316' };
  return { label: 'Poor', color: '#ef4444' };
};

// Format time duration
export const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate typing consistency (variance in speed)
export const calculateConsistency = (wpmHistory) => {
  if (wpmHistory.length < 2) return 100;
  
  const mean = wpmHistory.reduce((sum, wpm) => sum + wpm, 0) / wpmHistory.length;
  const variance = wpmHistory.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / wpmHistory.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Consistency is inversely proportional to standard deviation
  const consistency = Math.max(0, 100 - (standardDeviation / mean) * 100);
  
  return Math.round(consistency);
};

// Generate typing test recommendations
export const getRecommendations = (wpm, accuracy, errors) => {
  const recommendations = [];
  
  if (wpm < 30) {
    recommendations.push('Focus on accuracy first, then gradually increase speed');
    recommendations.push('Practice with easier texts to build confidence');
  }
  
  if (accuracy < 90) {
    recommendations.push('Slow down and focus on hitting the correct keys');
    recommendations.push('Review finger placement and posture');
  }
  
  if (errors > 10) {
    recommendations.push('Take breaks to avoid fatigue');
    recommendations.push('Practice common error patterns');
  }
  
  if (wpm >= 50 && accuracy >= 95) {
    recommendations.push('Try harder texts to challenge yourself');
    recommendations.push('Focus on maintaining consistency');
  }
  
  return recommendations;
};

// Validate test result
export const validateTestResult = (result) => {
  const errors = [];
  
  if (result.wpm < 0 || result.wpm > 300) {
    errors.push('WPM must be between 0 and 300');
  }
  
  if (result.accuracy < 0 || result.accuracy > 100) {
    errors.push('Accuracy must be between 0 and 100');
  }
  
  if (result.correctChars < 0) {
    errors.push('Correct characters must be non-negative');
  }
  
  if (result.incorrectChars < 0) {
    errors.push('Incorrect characters must be non-negative');
  }
  
  if (result.totalChars !== result.correctChars + result.incorrectChars) {
    errors.push('Total characters must equal correct plus incorrect characters');
  }
  
  if (result.durationSeconds < 15 || result.durationSeconds > 120) {
    errors.push('Duration must be between 15 and 120 seconds');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
