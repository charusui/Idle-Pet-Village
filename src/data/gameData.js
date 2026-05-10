// ============================================================
// Game Data & Constants — Idle Pet Village
// ============================================================

// --- Elements ---
export const ELEMENTS = ['fire', 'water', 'earth', 'air'];

// --- Evolution Items ---
export const EVO_ITEMS = {
  fire_stone: { element: 'fire', label: 'Fire Stone', iconClass: 'icon-fire-stone' },
  mystic_pearl: { element: 'water', label: 'Mystic Pearl', iconClass: 'icon-mystic-pearl' },
  earth_crystal: { element: 'earth', label: 'Earth Crystal', iconClass: 'icon-earth-crystal' },
  aero_feather: { element: 'air', label: 'Aero Feather', iconClass: 'icon-aero-feather' },
};

export const EVO_ITEM_COST = 1000;

// Element → Evo Item mapping
export const ELEMENT_EVO_ITEM = {
  fire: 'fire_stone',
  water: 'mystic_pearl',
  earth: 'earth_crystal',
  air: 'aero_feather',
};

// Element display info
export const ELEMENT_INFO = {
  fire: { label: 'Fire', iconClass: 'icon-fire', color: '#ef4444' },
  water: { label: 'Water', iconClass: 'icon-water', color: '#3b82f6' },
  earth: { label: 'Earth', iconClass: 'icon-earth', color: '#22c55e' },
  air: { label: 'Air', iconClass: 'icon-air', color: '#a78bfa' },
};

// --- Upgrades ---
export const UPGRADES = {
  coin_rate: {
    label: 'Farm Tools',
    description: '+20% Coin Generation',
    iconClass: 'icon-farm-tools',
    baseCost: 100,
    costMultiplier: 1.5,
    effectMultiplier: 1.2,
  },
  xp_rate: {
    label: 'Training Dummy',
    description: '+25% AFK XP Rate',
    iconClass: 'icon-training-dummy',
    baseCost: 150,
    costMultiplier: 1.5,
    effectMultiplier: 1.25,
  },
  exp_speed: {
    label: 'Travel Boots',
    description: '-10% Expedition Time',
    iconClass: 'icon-travel-boots',
    baseCost: 300,
    costMultiplier: 1.5,
    effectMultiplier: 0.9,
  },
};

// --- Pets ---
// petId maps to video file: pet_01.mp4, pet_02.mp4, etc.
export const PETS_DATA = {
  galaxy_cat: { petId: '1_galaxy_cat', baseGen: 1, element: 'earth', baseName: 'Galaxy Cat', evos: ['Cosmic Cat', 'Astral Cat'], zone: 'woods' },
  choco_bunny: { petId: '2_choco_bunny', baseGen: 2, element: 'earth', baseName: 'Choco Bunny', evos: ['Imp Bunny', 'Overlord Imp'], zone: 'woods' },
  yogurt_dog: { petId: '3_yogurt_dog', baseGen: 3, element: 'earth', baseName: 'Yogurt Dog', evos: ['Baker Shiba', 'Pastry Chef'], zone: 'woods' },

  panda: { petId: '4_panda', baseGen: 1, element: 'water', baseName: 'Panda', evos: ['Ronin Panda', 'Shogun Panda'], zone: 'atoll' },
  icebear: { petId: '5_icebear', baseGen: 2, element: 'water', baseName: 'Icebear', evos: ['Frost Bear', 'Frost King'], zone: 'atoll' },
  grizzly: { petId: '6_grizzly', baseGen: 3, element: 'water', baseName: 'Grizzly', evos: ['Guardian Bear', 'Highland King'], zone: 'atoll' },

  catfish: { petId: '7_catfish', baseGen: 1, element: 'fire', baseName: 'Catfish', evos: ['Cat Mermaid', 'Siren Cat'], zone: 'ember' },
  axolotl: { petId: '8_axolotl', baseGen: 2, element: 'fire', baseName: 'Axolotl', evos: ['Pink Newt', 'Princess Axolotl'], zone: 'ember' },
  cloudy: { petId: '9_cloudy', baseGen: 3, element: 'fire', baseName: 'Cloudy', evos: ['Starry Cloud', 'Starlight Cloud'], zone: 'ember' },

  cat: { petId: '10_cat', baseGen: 1, element: 'earth', baseName: 'Cat', evos: ['Lucky Cat', 'Calico Monk'], zone: 'depths' },
  dog: { petId: '11_dog', baseGen: 2, element: 'earth', baseName: 'Dog', evos: ['Spirit Hound', 'Temple Hound'], zone: 'depths' },
  deer: { petId: '12_deer', baseGen: 3, element: 'earth', baseName: 'Deer', evos: ['Forest Stag', 'Spirit Deer'], zone: 'depths' },

  pig: { petId: '13_pig', baseGen: 1, element: 'air', baseName: 'Pig', evos: ['Fancy Pig', 'Royal Pig'], zone: 'peaks' },
  frog: { petId: '14_frog', baseGen: 2, element: 'air', baseName: 'Frog', evos: ['Flute Frog', 'Bard Frog'], zone: 'peaks' },
};

// --- Zones ---
export const ZONES = {
  woods: { label: 'Whispering Woods', element: 'earth', description: 'A misty forest teeming with ancient creatures.', iconClass: 'pin-woods', pets: ['galaxy_cat', 'choco_bunny', 'yogurt_dog'] },
  atoll: { label: 'Coral Atoll', element: 'water', description: 'Crystal clear waters hiding aquatic wonders.', iconClass: 'pin-atoll', pets: ['panda', 'icebear', 'grizzly'] },
  ember: { label: 'Ember Summit', element: 'fire', description: 'A smoldering volcanic peak radiating fierce energy.', iconClass: 'pin-ember', pets: ['catfish', 'axolotl', 'cloudy'] },
  depths: { label: 'Crystal Depths', element: 'earth', description: 'Deep caverns glowing with crystalline light.', iconClass: 'pin-depths', pets: ['cat', 'dog', 'deer'] },
  peaks: { label: 'Zephyr Peaks', element: 'air', description: 'Sky-high mountains swept by endless winds.', iconClass: 'pin-peaks', pets: ['pig', 'frog'] },
};

// --- Map pin positions (percentage-based over map image) ---
export const MAP_PINS = {
  // Hubs (middle row)
  town: { top: 58, left: 14, label: 'Town Market', iconClass: 'pin-town', tab: 'town' },
  farm: { top: 52, left: 47, label: 'Farm Base', iconClass: 'pin-farm', tab: 'farm' },
  sanctuary: { top: 52, left: 88, label: 'Sanctuary', iconClass: 'pin-sanct', tab: 'sanctuary' },
  portal: { top: 78, left: 50, label: 'Adventure Portal', iconClass: 'pin-portal', tab: 'ai_portal', special: true, offsetY: +20 },
  // Zones (outer islands)
  woods: { top: 16, left: 16, label: 'Whispering Woods', iconClass: 'pin-woods', tab: 'expedition', zone: 'woods', offsetX: -12 },
  atoll: { top: 12, left: 45, label: 'Coral Atoll', iconClass: 'pin-atoll', tab: 'expedition', zone: 'atoll' },
  ember: { top: 16, left: 75, label: 'Ember Summit', iconClass: 'pin-ember', tab: 'expedition', zone: 'ember' },
  depths: { top: 85, left: 30, label: 'Crystal Depths', iconClass: 'pin-depths', tab: 'expedition', zone: 'depths' },
  peaks: { top: 85, left: 70, label: 'Zephyr Peaks', iconClass: 'pin-peaks', tab: 'expedition', zone: 'peaks' },
};

// --- Formulas ---
export const EXPLORE_COST = 50;
export const EXPEDITION_BASE_DURATION = 60; // seconds
export const EVOLUTION_ELEMENTS_REQUIRED = 10;
export const EVOLUTION_ITEMS_REQUIRED = 1;

export function getUpgradeCost(upgradeKey, currentLevel) {
  const u = UPGRADES[upgradeKey];
  return Math.floor(u.baseCost * Math.pow(u.costMultiplier, currentLevel));
}

export function getXpRequired(level, stage) {
  return Math.floor(100 * Math.pow(1.5, level - 1) * (stage + 1));
}

export function getCoinGen(pet) {
  const data = PETS_DATA[pet.species];
  if (!data) return 0;
  return data.baseGen * pet.level * (pet.stage + 1);
}

export function getPetVideoPath(species, stage) {
  const data = PETS_DATA[species];
  if (!data) return '';
  const evoFolder = `evo${stage + 1}`;
  return `/assets/${evoFolder}/${data.petId}.mp4`;
}

export function getPetName(species, stage) {
  const data = PETS_DATA[species];
  if (!data) return species;
  if (stage === 0) return data.baseName;
  return data.evos[stage - 1] || data.baseName;
}
