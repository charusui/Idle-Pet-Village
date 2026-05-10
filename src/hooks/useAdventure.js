// ============================================================
// useAdventure — Adventure Portal State Machine
// ============================================================

import { useState, useCallback } from 'react';
import { generateQuest, generateSceneImage } from '../services/geminiService';
import {
  PETS_DATA, ELEMENTS, EVO_ITEMS, ELEMENT_EVO_ITEM, ELEMENT_INFO,
  getPetName,
} from '../data/gameData';

const QUEST_COST = 100;
const RESOLVE_DELAY_MS = 1500; // Snappier transitions after choice

// Reward tier → reward ranges
const TIER_REWARDS = {
  low: { coins: [20, 40], elements: [1, 2], evoChance: 0 },
  medium: { coins: [40, 80], elements: [2, 4], evoChance: 0.15 },
  high: { coins: [80, 150], elements: [4, 7], evoChance: 0.30 },
};

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate rewards based on encounter results.
 * @param {Array} results - Array of { success, rewardTier } objects
 * @param {Array} partyElements - Elements present in the party
 * @returns {Object} { totalCoins, totalElements, evoItems, successCount, perfectRun }
 */
function calculateRewards(results, partyElements) {
  const successes = results.filter(r => r.success);
  const perfectBonus = successes.length === 3 ? 1.5 : 1.0;

  let totalCoins = 0;
  const totalElements = { fire: 0, water: 0, earth: 0, air: 0 };
  const evoItems = [];

  successes.forEach(result => {
    const tier = TIER_REWARDS[result.rewardTier] || TIER_REWARDS.low;
    const [minC, maxC] = tier.coins;
    totalCoins += Math.floor(randRange(minC, maxC) * perfectBonus);

    const [minE, maxE] = tier.elements;
    const elementCount = randRange(minE, maxE);
    // Distribute elements to the party's element types
    const el = partyElements.length > 0
      ? partyElements[Math.floor(Math.random() * partyElements.length)]
      : ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    totalElements[el] += elementCount;

    // Evo item roll
    if (Math.random() < tier.evoChance) {
      const evoKeys = Object.keys(EVO_ITEMS);
      evoItems.push(evoKeys[Math.floor(Math.random() * evoKeys.length)]);
    }
  });

  return {
    totalCoins,
    totalElements,
    evoItems,
    successCount: successes.length,
    perfectRun: successes.length === 3,
  };
}

/**
 * Build a human-readable party description for the quest prompt.
 */
function buildPartyDescription(selectedPets, allPets) {
  return selectedPets.map((petId, i) => {
    const pet = allPets.find(p => p.id === petId);
    if (!pet) return '';
    const data = PETS_DATA[pet.species];
    if (!data) return '';
    const name = pet.name || getPetName(pet.species, pet.stage);
    const element = data.element;
    const stage = pet.stage;
    const level = pet.level;
    return `${i + 1}. ${name} (${element}, Evolution Stage ${stage}, Level ${level})`;
  }).filter(Boolean).join('\n');
}

/**
 * Main adventure hook. Manages the complete quest lifecycle.
 */
export default function useAdventure(gameState, addLog, setGameState) {
  // Phase: 'idle' | 'selecting' | 'generating' | 'encounter' | 'resolving' | 'complete' | 'error'
  const [phase, setPhase] = useState('idle');
  const [quest, setQuest] = useState(null);
  const [currentEncounter, setCurrentEncounter] = useState(0);
  const [sceneImages, setSceneImages] = useState([]); // Array of 3 data URLs
  const [selectedPets, setSelectedPets] = useState([]);
  const [results, setResults] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [chosenChoice, setChosenChoice] = useState(null); // The choice object the player picked
  const [choiceSuccess, setChoiceSuccess] = useState(null); // true/false result
  const [rewards, setRewards] = useState(null); // Calculated rewards for display
  const [errorMessage, setErrorMessage] = useState('');

  // Toggle pet selection (max 3)
  const togglePetSelection = useCallback((petId) => {
    setSelectedPets(prev => {
      if (prev.includes(petId)) {
        return prev.filter(id => id !== petId);
      }
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, petId];
    });
  }, []);

  // Open the pet selector
  const openSelector = useCallback(() => {
    setSelectedPets([]);
    setPhase('selecting');
  }, []);

  // Start the quest
  const startQuest = useCallback(async () => {
    if (selectedPets.length === 0) return;
    if (gameState.coins < QUEST_COST) return;

    // Deduct coins immediately
    setGameState(prev => ({ ...prev, coins: prev.coins - QUEST_COST }));

    // Play begin quest sound
    new Audio('/assets/audio/begin_quest.mp3').play().catch(() => { });

    setPhase('generating');
    setResults([]);
    setCurrentEncounter(0);
    setQuest(null);
    setSceneImages([]);
    setRewards(null);

    try {
      // Build party description
      const partyDesc = buildPartyDescription(selectedPets, gameState.pets);

      // Generate Quest and all images upfront for a seamless experience
      setIsImageLoading(true);
      const questData = await generateQuest(partyDesc);
      setQuest(questData);

      const images = [];
      for (let i = 0; i < questData.encounters.length; i++) {
        // Generate the Pollinations URL for each encounter
        try {
          const imgUrl = await generateSceneImage(questData.encounters[i].scene_description);
          images.push(imgUrl);

          // Small delay to prevent hitting Pollinations too fast sequentially
          if (i < questData.encounters.length - 1) await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          console.warn(`Image generation ${i + 1} failed:`, err);
          images.push(null); // Keep array length correct
        }
      }

      setSceneImages(images);

      // Give the AI some time to actually "draw" the images before we flip the screen
      // This ensures that when the encounter starts, the images are ready to display.
      await new Promise(r => setTimeout(r, 7000));

      setIsImageLoading(false);
      setPhase('encounter');

      addLog(`⚔️ Quest "${questData.quest_title}" begins!`);
    } catch (err) {
      console.error('Quest generation failed:', err);
      // Refund coins
      setGameState(prev => ({ ...prev, coins: prev.coins + QUEST_COST }));
      setErrorMessage(err.message || 'Failed to generate quest. Please try again.');
      setPhase('error');
    }
  }, [selectedPets, gameState.coins, gameState.pets, setGameState, addLog]);

  // Make a choice in the current encounter
  const makeChoice = useCallback(async (choiceId) => {
    if (!quest || phase !== 'encounter') return;

    const encounter = quest.encounters[currentEncounter];
    const choice = encounter.choices.find(c => c.id === choiceId);
    if (!choice) return;

    // Determine success: check if any selected pet has matching element
    const partyElements = selectedPets.map(petId => {
      const pet = gameState.pets.find(p => p.id === petId);
      if (!pet) return null;
      const data = PETS_DATA[pet.species];
      return data?.element;
    }).filter(Boolean);

    const success = choice.element === 'any' || partyElements.includes(choice.element);

    // Play feedback sound
    const sfx = new Audio(`/assets/audio/${success ? 'correct' : 'wrong'}.mp3`);
    sfx.play().catch(() => { });

    setChosenChoice(choice);
    setChoiceSuccess(success);
    setResults(prev => [...prev, {
      encounterId: encounter.id,
      choiceId: choice.id,
      choiceLabel: choice.label,
      success,
      rewardTier: choice.reward_tier,
    }]);
    setPhase('resolving');

    // After a delay, advance to next encounter or complete
    setTimeout(async () => {
      if (currentEncounter < 2) {
        // Transition to next encounter immediately (images are pre-loaded)
        const nextIdx = currentEncounter + 1;
        setCurrentEncounter(nextIdx);
        setChosenChoice(null);
        setChoiceSuccess(null);
        setPhase('encounter');
      } else {
        // Quest complete — calculate rewards
        const allResults = [...results, {
          encounterId: encounter.id,
          choiceId: choice.id,
          choiceLabel: choice.label,
          success,
          rewardTier: choice.reward_tier,
        }];

        const partyEls = [...new Set(partyElements)];
        const rewardData = calculateRewards(allResults, partyEls);
        setRewards(rewardData);
        setChosenChoice(null);
        setChoiceSuccess(null);
        setPhase('complete');

        if (rewardData.perfectRun) {
          addLog('🌟 Perfect quest run! Bonus rewards!');
        }
      }
    }, RESOLVE_DELAY_MS);
  }, [quest, phase, currentEncounter, selectedPets, gameState.pets, results, addLog]);

  // Claim rewards and return to idle
  const claimRewards = useCallback(() => {
    if (!rewards) return;

    // Play reward sound
    new Audio('/assets/audio/claim_reward.mp3').play().catch(() => { });

    setGameState(prev => {
      const next = {
        ...prev,
        coins: prev.coins + rewards.totalCoins,
        elements: { ...prev.elements },
        inventory: { ...prev.inventory },
      };

      // Apply elements
      Object.entries(rewards.totalElements).forEach(([el, count]) => {
        if (count > 0) {
          next.elements[el] = (next.elements[el] || 0) + count;
        }
      });

      // Apply evo items
      rewards.evoItems.forEach(itemKey => {
        next.inventory[itemKey] = (next.inventory[itemKey] || 0) + 1;
      });

      return next;
    });

    const elemSummary = Object.entries(rewards.totalElements)
      .filter(([, count]) => count > 0)
      .map(([el, count]) => `${count} ${el}`)
      .join(', ');

    addLog(`📦 Quest rewards: +${rewards.totalCoins} coins${elemSummary ? `, +${elemSummary} elements` : ''}${rewards.evoItems.length > 0 ? `, +${rewards.evoItems.length} evo item(s)` : ''}`);

    resetAdventure();
  }, [rewards, setGameState, addLog]);

  // Reset to idle
  const resetAdventure = useCallback(() => {
    setPhase('idle');
    setQuest(null);
    setCurrentEncounter(0);
    setSceneImages([]);
    setSelectedPets([]);
    setResults([]);
    setChosenChoice(null);
    setChoiceSuccess(null);
    setRewards(null);
    setErrorMessage('');
    setIsImageLoading(false);
  }, []);

  return {
    phase,
    quest,
    currentEncounter,
    sceneImages,
    selectedPets,
    results,
    isImageLoading,
    chosenChoice,
    choiceSuccess,
    rewards,
    errorMessage,
    togglePetSelection,
    openSelector,
    startQuest,
    makeChoice,
    claimRewards,
    resetAdventure,
    QUEST_COST,
  };
}
