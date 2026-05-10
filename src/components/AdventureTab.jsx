import { useMemo } from 'react';
import PetVideo from './PetVideo';
import useAdventure from '../hooks/useAdventure';
import {
  PETS_DATA, ELEMENT_INFO, EVO_ITEMS, getPetName,
} from '../data/gameData';

// ========== SUB-COMPONENTS ==========

function QuestProgressDots({ current, total, results }) {
  return (
    <div className="quest-progress-dots">
      {Array.from({ length: total }, (_, i) => {
        let cls = 'progress-dot';
        if (i < results.length) {
          cls += results[i].success ? ' dot-success' : ' dot-failure';
        } else if (i === current) {
          cls += ' dot-active';
        }
        return <span key={i} className={cls} />;
      })}
    </div>
  );
}

function PetSelector({ gameState, selectedPets, togglePetSelection }) {
  const farmPets = gameState.pets.filter(p => p.status === 'farm');

  return (
    <div className="adventure-selector">
      <h3>Choose Your Party <span className="selector-hint">(1-3 pets)</span></h3>
      {farmPets.length === 0 ? (
        <p className="empty-msg">No pets available. Return some from expeditions first!</p>
      ) : (
        <div className="pet-selector-grid">
          {farmPets.map(pet => {
            const data = PETS_DATA[pet.species];
            if (!data) return null;
            const elInfo = ELEMENT_INFO[data.element];
            const isSelected = selectedPets.includes(pet.id);
            return (
              <button
                key={pet.id}
                className={`pet-selector-card card-bg bg-pet-card ${isSelected ? 'pet-selected' : ''}`}
                onClick={() => togglePetSelection(pet.id)}
                style={{ '--el-color': elInfo?.color || '#888' }}
              >
                <PetVideo species={pet.species} stage={pet.stage} size={80} />
                <div className="selector-pet-info">
                  <span className="selector-pet-name">{pet.name}</span>
                  <span className="selector-pet-meta">
                    Lv.{pet.level} · <span className={`sprite-icon ${elInfo?.iconClass}`}></span>
                  </span>
                </div>
                {isSelected && <span className="selector-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EncounterView({
  encounter, sceneImages, isImageLoading, quest, currentEncounter, results, onChoice,
}) {
  const currentImg = sceneImages[currentEncounter];
  return (
    <div className="adventure-encounter">
      <QuestProgressDots current={currentEncounter} total={3} results={results} />

      {/* Scene Image */}
      <div className="adventure-scene">
        {isImageLoading ? (
          <div className="scene-loading">
            <span className="sprite-adv adv-vortex scene-spinner"></span>
            <span>Painting the scene...</span>
          </div>
        ) : currentImg ? (
          <img src={currentImg} alt="Quest scene" className="scene-img" referrerPolicy="no-referrer" />
        ) : (
          <div className="scene-fallback">
            <span className="sprite-adv adv-palette" style={{ width: 48, height: 48 }}></span>
          </div>
        )}
      </div>

      {/* Narrative */}
      <div className="adventure-narrative card-bg bg-shop-card">
        <p>{encounter.narrative}</p>
      </div>

      {/* Choices */}
      <div className="adventure-choices">
        {encounter.choices.map(choice => {
          const elInfo = choice.element !== 'any'
            ? ELEMENT_INFO[choice.element]
            : { label: 'Any', iconClass: 'icon-star', color: '#f59e0b' };
          return (
            <button
              key={choice.id}
              className={`choice-card card-bg bg-shop-card tier-${choice.reward_tier}`}
              onClick={() => onChoice(choice.id)}
              style={{ '--el-color': elInfo?.color || '#888' }}
            >
              <div className="choice-reward-chests">
                {Array.from({ length: choice.reward_tier === 'high' ? 3 : choice.reward_tier === 'medium' ? 2 : 1 }).map((_, i) => (
                  <img key={i} src="/assets/ui/icons/chest_icon.png" alt="Reward Tier" className="chest-tier-icon" />
                ))}
              </div>
              <div className="choice-header">
                <span className={`sprite-icon ${elInfo?.iconClass}`}></span>
                <span className="choice-label">{choice.label}</span>
              </div>
              <p className="choice-desc">{choice.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResolveView({ encounter, chosenChoice, choiceSuccess, sceneImages, currentEncounter }) {
  const currentImg = sceneImages[currentEncounter];
  return (
    <div className="adventure-encounter">
      <div className={`adventure-scene ${choiceSuccess ? 'scene-success' : 'scene-failure'}`}>
        {currentImg ? (
          <img src={currentImg} alt="Quest scene" className="scene-img" referrerPolicy="no-referrer" />
        ) : (
          <div className="scene-fallback"></div>
        )}
        <div className={`scene-result-overlay ${choiceSuccess ? 'overlay-success' : 'overlay-failure'}`}>
          <img 
            src={`/assets/ui/icons/${choiceSuccess ? 'check' : 'X'}.png`} 
            alt={choiceSuccess ? 'Success' : 'Failure'} 
            className="resolve-status-icon"
          />
        </div>
      </div>

      <div className={`adventure-narrative card-bg bg-shop-card ${choiceSuccess ? 'narrative-success' : 'narrative-failure'}`}>
        <h4>{choiceSuccess ? 'Success!' : 'Failed...'}</h4>
        <p>{choiceSuccess ? chosenChoice.success_text : chosenChoice.failure_text}</p>
      </div>
    </div>
  );
}

function QuestResults({ quest, results, rewards, onClaim }) {
  return (
    <div className="adventure-results">
      <h2 className="results-title">⚔️ Quest Complete!</h2>
      <h3 className="results-quest-name">{quest.quest_title}</h3>

      <div className="results-encounters">
        {quest.encounters.map((enc, i) => {
          const result = results[i];
          return (
            <div key={enc.id} className={`result-row ${result?.success ? 'result-success' : 'result-fail'}`}>
              <span className="result-marker">
                <img 
                  src={`/assets/ui/icons/${result?.success ? 'check' : 'X'}.png`} 
                  alt={result?.success ? 'Success' : 'Failure'} 
                  className="status-icon"
                />
              </span>
              <span className="result-encounter-label">Encounter {enc.id}</span>
              <span className="result-choice-label">{result?.choiceLabel}</span>
            </div>
          );
        })}
      </div>

      <div className="results-score">
        {rewards.successCount}/3 Successes
        {rewards.perfectRun && <span className="perfect-badge">🌟 PERFECT!</span>}
      </div>

      <div className="results-loot card-bg bg-shop-card">
        <h4>Rewards</h4>
        {rewards.successCount === 0 ? (
          <p className="no-rewards">No rewards this time. Better luck next quest!</p>
        ) : (
          <>
            <div className="loot-row">
              <span className="sprite-icon icon-coin"></span>
              <span>+{rewards.totalCoins} Coins</span>
            </div>
            {Object.entries(rewards.totalElements)
              .filter(([, count]) => count > 0)
              .map(([el, count]) => {
                const info = ELEMENT_INFO[el];
                return (
                  <div key={el} className="loot-row">
                    <span className={`sprite-icon ${info?.iconClass}`}></span>
                    <span>+{count} {info?.label} Elements</span>
                  </div>
                );
              })}
            {rewards.evoItems.map((itemKey, i) => (
              <div key={i} className="loot-row loot-rare">
                <span className={`sprite-icon ${EVO_ITEMS[itemKey]?.iconClass}`}></span>
                <span>+1 {EVO_ITEMS[itemKey]?.label}</span>
                <span className="rare-badge">RARE!</span>
              </div>
            ))}
          </>
        )}
      </div>

      <button className="btn-img btn-claim-img" onClick={onClaim}>
        <img src="/assets/ui/icons/btn_claim.png" alt="Claim Rewards" />
      </button>
    </div>
  );
}

// ========== MAIN COMPONENT ==========

export default function AdventureTab({ gameState, addLog, setGameState }) {
  const adventure = useAdventure(gameState, addLog, setGameState);

  const {
    phase, quest, currentEncounter, sceneImages, selectedPets, results,
    isImageLoading, chosenChoice, choiceSuccess, rewards, errorMessage,
    togglePetSelection, openSelector, startQuest, makeChoice, claimRewards, resetAdventure,
    QUEST_COST,
  } = adventure;

  const canAfford = gameState.coins >= QUEST_COST;
  const currentEnc = quest?.encounters?.[currentEncounter];

  return (
    <div className="tab-content adventure-tab">
      {['idle', 'selecting', 'generating', 'encounter', 'resolving'].includes(phase) && (
        <div className="tab-header">
          <div className="tab-header-inner">
            <h2><span className="sprite-adv adv-vortex" style={{ width: '24px', height: '24px' }}></span> Adventure Portal</h2>
            <p className="tab-subtitle">AI-Driven RPG Adventures</p>
          </div>
        </div>
      )}

      {/* ===== IDLE ===== */}
      {phase === 'idle' && (
        <div className="portal-placeholder">
          <div className="portal-vortex">
            <span className="vortex-icon sprite-adv adv-vortex"></span>
          </div>
          <div className="portal-info">
            <h3>Enter the Arcane Portal</h3>
            <p>
              Send your pets on AI-generated RPG adventures —
              unique stories, painted scenes, and element-based challenges
              await your bravest companions.
            </p>
            <div className="portal-features">
              <div className="portal-feature">
                <span className="sprite-adv adv-scroll"></span>
                <span>Dynamic storylines</span>
              </div>
              <div className="portal-feature">
                <span className="sprite-adv adv-palette"></span>
                <span>AI-generated scenes</span>
              </div>
              <div className="portal-feature">
                <span className="sprite-adv adv-swords"></span>
                <span>Element-based combat</span>
              </div>
              <div className="portal-feature">
                <span className="sprite-adv adv-coins"></span>
                <span>Scaling rewards</span>
              </div>
            </div>
          </div>
          <button
            className={`btn-img btn-begin-img ${!canAfford ? 'disabled' : ''}`}
            onClick={openSelector}
            disabled={!canAfford}
          >
            <img src="/assets/ui/icons/prepare.png" alt="Prepare for Quest" />
          </button>
        </div>
      )}

      {/* ===== SELECTING ===== */}
      {phase === 'selecting' && (
        <div className="adventure-phase-selecting">
          <PetSelector
            gameState={gameState}
            selectedPets={selectedPets}
            togglePetSelection={togglePetSelection}
          />
          <div className="selector-actions">
            <button
              className={`btn-img btn-embark-img ${selectedPets.length === 0 ? 'disabled' : ''}`}
              onClick={startQuest}
              disabled={selectedPets.length === 0}
            >
              <img src="/assets/ui/icons/begin_quest.png" alt="Embark!" />
            </button>
          </div>
        </div>
      )}

      {/* ===== GENERATING ===== */}
      {phase === 'generating' && (
        <div className="adventure-loading">
          <div className="loading-vortex">
            <span className="vortex-icon sprite-adv adv-vortex loading-spin"></span>
          </div>
          <p className="loading-text">The portal is weaving your destiny...</p>
          <p className="loading-subtext">Generating quest & painting scenes</p>
        </div>
      )}

      {/* ===== ENCOUNTER ===== */}
      {phase === 'encounter' && currentEnc && (
        <>
          {currentEncounter === 0 && quest && (
            <div className="quest-intro card-bg bg-shop-card">
              <h3 className="quest-title">{quest.quest_title}</h3>
              <p>{quest.quest_intro}</p>
            </div>
          )}
          <EncounterView
            encounter={currentEnc}
            sceneImages={sceneImages}
            isImageLoading={isImageLoading}
            quest={quest}
            currentEncounter={currentEncounter}
            results={results}
            onChoice={makeChoice}
          />
        </>
      )}

      {/* ===== RESOLVING ===== */}
      {phase === 'resolving' && currentEnc && chosenChoice && (
        <ResolveView
          encounter={currentEnc}
          chosenChoice={chosenChoice}
          choiceSuccess={choiceSuccess}
          sceneImages={sceneImages}
          currentEncounter={currentEncounter}
        />
      )}

      {/* ===== COMPLETE ===== */}
      {phase === 'complete' && quest && rewards && (
        <QuestResults
          quest={quest}
          results={results}
          rewards={rewards}
          onClaim={claimRewards}
        />
      )}

      {/* ===== ERROR ===== */}
      {phase === 'error' && (
        <div className="adventure-error">
          <div className="error-icon">⚠️</div>
          <h3>The Portal's Magic Fizzled...</h3>
          <p className="error-message">{errorMessage}</p>
          <div className="error-actions">
            <button className="adventure-cancel-btn" onClick={resetAdventure}>
              Back to Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
