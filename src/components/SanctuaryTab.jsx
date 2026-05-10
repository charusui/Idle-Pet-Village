import PetVideo from './PetVideo';
import {
  PETS_DATA, ELEMENT_INFO, ELEMENT_EVO_ITEM, EVO_ITEMS,
  EVOLUTION_ELEMENTS_REQUIRED, EVOLUTION_ITEMS_REQUIRED,
} from '../data/gameData';

export default function SanctuaryTab({ gameState, evolvePet }) {
  const maxLevelPets = gameState.pets.filter(
    p => p.status === 'farm' && p.level >= p.maxLevel && p.stage < 2
  );

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-inner">
          <h2>
            <span className="sprite-pin pin-sanct header-pin"></span> Sanctuary
          </h2>
          <p className="tab-subtitle">Evolve max-level pets into powerful forms</p>
        </div>
      </div>

      {maxLevelPets.length === 0 ? (
        <div className="empty-state">
          <span className="sprite-ui-icon icon-star" style={{ width: '48px', height: '48px' }}></span>
          <p>No pets ready for evolution. Level a pet to max first!</p>
        </div>
      ) : (
        <div className="sanctuary-grid">
          {maxLevelPets.map(pet => {
            const petData = PETS_DATA[pet.species];
            if (!petData) return null;

            const element = petData.element;
            const evoItemKey = ELEMENT_EVO_ITEM[element];
            const elInfo = ELEMENT_INFO[element];

            const hasElements = gameState.elements[element] >= EVOLUTION_ELEMENTS_REQUIRED;
            const hasItem = gameState.inventory[evoItemKey] >= EVOLUTION_ITEMS_REQUIRED;
            const canEvolve = hasElements && hasItem;

            const nextName = petData.evos[pet.stage] || '???';

            return (
              <div key={pet.id} className="sanctuary-card card-bg bg-sanctuary-card" id={`sanctuary-${pet.id}`}>
                <div className="sanctuary-evo-row">
                  <div className="sanctuary-before">
                    <PetVideo species={pet.species} stage={pet.stage} size={110} />
                    <span className="sanctuary-pet-name">{pet.name}</span>
                  </div>

                  <div className="sanctuary-arrow"><img src="/assets/ui/icons/arrow.png?v=2" alt="evolve arrow" /></div>

                  <div className="sanctuary-after">
                    <PetVideo species={pet.species} stage={pet.stage + 1} size={110} />
                    <span className="sanctuary-pet-name sanctuary-new-name">{nextName}</span>
                  </div>
                </div>

                <div className="sanctuary-requirements">
                  <div
                    className={`req ${hasElements ? 'req-met' : 'req-unmet'}`}
                    data-tooltip={`Send pets on expeditions to collect ${elInfo.label} Elements`}
                  >
                    <span className={`sprite-icon ${elInfo.iconClass}`}></span> {gameState.elements[element]}/{EVOLUTION_ELEMENTS_REQUIRED}
                  </div>
                  <div
                    className={`req ${hasItem ? 'req-met' : 'req-unmet'}`}
                    data-tooltip={`Buy ${EVO_ITEMS[evoItemKey].label} in the Town Market for 1,000 coins`}
                  >
                    <span className={`sprite-icon ${EVO_ITEMS[evoItemKey].iconClass}`}></span> {gameState.inventory[evoItemKey]}/{EVOLUTION_ITEMS_REQUIRED}
                  </div>
                </div>

                <button
                  className={`btn-img ${canEvolve ? '' : 'btn-disabled'}`}
                  onClick={() => evolvePet(pet.id)}
                  disabled={!canEvolve}
                >
                  <img src="/assets/ui/icons/btn_evolve.png?v=2" alt="Evolve Now!" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
