import { useState, useEffect, useCallback, useRef } from 'react';
import { testAPI } from '@/api/testAPI.js';
import { calculateWPM, calculateAccuracy } from '@/utils/typingUtils.js';
import { toast } from 'react-toastify';

export const useTypingTest = () => {
  const [testState, setTestState] = useState('idle'); // idle, loading, active, finished
  const [testText, setTestText] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(new Set());
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const intervalRef = useRef(null);
  const inputRef = useRef(null);

  // Start new test
  const startTest = useCallback(async (options = {}) => {
    try {
      setTestState('loading');
      setIsLoading(true);
      
      const { language = 'en', difficulty = 'medium', duration: testDuration = 60 } = options;
      
      const response = await testAPI.getText({ language, difficulty, duration: testDuration });
      
      if (response.success) {
        const { text, sessionToken: token, durationSeconds } = response.data;
        
        setTestText(text.content);
        setSessionToken(token);
        setDuration(durationSeconds);
        setTimeLeft(durationSeconds);
        setUserInput('');
        setCurrentIndex(0);
        setErrors(new Set());
        setStartTime(null);
        setResults(null);
        
        setTestState('active');
        
        // Focus input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Failed to start test:', error);
      toast.error('Failed to load test text');
      setTestState('idle');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset test
  const resetTest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTestState('idle');
    setTestText('');
    setSessionToken('');
    setTimeLeft(duration);
    setUserInput('');
    setCurrentIndex(0);
    setErrors(new Set());
    setStartTime(null);
    setResults(null);
  }, [duration]);

  // Handle timer
  useEffect(() => {
    if (testState === 'active' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [testState, timeLeft]);

  // Handle input
  const handleInput = useCallback((value) => {
    if (testState !== 'active') return;

    const newInput = value;
    const newErrors = new Set(errors);
    
    // Track errors
    for (let i = 0; i < newInput.length; i++) {
      if (newInput[i] !== testText[i]) {
        newErrors.add(i);
      } else {
        newErrors.delete(i);
      }
    }

    setUserInput(newInput);
    setCurrentIndex(newInput.length);
    setErrors(newErrors);

    // Start timer on first character
    if (!startTime && newInput.length === 1) {
      setStartTime(Date.now());
    }
  }, [testState, testText, errors, startTime]);

  // Finish test
  const finishTest = useCallback(async () => {
    if (testState !== 'active') return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTestState('finished');

    // Calculate results
    const endTime = Date.now();
    const actualDuration = startTime ? (endTime - startTime) / 1000 : duration;
    const actualTimeLeft = startTime ? Math.max(0, duration - actualDuration) : 0;

    const correctChars = userInput.split('').filter((char, index) => char === testText[index]).length;
    const incorrectChars = errors.size;
    const totalChars = userInput.length;
    const accuracy = calculateAccuracy(correctChars, incorrectChars);
    const wpm = calculateWPM(correctChars, actualDuration);
    const rawWpm = calculateWPM(totalChars, actualDuration);

    const testResults = {
      wpm: Math.round(wpm),
      rawWpm: Math.round(rawWpm),
      accuracy: Math.round(accuracy * 100) / 100,
      correctChars,
      incorrectChars,
      totalChars,
      durationSeconds: Math.round(actualDuration),
      textSnippet: testText.slice(0, 50) + (testText.length > 50 ? '...' : '')
    };

    setResults(testResults);

    // Submit results
    try {
      const response = await testAPI.submitResult({
        sessionToken,
        ...testResults
      });

      if (response.success) {
        const { isNewRecord, isGuest } = response.data;
        
        if (isNewRecord) {
          toast.success('🎉 New personal record!');
        } else if (isGuest) {
          toast.info('Test completed! Create an account to save your results and view the leaderboard.');
        } else {
          toast.success('Test completed successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to submit results:', error);
      toast.error('Failed to save test results');
    }
  }, [testState, startTime, duration, userInput, testText, errors, sessionToken]);

  // Get current character status
  const getCharacterStatus = useCallback((index) => {
    if (index < userInput.length) {
      return userInput[index] === testText[index] ? 'correct' : 'incorrect';
    }
    if (index === currentIndex) {
      return 'current';
    }
    return 'untyped';
  }, [userInput, testText, currentIndex]);

  // Calculate live stats
  const liveStats = useCallback(() => {
    if (!startTime) return { wpm: 0, accuracy: 100 };

    const currentTime = (Date.now() - startTime) / 1000;
    const correctChars = userInput.split('').filter((char, index) => char === testText[index]).length;
    const incorrectChars = errors.size;
    const totalChars = userInput.length;

    const wpm = calculateWPM(correctChars, currentTime);
    const accuracy = calculateAccuracy(correctChars, incorrectChars);

    return {
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy * 100) / 100,
      correctChars,
      incorrectChars,
      totalChars
    };
  }, [startTime, userInput, testText, errors]);

  return {
    testState,
    testText,
    sessionToken,
    duration,
    timeLeft,
    userInput,
    currentIndex,
    errors,
    startTime,
    results,
    isLoading,
    inputRef,
    startTest,
    resetTest,
    handleInput,
    finishTest,
    getCharacterStatus,
    liveStats
  };
};
