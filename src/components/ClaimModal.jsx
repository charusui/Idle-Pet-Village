import PetVideo from './PetVideo';
import { ELEMENT_INFO, EVO_ITEMS } from '../data/gameData';

export default function ClaimModal({ data, onConfirm }) {
  if (!data) return null;

  const elInfo = ELEMENT_INFO[data.elementType];

  return (
    <div className="modal-overlay" id="claim-modal">
      <div className="modal-content claim-modal card-bg bg-modal">
        <div className="modal-glow" style={{ '--glow-color': elInfo.color }}></div>
        <h2><span className="sprite-ui-icon icon-crate"></span> Expedition Complete!</h2>

        <div className="claim-pet">
          <PetVideo species={data.pet.species} stage={data.pet.stage} size={160} />
          <p className="claim-pet-name">{data.pet.name} has returned!</p>
        </div>

        <div className="claim-loot">
          <div className="claim-loot-item">
            <span className="claim-loot-icon"><span className={`sprite-icon ${elInfo.iconClass}`}></span></span>
            <span className="claim-loot-amount">+{data.elementsGained} {elInfo.label} Elements</span>
          </div>
          {data.bonusItem && (
            <div className="claim-loot-item claim-loot-rare">
              <span className="claim-loot-icon"><span className={`sprite-icon ${EVO_ITEMS[data.bonusItem].iconClass}`}></span></span>
              <span className="claim-loot-amount">+1 {EVO_ITEMS[data.bonusItem].label}</span>
              <span className="rare-badge">RARE!</span>
            </div>
          )}
        </div>

        <button className="btn-img btn-claim-img" onClick={onConfirm} id="claim-confirm-btn">
          <img src="/assets/ui/icons/btn_claim.png" alt="Claim" />
        </button>
      </div>
    </div>
  );
}
