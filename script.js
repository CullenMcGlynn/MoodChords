// Define all possible keys
const KEYS = ["A", "B", "C", "D", "E", "F", "G"];

// Common chord progressions (as roman numerals)
const COMMON_PROGRESSIONS = {
  major: [
    ["I", "iii", "vi", "V"],
    ["I", "IV", "V"],
    ["ii", "V", "I"],
    ["vi", "IV", "I", "V"],
    ["I", "vi", "IV", "V"],
    ["I", "V", "vi", "iii"],
    ["I", "IV", "vi", "V"],
    ["I", "V", "IV", "V"],
    ["I", "IV", "I", "V"],
  ],
  minor: [
    ["i", "VI", "VII"],
    ["i", "iv", "v"],
    ["i", "iv", "VII"],
    ["i", "VI", "III", "VII"],
    ["i", "iv", "i", "v"],
    ["VI", "VII", "i"],
    ["i", "III", "VII", "VI"],
  ]
};

// Mood-based chord progressions and mode preferences
const MOOD_PROGRESSIONS = {
  "Happy": {
    progressions: [
      ["I", "IV", "V"],
      ["I", "V", "vi", "IV"],
      ["I", "IV", "I", "V"],
      ["I", "vi", "IV", "V"],
    ],
    minorChance: 0.1, // 10% chance of minor key
    description: "Bright, uplifting progressions, mostly in major keys"
  },
  "Sad": {
    progressions: [
      ["i", "VI", "III", "VII"],
      ["i", "iv", "VII", "III"],
      ["i", "iv", "v"],
      ["vi", "IV", "I", "V"],
    ],
    minorChance: 0.8, // 80% chance of minor key
    description: "Melancholic progressions, mostly in minor keys"
  },
  "Nostalgic": {
    progressions: [
      ["IV", "I", "V", "vi"],
      ["vi", "IV", "I", "V"],
      ["I", "iii", "IV", "iv"],
      ["I", "vi", "ii", "V"],
      ["i", "VI", "III", "VII"],
    ],
    minorChance: 0.4, // 40% chance of minor key
    description: "Wistful progressions with emotional shifts"
  },
  "Epic": {
    progressions: [
      ["I", "V", "vi", "IV"],
      ["i", "VII", "VI", "V"],
      ["I", "V", "IV", "V"],
      ["i", "VI", "III", "VII"],
    ],
    minorChance: 0.5, // 50% chance of minor key
    description: "Powerful progressions that build tension and release"
  },
  "Chill": {
    progressions: [
      ["ii", "IV", "I"],
      ["I", "iii", "IV", "vi"],
      ["vi", "V", "IV", "I"],
      ["I", "IV", "ii", "V"],
      ["i", "iv", "VII", "VI"],
    ],
    minorChance: 0.3, // 30% chance of minor key
    description: "Relaxed progressions with smooth transitions"
  }
};

// App state
let state = {
  key: null, // No key selected by default
  isMinor: false,
  currentProgression: [],
  mood: "Nostalgic",
  actualKey: "C", // The actual key used for the progression
  keySelected: false // Track whether a key is selected
};

// DOM Elements
const keyButtons = document.querySelectorAll('.key-button');
const moodButtons = document.querySelectorAll('.mood-button');
const generateButton = document.getElementById('generate-button');
const chordGrid = document.querySelector('.chord-grid');
const keyDisplay = document.getElementById('key-display');

// Initialize the app
function init() {
  // Set up event listeners
  setupEventListeners();
  
  // Generate initial progression
  generateProgression();
}

// Set up event listeners
function setupEventListeners() {
  // Key buttons
  keyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.key;
      
      // Toggle selection - if the clicked key is already selected, deselect it
      if (state.key === key && state.keySelected) {
        state.key = null;
        state.keySelected = false;
        button.classList.remove('selected');
      } else {
        // Otherwise, select the new key and deselect others
        state.key = key;
        state.keySelected = true;
        state.actualKey = key; // Set the actual key to match the selected key
        
        keyButtons.forEach(btn => {
          if (btn.dataset.key === key) {
            btn.classList.add('selected');
          } else {
            btn.classList.remove('selected');
          }
        });
      }
      
      // Update the display
      renderChords();
      updateKeyDisplay();
    });
  });
  
  // Mood buttons
  moodButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mood = button.dataset.mood;
      
      // Toggle selection
      if (state.mood === mood) {
        state.mood = "";
        moodButtons.forEach(btn => btn.classList.remove('selected'));
      } else {
        state.mood = mood;
        moodButtons.forEach(btn => {
          if (btn.dataset.mood === mood) {
            btn.classList.add('selected');
          } else {
            btn.classList.remove('selected');
          }
        });
      }
      
      // Don't generate a new progression, just update the UI
      updateKeyDisplay();
    });
  });
  
  // Generate button
  generateButton.addEventListener('click', generateProgression);
}

// Helper function to check if two progressions are the same
function areProgressionsSame(prog1, prog2) {
  if (prog1.length !== prog2.length) return false;
  
  for (let i = 0; i < prog1.length; i++) {
    if (prog1[i] !== prog2[i]) return false;
  }
  
  return true;
}

// Helper function to check if two keys are the same
function areKeysSame(key1, key2, isMinor1, isMinor2) {
  return key1 === key2 && isMinor1 === isMinor2;
}

// Generate a new random progression
function generateProgression() {
  // Store the current progression and key for comparison
  const oldProgression = [...state.currentProgression];
  const oldKey = state.actualKey;
  const oldIsMinor = state.isMinor;
  
  let progressionPool;
  let moodConfig;
  
  // Determine if we should use a minor key based on the mood
  if (state.mood && MOOD_PROGRESSIONS[state.mood]) {
    moodConfig = MOOD_PROGRESSIONS[state.mood];
    progressionPool = moodConfig.progressions;
    
    // Determine if this progression should be in a minor key
    state.isMinor = Math.random() < moodConfig.minorChance;
  } else {
    // If no mood selected, use common progressions
    progressionPool = state.isMinor ? COMMON_PROGRESSIONS.minor : COMMON_PROGRESSIONS.major;
    
    // 50/50 chance of minor key if no mood selected
    state.isMinor = Math.random() < 0.5;
  }
  
  // Try to generate a different progression (up to 10 attempts)
  let attempts = 0;
  let newProgression;
  let newKey;
  
  do {
    const randomIndex = Math.floor(Math.random() * progressionPool.length);
    newProgression = progressionPool[randomIndex];
    
    // If no key is selected, choose a random key
    if (!state.keySelected) {
      const randomKeyIndex = Math.floor(Math.random() * KEYS.length);
      newKey = KEYS[randomKeyIndex];
    } else {
      // Otherwise use the selected key
      newKey = state.key;
    }
    
    attempts++;
    
    // If we've tried 10 times and still can't get a different progression,
    // force a different key if no specific key is selected
    if (attempts >= 10 && areProgressionsSame(oldProgression, newProgression)) {
      if (!state.keySelected) {
        // Force a different key
        let currentKeyIndex = KEYS.indexOf(newKey);
        newKey = KEYS[(currentKeyIndex + 1) % KEYS.length];
      }
      break;
    }
  } while (
    attempts < 10 && 
    areProgressionsSame(oldProgression, newProgression) && 
    areKeysSame(oldKey, newKey, oldIsMinor, state.isMinor)
  );
  
  // Update the state with the new progression and key
  state.currentProgression = newProgression;
  state.actualKey = newKey;
  
  renderProgression();
  updateKeyDisplay();
}

// Update the key display in the chord display section
function updateKeyDisplay() {
  keyDisplay.textContent = `${state.actualKey} ${state.isMinor ? 'minor' : 'major'}`;
}

// Render the current progression (full render including grid)
function renderProgression() {
  chordGrid.innerHTML = '';
  
  state.currentProgression.forEach(chord => {
    const chordElement = document.createElement('div');
    chordElement.className = 'chord';
    
    const chordNumeral = document.createElement('div');
    chordNumeral.className = 'chord-numeral';
    chordNumeral.textContent = chord;
    
    const chordName = document.createElement('div');
    chordName.className = 'chord-name';
    chordName.textContent = getRealChord(chord);
    
    chordElement.appendChild(chordNumeral);
    chordElement.appendChild(chordName);
    
    chordGrid.appendChild(chordElement);
  });
}

// Render just the chord names (when key changes but progression stays the same)
function renderChords() {
  const chordElements = chordGrid.querySelectorAll('.chord');
  
  if (chordElements.length === 0) {
    // If no chords exist yet, do a full render
    renderProgression();
    return;
  }
  
  // Update just the chord names based on the current key
  state.currentProgression.forEach((chord, index) => {
    if (index < chordElements.length) {
      const chordNameElement = chordElements[index].querySelector('.chord-name');
      if (chordNameElement) {
        chordNameElement.textContent = getRealChord(chord);
      }
    }
  });
}

// Convert roman numeral to actual chord based on key and mode
function getRealChord(romanNumeral) {
  // Use actualKey for chord calculation
  const keyIndex = KEYS.indexOf(state.actualKey);
  if (keyIndex < 0) return romanNumeral; // Handle invalid key
  
  // Define scale degrees for major and minor
  const majorScaleDegrees = [0, 2, 4, 5, 7, 9, 11];
  const minorScaleDegrees = [0, 2, 3, 5, 7, 8, 10];
  
  const scaleDegrees = state.isMinor ? minorScaleDegrees : majorScaleDegrees;
  
  let degree = 0;
  let chordType = "";
  
  // Parse the roman numeral
  if (romanNumeral === "I" || romanNumeral === "i") {
    degree = 0;
    chordType = romanNumeral === "I" ? "maj" : "min";
  } else if (romanNumeral === "II" || romanNumeral === "ii") {
    degree = 1;
    chordType = romanNumeral === "II" ? "maj" : "min";
  } else if (romanNumeral === "III" || romanNumeral === "iii") {
    degree = 2;
    chordType = romanNumeral === "III" ? "maj" : "min";
  } else if (romanNumeral === "IV" || romanNumeral === "iv") {
    degree = 3;
    chordType = romanNumeral === "IV" ? "maj" : "min";
  } else if (romanNumeral === "V" || romanNumeral === "v") {
    degree = 4;
    chordType = romanNumeral === "V" ? "maj" : "min";
  } else if (romanNumeral === "VI" || romanNumeral === "vi") {
    degree = 5;
    chordType = romanNumeral === "VI" ? "maj" : "min";
  } else if (romanNumeral === "VII" || romanNumeral === "vii") {
    degree = 6;
    chordType = romanNumeral === "VII" ? "maj" : "min";
  }
  
  // In minor keys, adjust the chord types
  if (state.isMinor) {
    if (romanNumeral === "i") chordType = "min";
    if (romanNumeral === "ii") chordType = "dim";
    if (romanNumeral === "III") chordType = "maj";
    if (romanNumeral === "iv") chordType = "min";
    if (romanNumeral === "v") chordType = "min";
    if (romanNumeral === "VI") chordType = "maj";
    if (romanNumeral === "VII") chordType = "maj";
  } else {
    if (romanNumeral === "I") chordType = "maj";
    if (romanNumeral === "ii") chordType = "min";
    if (romanNumeral === "iii") chordType = "min";
    if (romanNumeral === "IV") chordType = "maj";
    if (romanNumeral === "V") chordType = "maj";
    if (romanNumeral === "vi") chordType = "min";
    if (romanNumeral === "vii") chordType = "dim";
  }
  
  // Calculate the chord root note based on the key and scale degree
  let noteIndex;
  if (state.actualKey === "C") {
    const notes = ["C", "D", "E", "F", "G", "A", "B"];
    noteIndex = degree % 7;
    const noteName = notes[noteIndex];
    
    // Format the chord name
    if (chordType === "maj") return noteName;
    if (chordType === "min") return noteName.toLowerCase();
    if (chordType === "dim") return `${noteName.toLowerCase()}°`;
    
    return noteName;
  } else {
    // For other keys, calculate the offset from C
    const cIndex = KEYS.indexOf("C");
    const offset = (keyIndex - cIndex + 7) % 7;
    
    // C major scale: C, D, E, F, G, A, B
    const cMajorScale = [0, 1, 2, 3, 4, 5, 6];
    
    // Calculate the note index in the new key
    noteIndex = (cMajorScale[degree] + offset) % 7;
    const noteName = KEYS[noteIndex];
    
    // Format the chord name
    if (chordType === "maj") return noteName;
    if (chordType === "min") return noteName.toLowerCase();
    if (chordType === "dim") return `${noteName.toLowerCase()}°`;
    
    return noteName;
  }
}

const themes = {
    white: '#FFD6AD',
    gray: '#FFD0D9',
    blue: '#D9E5FA',
    purple: '#E3FFDF'
  };
  
  // DOM elements
  const themeButtons = document.querySelectorAll('.theme-button');
  
  // Initialize theme
  function initTheme() {
    // Check if a theme is saved in localStorage
    const savedTheme = localStorage.getItem('moodChordTheme');
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }
  
  // Set theme
  function setTheme(themeName) {
    // Set background color
    document.body.style.backgroundColor = themes[themeName];
    
    // Update active button
    themeButtons.forEach(button => {
      if (button.dataset.theme === themeName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Save to localStorage
    localStorage.setItem('moodChordTheme', themeName);
  }
  
  // Add event listeners to theme buttons
  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const themeName = button.dataset.theme;
      setTheme(themeName);
    });
  });
  
  // Initialize theme on page load
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Add this to the existing init function if needed
    if (typeof init === 'function') {
      const originalInit = init;
      init = function() {
        originalInit();
        initTheme();
      };
    }
  });


// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);