import { ELEMENT_INFO } from '../data/gameData';

export default function TopBar({ gameState, totalCoinRate }) {
  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <div className="top-bar-title">
          <span className="sprite-ui-icon icon-home"></span>
          <h1>Idle Pet Village</h1>
        </div>
        <div className="top-bar-stats">
          <div className="stat-coin">
            <span className="coin-icon"><span className="sprite-icon icon-coin"></span></span>
            <span className="coin-value">{Math.floor(gameState.coins).toLocaleString()}</span>
            <span className="coin-rate">+{totalCoinRate.toFixed(1)}/s</span>
          </div>
          <div className="stat-elements">
            {Object.entries(ELEMENT_INFO).map(([key, info]) => (
              <div key={key} className="stat-element" style={{ '--el-color': info.color }}>
                <span className={`sprite-icon ${info.iconClass}`}></span>
                <span>{gameState.elements[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
