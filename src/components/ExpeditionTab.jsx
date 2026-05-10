import { useState, useEffect } from 'react';
import PetVideo from './PetVideo';
import {
  ZONES, EXPLORE_COST, EXPEDITION_BASE_DURATION, ELEMENT_INFO,
} from '../data/gameData';

function ExpeditionTimer({ endTime, onComplete }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endTime - Date.now());
      setRemaining(Math.ceil(diff / 1000));
      if (diff <= 0) {
        onComplete();
      }
    };
    update();
    const timer = setInterval(update, 500);
    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <span className="expedition-timer">
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

export default function ExpeditionTab({
  gameState,
  activeZone,
  setActiveZone,
  exploreZone,
  sendOnExpedition,
  claimExpedition,
}) {
  const zone = ZONES[activeZone];
  const elInfo = ELEMENT_INFO[zone.element];

  // Active expeditions in this zone
  const expeditionPets = gameState.pets.filter(
    p => p.status === `expedition_${activeZone}`
  );

  const completedExpeditions = gameState.pets.filter(p =>
    p.status.startsWith('completed_')
  );

  const activeExpeditions = gameState.pets.filter(p =>
    p.status.startsWith('expedition_') && p.expeditionEndTime && Date.now() < p.expeditionEndTime
  );

  // Idle farm pets available to send
  const idlePets = gameState.pets.filter(p => p.status === 'farm');

  const canExplore = gameState.coins >= EXPLORE_COST;

  return (
    <div className="tab-content">
      {/* Zone header */}
      <div className="zone-header card-bg bg-zone-header" style={{ '--zone-color': elInfo.color }}>
        <div className="zone-info">
          <h2><span className={`sprite-pin ${zone.iconClass}`} style={{ width: '24px', height: '24px' }}></span> {zone.label}</h2>
          <p className="zone-desc">{zone.description}</p>
          <div className="zone-meta">
            <span className="zone-element" style={{ color: elInfo.color }}>
              <span className={`sprite-icon ${elInfo.iconClass}`}></span> {elInfo.label}
            </span>
            <span className="zone-time">
              <span className="sprite-ui-icon icon-timer"></span> {Math.round(EXPEDITION_BASE_DURATION * gameState.upgrades.exp_speed.currentMultiplier)}s
            </span>
          </div>
        </div>
        <button
          className={`btn-img ${canExplore ? '' : 'btn-disabled'}`}
          onClick={() => exploreZone(activeZone)}
          disabled={!canExplore}
          id="explore-zone-btn"
        >
          <img src="/assets/ui/icons/btn_explore.png?v=2" alt="Explore Zone" />
        </button>
      </div>

      {/* Completed Expeditions */}
      {completedExpeditions.length > 0 && (
        <div className="expedition-section card-bg bg-shop-card completed-section">
          <h3><span className="sprite-ui-icon icon-star"></span> Completed Expeditions</h3>
          <div className="expedition-list">
            {completedExpeditions.map(pet => (
              <div key={pet.id} className="expedition-card completed-card" id={`exp-done-${pet.id}`}>
                <PetVideo species={pet.species} stage={pet.stage} size={100} />
                <div className="expedition-info done-info">
                  <span className="expedition-name">{pet.name}</span>
                  <button
                    className="btn-img btn-loot-img"
                    onClick={() => claimExpedition(pet.id)}
                  >
                    <img src="/assets/ui/icons/btn_loot.png" alt="Open Loot" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Expeditions */}
      {activeExpeditions.length > 0 && (
        <div className="expedition-section card-bg bg-shop-card">
          <h3><span className="sprite-ui-icon icon-star"></span> Active Expeditions</h3>
          <div className="expedition-list">
            {activeExpeditions.map(pet => (
              <div key={pet.id} className="expedition-card" id={`exp-active-${pet.id}`}>
                <PetVideo species={pet.species} stage={pet.stage} size={100} />
                <div className="expedition-info">
                  <span className="expedition-name">{pet.name}</span>
                  <ExpeditionTimer
                    endTime={pet.expeditionEndTime}
                    onComplete={() => { }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Idle Pets to Send */}
      <div className="expedition-section">
        <h3>🐾 Send a Pet</h3>
        {idlePets.length === 0 ? (
          <p className="empty-msg">No idle pets available.</p>
        ) : (
          <div className="idle-pets-list">
            {idlePets.map(pet => (
              <div key={pet.id} className="idle-pet-row" id={`send-${pet.id}`}>
                <PetVideo species={pet.species} stage={pet.stage} size={90} />
                <span className="idle-pet-name">{pet.name} (Lv.{pet.level})</span>
                <button
                  className="btn-img btn-img-sm"
                  onClick={() => sendOnExpedition(pet.id, activeZone)}
                >
                  <img src="/assets/ui/icons/btn_send.png?v=2" alt="Send" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
