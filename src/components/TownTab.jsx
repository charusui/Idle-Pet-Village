import { UPGRADES, EVO_ITEMS, EVO_ITEM_COST, getUpgradeCost } from '../data/gameData';

export default function TownTab({ gameState, buyUpgrade, buyEvoItem }) {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <div className="tab-header-inner">
          <h2><img src="/assets/ui/icons/icon_market.png?v=2" alt="" className="header-icon" /> Town Market</h2>
          <p className="tab-subtitle">Upgrade your village & buy supplies</p>
        </div>
      </div>

      <div className="town-grid">
        {/* Upgrades */}
        <div className="town-section card-bg bg-shop-card">
          <h3 className="section-title"><span className="sprite-ui-icon icon-farm-tools"></span> Upgrades</h3>
          <div className="shop-list">
            {Object.entries(UPGRADES).map(([key, upg]) => {
              const currentLevel = gameState.upgrades[key].level;
              const cost = getUpgradeCost(key, currentLevel);
              const canAfford = gameState.coins >= cost;

              return (
                <div key={key} className="shop-item" id={`upgrade-${key}`}>
                  <div className="shop-item-icon"><span className={`sprite-ui-icon ${upg.iconClass}`}></span></div>
                  <div className="shop-item-info">
                    <h4>{upg.label} <span className="shop-level">Lv.{currentLevel}</span></h4>
                    <p className="shop-desc">{upg.description}</p>
                  </div>
                  <button
                    className={`btn btn-buy ${canAfford ? '' : 'btn-disabled'}`}
                    onClick={() => buyUpgrade(key)}
                    disabled={!canAfford}
                  >
                    <span className="sprite-icon icon-coin"></span> {cost.toLocaleString()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evo Items */}
        <div className="town-section card-bg bg-shop-card">
          <h3 className="section-title"><span className="sprite-ui-icon icon-star"></span> Evolution Items</h3>
          <div className="shop-list">
            {Object.entries(EVO_ITEMS).map(([key, item]) => {
              const owned = gameState.inventory[key];
              const canAfford = gameState.coins >= EVO_ITEM_COST;

              return (
                <div key={key} className="shop-item" id={`evo-item-${key}`}>
                  <div className="shop-item-icon"><span className={`sprite-icon ${item.iconClass}`}></span></div>
                  <div className="shop-item-info">
                    <h4>{item.label} <span className="shop-owned">×{owned}</span></h4>
                    <p className="shop-desc">Required for {item.element} evolution</p>
                  </div>
                  <button
                    className={`btn btn-buy ${canAfford ? '' : 'btn-disabled'}`}
                    onClick={() => buyEvoItem(key)}
                    disabled={!canAfford}
                  >
                    <span className="sprite-icon icon-coin"></span> {EVO_ITEM_COST.toLocaleString()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
