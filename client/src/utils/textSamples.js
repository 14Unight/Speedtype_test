// Sample text data for offline mode or fallback
export const textSamples = {
  easy: [
    {
      id: 'easy-1',
      content: 'The quick brown fox jumps over the lazy dog. This pangram sentence contains every letter of the alphabet at least once, making it perfect for typing practice.',
      wordCount: 26,
      language: 'en'
    },
    {
      id: 'easy-2',
      content: 'Practice makes perfect when learning to type. Focus on accuracy first, then gradually increase your speed. Proper posture and finger placement are essential for long-term improvement.',
      wordCount: 29,
      language: 'en'
    },
    {
      id: 'easy-3',
      content: 'Learning to type is a valuable skill that will serve you well throughout your life. Take your time and be patient with yourself as you develop this important ability.',
      wordCount: 28,
      language: 'en'
    }
  ],
  medium: [
    {
      id: 'medium-1',
      content: 'Technology has revolutionized the way we communicate, work, and live. From smartphones to artificial intelligence, innovation continues to shape our daily experiences and transform how we interact with the world around us.',
      wordCount: 32,
      language: 'en'
    },
    {
      id: 'medium-2',
      content: 'Machine learning algorithms analyze vast amounts of data to identify patterns and make predictions. These systems power everything from recommendation engines to autonomous vehicles, demonstrating the incredible potential of artificial intelligence.',
      wordCount: 35,
      language: 'en'
    },
    {
      id: 'medium-3',
      content: 'The internet has connected billions of people across the globe, enabling instant communication and access to information. This unprecedented connectivity has transformed education, commerce, and social interactions in ways we are still discovering.',
      wordCount: 34,
      language: 'en'
    }
  ],
  hard: [
    {
      id: 'hard-1',
      content: 'Quantum computing represents a fundamental shift in computational power, leveraging quantum mechanical phenomena like superposition and entanglement to process information in ways that classical computers cannot match, potentially revolutionizing cryptography, drug discovery, and complex system optimization.',
      wordCount: 40,
      language: 'en'
    },
    {
      id: 'hard-2',
      content: 'Cryptocurrency and blockchain technology are transforming financial systems worldwide. Decentralized ledgers provide transparent, secure, and efficient ways to transfer value without intermediaries, challenging traditional banking paradigms and enabling new economic models.',
      wordCount: 37,
      language: 'en'
    },
    {
      id: 'hard-3',
      content: 'Neuroplasticity demonstrates the brain\'s remarkable ability to reorganize itself by forming new neural connections throughout life. This adaptability underlies learning, memory, and recovery from brain injuries, highlighting the importance of continuous mental stimulation and challenging cognitive activities.',
      wordCount: 39,
      language: 'en'
    }
  ]
};

// Get random text by difficulty
export const getRandomText = (difficulty = 'medium') => {
  const texts = textSamples[difficulty] || textSamples.medium;
  const randomIndex = Math.floor(Math.random() * texts.length);
  return texts[randomIndex];
};

// Get all texts by difficulty
export const getTextsByDifficulty = (difficulty) => {
  return textSamples[difficulty] || [];
};

// Get text by ID
export const getTextById = (id) => {
  for (const difficulty in textSamples) {
    const text = textSamples[difficulty].find(t => t.id === id);
    if (text) return text;
  }
  return null;
};

// Calculate word count
export const calculateWordCount = (text) => {
  return text.trim().split(/\s+/).length;
};

export default {
  textSamples,
  getRandomText,
  getTextsByDifficulty,
  getTextById,
  calculateWordCount
};
