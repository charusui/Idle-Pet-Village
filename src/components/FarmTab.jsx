import { useState, useEffect, useRef } from 'react';
import PetVideo from './PetVideo';
import { getCoinGen, getXpRequired, UPGRADES } from '../data/gameData';

function FloatingXP({ xp, isMaxLevel, xpMultiplier }) {
  const [numbers, setNumbers] = useState([]);
  const prevXpRef = useRef(xp);

  useEffect(() => {
    // Only spawn numbers if XP increased and pet isn't MAX
    if (xp > prevXpRef.current && !isMaxLevel) {
      const amount = Math.round(10 * xpMultiplier);
      const id = Date.now();

      // Spawn 4 truly random points within a "safe zone" (15% to 85%) to avoid clipping
      const newNumbers = [];
      for (let i = 0; i < 4; i++) {
        newNumbers.push({
          id: id + i,
          x: 15 + Math.random() * 70,
          y: 20 + Math.random() * 60,
          val: `+${amount}`
        });
      }

      setNumbers(prev => [...prev, ...newNumbers]);

      // Cleanup after 1.5s
      setTimeout(() => {
        setNumbers(prev => prev.filter(n => !newNumbers.includes(n)));
      }, 1500);
    }
    prevXpRef.current = xp;
  }, [xp, isMaxLevel, xpMultiplier]);

  return (
    <div className="floating-xp-container">
      {numbers.map(n => (
        <div key={n.id} className="floating-xp" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          <img src="/assets/ui/icons/level_up_arrow.png" className="floating-xp-arrow" alt="up" />
          {n.val}
        </div>
      ))}
    </div>
  );
}

export default function FarmTab({ gameState, renamePet, toggleFavoritePet, setRenameModalPet }) {
  // Sort favorites to the top
  const farmPets = [...gameState.pets.filter(p => p.status === 'farm')]
    .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

  const xpMultiplier = gameState.upgrades.xp_rate.currentMultiplier;

  if (farmPets.length === 0) {
    return (
      <div className="tab-content">
        <div className="empty-state">
          <span className="sprite-ui-icon icon-farm-tools" style={{ width: '48px', height: '48px' }}></span>
          <p>No pets on the farm. Explore zones to find some!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-inner">
          <h2><span className="sprite-ui-icon icon-farm-tools"></span> Your Farm</h2>
          <p className="tab-subtitle">{farmPets.length} pets generating coins</p>
        </div>
      </div>
      <div className="pet-grid">
        {farmPets.map(pet => {
          const coinRate = getCoinGen(pet) * gameState.upgrades.coin_rate.currentMultiplier;
          const xpRequired = getXpRequired(pet.level, pet.stage);
          const xpPercent = pet.level >= pet.maxLevel ? 100 : (pet.xp / xpRequired) * 100;
          const isMaxLevel = pet.level >= pet.maxLevel;

          return (
            <div key={pet.id} className="pet-card card-bg bg-pet-card" id={`pet-card-${pet.id}`}>
              <FloatingXP xp={pet.xp} isMaxLevel={isMaxLevel} xpMultiplier={xpMultiplier} />

              <button
                className={`pet-favorite-btn ${pet.favorite ? 'active' : ''}`}
                onClick={() => toggleFavoritePet(pet.id)}
                title="Favorite to keep at top"
              >
                {pet.favorite ? '❤️' : '🤍'}
              </button>

              <div className="pet-card-video">
                <PetVideo species={pet.species} stage={pet.stage} size={150} />
              </div>
              <div className="pet-card-info">
                <h3
                  className="pet-name"
                  onDoubleClick={() => setRenameModalPet(pet)}
                  title="Double-click to rename"
                >
                  <span className="pet-name-text">{pet.name}</span>
                  <div
                    className="pet-rename-icon-wrapper"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRenameModalPet(pet);
                    }}
                  >
                    <img src="/assets/ui/icons/icon_edit.png" alt="edit" className="pet-edit-icon" />
                  </div>
                </h3>
                <div className="pet-level">
                  Lv. {pet.level} / {pet.maxLevel}
                  {pet.stage > 0 && <span className="pet-stage">★{pet.stage}</span>}
                </div>
                <div className="xp-bar-container">
                  <div
                    className={`xp-bar-fill ${isMaxLevel ? 'xp-bar-max' : ''}`}
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <div className="pet-coin-rate">
                  <span className="sprite-icon icon-coin"></span> {coinRate.toFixed(1)}/s
                </div>
              </div>
              {isMaxLevel && (
                <div className="pet-max-badge">MAX</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
