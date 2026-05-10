import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PETS_DATA, ZONES, UPGRADES, EVO_ITEMS, ELEMENT_EVO_ITEM,
  EXPLORE_COST, EXPEDITION_BASE_DURATION,
  EVOLUTION_ELEMENTS_REQUIRED, EVOLUTION_ITEMS_REQUIRED,
  EVO_ITEM_COST,
  getUpgradeCost, getXpRequired, getCoinGen, getPetName,
} from '../data/gameData';

const SAVE_KEY = 'idle_pet_village_save';
const MAX_LOGS = 5;

function createInitialState() {
  return {
    coins: 50,
    elements: { fire: 0, water: 0, earth: 0, air: 0 },
    inventory: { fire_stone: 0, mystic_pearl: 0, earth_crystal: 0, aero_feather: 0 },
    pets: [
      {
        id: 'pet_start_1',
        species: 'galaxy_cat',
        name: 'Galaxy Cat',
        level: 1,
        maxLevel: 10,
        xp: 0,
        stage: 0,
        status: 'farm',
        expeditionEndTime: null,
      },
    ],
    upgrades: {
      coin_rate: { level: 0, currentMultiplier: 1 },
      xp_rate: { level: 0, currentMultiplier: 1 },
      exp_speed: { level: 0, currentMultiplier: 1 },
    },
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle new fields
      const defaults = createInitialState();
      return {
        ...defaults,
        ...parsed,
        elements: { ...defaults.elements, ...parsed.elements },
        inventory: { ...defaults.inventory, ...parsed.inventory },
        upgrades: { ...defaults.upgrades, ...parsed.upgrades },
      };
    }
  } catch (e) {
    console.warn('Failed to load save:', e);
  }
  return createInitialState();
}

export default function useGameState() {
  const [gameState, setGameState] = useState(loadState);
  const [activeTab, setActiveTab] = useState('map');
  const [activeZone, setActiveZone] = useState('woods');
  const [logs, setLogs] = useState([]);
  const [claimModalData, setClaimModalData] = useState(null);
  const [renameModalPet, setRenameModalPet] = useState(null);
  const gameStateRef = useRef(gameState);
  const activeTabRef = useRef(activeTab);
  const musicRef = useRef(null);

  // Background Music Controller
  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio();
      musicRef.current.loop = true;
      musicRef.current.volume = 0.4;
    }

    let track = 'overworld.mp3';

    if (activeTab === 'town') track = 'town_market.mp3';
    else if (activeTab === 'farm') track = 'farm_base.mp3';
    else if (activeTab === 'sanctuary') track = 'sanctuary.mp3';
    else if (activeTab === 'ai_portal') track = 'adventure_portal.mp3';
    else if (activeTab === 'expedition') {
      if (activeZone === 'woods') track = 'whispering_woods.mp3';
      else if (activeZone === 'atoll') track = 'coral_atoll.mp3';
      else if (activeZone === 'ember') track = 'ember_summit.mp3';
      else if (activeZone === 'depths') track = 'crystal_depths.mp3';
      else if (activeZone === 'peaks') track = 'zephyr_peaks.mp3';
    }

    const newSrc = `/assets/audio/${track}`;
    if (musicRef.current.src !== window.location.origin + newSrc) {
      musicRef.current.src = newSrc;
      musicRef.current.play().catch(err => console.log("Autoplay blocked, waiting for interaction..."));
    }
    activeTabRef.current = activeTab;
  }, [activeTab, activeZone]);

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Prime audio engine for background sounds (Level Up)
  useEffect(() => {
    const primeAudio = () => {
      const audio = new Audio('/assets/audio/pet_level_up.mp3');
      audio.volume = 0; // Silent priming
      audio.play().then(() => {
        console.log('Audio engine primed');
        window.removeEventListener('click', primeAudio);
      }).catch(() => {});
    };
    window.addEventListener('click', primeAudio);
    return () => window.removeEventListener('click', primeAudio);
  }, []);

  // Save to localStorage whenever gameState changes
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // Add log
  const addLog = useCallback((msg) => {
    setLogs(prev => [...prev.slice(-(MAX_LOGS - 1)), { id: Date.now() + Math.random(), msg, time: Date.now() }]);
  }, []);

  // Auto-remove logs after 4 seconds
  useEffect(() => {
    if (logs.length === 0) return;
    const timer = setTimeout(() => {
      setLogs(prev => prev.slice(1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [logs]);

  // ===== GAME TICK (1/sec) =====
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const next = { ...prev, pets: prev.pets.map(p => ({ ...p })) };

        // Coin generation from farming pets
        let totalCoinGen = 0;
        next.pets.forEach(pet => {
          if (pet.status === 'farm') {
            totalCoinGen += getCoinGen(pet) * prev.upgrades.coin_rate.currentMultiplier;
          }
        });
        next.coins += totalCoinGen;

        // XP generation for farming pets
        const xpGain = 10 * prev.upgrades.xp_rate.currentMultiplier;
        next.pets.forEach(pet => {
          if (pet.status === 'farm' && pet.level < pet.maxLevel) {
            pet.xp += xpGain;
            const required = getXpRequired(pet.level, pet.stage);
            while (pet.xp >= required && pet.level < pet.maxLevel) {
              pet.xp -= required;
              pet.level += 1;
              // Play level-up sound only if we are on the farm tab
              if (activeTabRef.current === 'farm') {
                const levelUpAudio = new Audio('/assets/audio/pet_level_up.mp3');
                levelUpAudio.volume = 0.6;
                levelUpAudio.play().catch(e => console.warn('Level up sound blocked by browser:', e));
              }
            }
            if (pet.level >= pet.maxLevel) {
              pet.xp = 0;
            }
          }
        });

        // Handle completed expeditions
        next.pets.forEach(pet => {
          if (pet.status.startsWith('expedition_') && pet.expeditionEndTime && Date.now() >= pet.expeditionEndTime) {
            const zoneId = pet.status.replace('expedition_', '');
            const zone = ZONES[zoneId];
            if (zone) {
              // Generate loot once and lock it in
              const elementsGained = Math.floor(Math.random() * 5) + 3;
              const bonusItemRoll = Math.random() < 0.3;
              const itemKey = ELEMENT_EVO_ITEM[zone.element];

              pet.status = `completed_${zoneId}`;
              pet.loot = {
                elementsGained,
                elementType: zone.element,
                bonusItem: bonusItemRoll ? itemKey : null,
                zoneLabel: zone.label
              };
            }
          }
        });

        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ===== ACTIONS =====

  // Navigate via map pin
  const navigatePin = useCallback((pinKey, pinData) => {
    setActiveTab(pinData.tab);
    if (pinData.zone) {
      setActiveZone(pinData.zone);
    }
  }, []);

  // Buy upgrade
  const buyUpgrade = useCallback((upgradeKey) => {
    const upgRef = gameStateRef.current.upgrades[upgradeKey];
    const cost = getUpgradeCost(upgradeKey, upgRef.level);
    if (gameStateRef.current.coins < cost) return;

    new Audio('/assets/audio/cash_reg.mp3').play().catch(e => console.warn('Audio play failed:', e));

    setGameState(prev => {
      const upg = prev.upgrades[upgradeKey];
      const newLevel = upg.level + 1;
      const upgDef = UPGRADES[upgradeKey];
      const newMultiplier = upgradeKey === 'exp_speed'
        ? Math.pow(upgDef.effectMultiplier, newLevel)
        : Math.pow(upgDef.effectMultiplier, newLevel);

      return {
        ...prev,
        coins: prev.coins - cost,
        upgrades: {
          ...prev.upgrades,
          [upgradeKey]: { level: newLevel, currentMultiplier: newMultiplier },
        },
      };
    });
    addLog(`⬆️ Upgraded ${UPGRADES[upgradeKey].label}!`);
  }, [addLog]);

  // Buy evo item
  const buyEvoItem = useCallback((itemKey) => {
    if (gameStateRef.current.coins < EVO_ITEM_COST) return;

    new Audio('/assets/audio/cash_reg.mp3').play().catch(e => console.warn('Audio play failed:', e));

    setGameState(prev => {
      return {
        ...prev,
        coins: prev.coins - EVO_ITEM_COST,
        inventory: { ...prev.inventory, [itemKey]: prev.inventory[itemKey] + 1 },
      };
    });
    addLog(`🛒 Bought ${EVO_ITEMS[itemKey].label}!`);
  }, [addLog]);

  // Zone exploration (gacha)
  const exploreZone = useCallback((zoneId) => {
    const currentState = gameStateRef.current;
    if (currentState.coins < EXPLORE_COST) return;

    // 1. Play Sound
    new Audio('/assets/audio/explore.mp3').play().catch(() => { });

    // 2. Determine Reward
    const zone = ZONES[zoneId];
    const roll = Math.random();

    let rewardType = 'coins';
    let rewardValue = null;
    let newPet = null;

    if (roll < 0.25) {
      const possiblePets = zone.pets.filter(
        sp => !currentState.pets.some(p => p.species === sp)
      );
      if (possiblePets.length > 0) {
        rewardType = 'pet';
        const chosen = possiblePets[Math.floor(Math.random() * possiblePets.length)];
        const petData = PETS_DATA[chosen];
        newPet = {
          id: `pet_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          species: chosen,
          name: petData.baseName,
          level: 1,
          maxLevel: 10,
          xp: 0,
          stage: 0,
          status: 'farm',
          expeditionEndTime: null,
        };
      } else {
        rewardType = 'coins_bonus';
        rewardValue = Math.floor(Math.random() * 40) + 20;
      }
    } else if (roll < 0.60) {
      rewardType = 'elements';
      rewardValue = Math.floor(Math.random() * 4) + 2;
    } else if (roll < 0.70) {
      rewardType = 'evo_item';
      rewardValue = ELEMENT_EVO_ITEM[zone.element];
    } else {
      rewardType = 'coins';
      rewardValue = Math.floor(Math.random() * 40) + 20;
    }

    // 3. Apply State
    setGameState(prev => {
      if (prev.coins < EXPLORE_COST) return prev;

      const next = {
        ...prev,
        coins: prev.coins - EXPLORE_COST,
        pets: [...prev.pets],
        elements: { ...prev.elements },
        inventory: { ...prev.inventory },
      };

      if (rewardType === 'pet' && newPet) {
        next.pets.push(newPet);
        addLog(`🎉 Discovered a ${newPet.name}!`);
      } else if (rewardType === 'coins' || rewardType === 'coins_bonus') {
        next.coins += rewardValue;
        addLog(`💰 Found ${rewardValue} coins${rewardType === 'coins_bonus' ? ' (all pets discovered)' : ''}!`);
      } else if (rewardType === 'elements') {
        next.elements[zone.element] += rewardValue;
        addLog(`✨ Gathered ${rewardValue} ${zone.element} elements!`);
      } else if (rewardType === 'evo_item') {
        next.inventory[rewardValue] += 1;
        addLog(`💎 Unearthed a ${EVO_ITEMS[rewardValue].label}!`);
      }

      return next;
    });
  }, [addLog]);

  // Send pet on expedition
  const sendOnExpedition = useCallback((petId, zoneId) => {
    const duration = EXPEDITION_BASE_DURATION * gameStateRef.current.upgrades.exp_speed.currentMultiplier;
    const endTime = Date.now() + duration * 1000;

    new Audio('/assets/audio/send_pet.mp3').play().catch(() => { });

    setGameState(prev => ({
      ...prev,
      pets: prev.pets.map(p =>
        p.id === petId
          ? { ...p, status: `expedition_${zoneId}`, expeditionEndTime: endTime }
          : p
      ),
    }));
    addLog(`🚀 Sent pet on expedition to ${ZONES[zoneId].label}!`);
  }, [addLog]);

  // Check & claim expedition
  const claimExpedition = useCallback((petId) => {
    const pet = gameStateRef.current.pets.find(p => p.id === petId);
    if (!pet || !pet.status.startsWith('completed_') || !pet.loot) return;

    const zoneId = pet.status.replace('completed_', '');
    const zone = ZONES[zoneId];

    new Audio('/assets/audio/rewards_show.mp3').play().catch(() => { });

    const lootData = {
      pet,
      zone,
      elementsGained: pet.loot.elementsGained,
      elementType: pet.loot.elementType,
      bonusItem: pet.loot.bonusItem,
    };

    setClaimModalData(lootData);
  }, []);

  // Confirm claim from modal
  const confirmClaim = useCallback(() => {
    if (!claimModalData) return;
    const { pet, elementsGained, elementType, bonusItem } = claimModalData;

    new Audio('/assets/audio/claim_reward.mp3').play().catch(() => { });

    setGameState(prev => ({
      ...prev,
      elements: {
        ...prev.elements,
        [elementType]: prev.elements[elementType] + elementsGained,
      },
      inventory: bonusItem
        ? { ...prev.inventory, [bonusItem]: prev.inventory[bonusItem] + 1 }
        : prev.inventory,
      pets: prev.pets.map(p =>
        p.id === pet.id
          ? { ...p, status: 'farm', expeditionEndTime: null, loot: null }
          : p
      ),
    }));

    addLog(`📦 Claimed expedition loot! +${elementsGained} ${elementType} elements${bonusItem ? ` + ${EVO_ITEMS[bonusItem].label}` : ''}`);
    setClaimModalData(null);
  }, [claimModalData, addLog]);

  // Evolve pet
  const evolvePet = useCallback((petId) => {
    const currentState = gameStateRef.current;
    const pet = currentState.pets.find(p => p.id === petId);
    if (!pet || pet.status !== 'farm' || pet.level < pet.maxLevel || pet.stage >= 2) return;

    const petData = PETS_DATA[pet.species];
    if (!petData) return;

    const element = petData.element;
    const evoItemKey = ELEMENT_EVO_ITEM[element];

    if (currentState.elements[element] < EVOLUTION_ELEMENTS_REQUIRED) return;
    if (currentState.inventory[evoItemKey] < EVOLUTION_ITEMS_REQUIRED) return;

    // Play evolution sound
    new Audio('/assets/audio/evolve_sound.mp3').play().catch(() => { });

    setGameState(prev => {
      // Re-find pet in the new state to be safe
      const pRef = prev.pets.find(p => p.id === petId);
      if (!pRef) return prev;

      const newStage = pRef.stage + 1;
      const newName = getPetName(pRef.species, newStage);

      return {
        ...prev,
        elements: { ...prev.elements, [element]: prev.elements[element] - EVOLUTION_ELEMENTS_REQUIRED },
        inventory: { ...prev.inventory, [evoItemKey]: prev.inventory[evoItemKey] - EVOLUTION_ITEMS_REQUIRED },
        pets: prev.pets.map(p =>
          p.id === petId
            ? {
              ...p,
              stage: newStage,
              name: newName,
              level: 1,
              maxLevel: p.maxLevel + 10,
              xp: 0,
            }
            : p
        ),
      };
    });
    addLog(`✨ Pet evolved!`);
  }, [addLog]);

  // Rename pet
  const renamePet = useCallback((petId, newName) => {
    if (!newName || newName.trim().length === 0) return;
    setGameState(prev => ({
      ...prev,
      pets: prev.pets.map(p => p.id === petId ? { ...p, name: newName.trim() } : p)
    }));
  }, []);

  // Toggle Favorite
  const toggleFavoritePet = useCallback((petId) => {
    new Audio('/assets/audio/favorite.mp3').play().catch(() => { });
    setGameState(prev => ({
      ...prev,
      pets: prev.pets.map(p => p.id === petId ? { ...p, favorite: !p.favorite } : p)
    }));
  }, []);

  // Reset save
  const resetGame = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setGameState(createInitialState());
    setLogs([]);
    addLog('🔄 Game reset!');
  }, [addLog]);

  // Compute totals
  const totalCoinRate = gameState.pets
    .filter(p => p.status === 'farm')
    .reduce((sum, p) => sum + getCoinGen(p) * gameState.upgrades.coin_rate.currentMultiplier, 0);

  return {
    gameState,
    setGameState,
    activeTab,
    setActiveTab,
    activeZone,
    setActiveZone,
    logs,
    addLog,
    claimModalData,
    setClaimModalData,
    renameModalPet,
    setRenameModalPet,
    navigatePin,
    buyUpgrade,
    buyEvoItem,
    exploreZone,
    sendOnExpedition,
    claimExpedition,
    confirmClaim,
    evolvePet,
    renamePet,
    toggleFavoritePet,
    resetGame,
    totalCoinRate,
  };
}
