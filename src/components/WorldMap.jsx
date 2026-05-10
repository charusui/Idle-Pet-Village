import { MAP_PINS } from '../data/gameData';

export default function WorldMap({ navigatePin, activeTab, activeZone }) {
  const isZoomed = activeTab !== 'map';
  let zoomStyle = {};
  if (isZoomed) {
    const activePin = Object.values(MAP_PINS).find(pin => 
      (pin.zone && activeTab === 'expedition' && activeZone === pin.zone) ||
      (!pin.zone && activeTab === pin.tab)
    );
    if (activePin) {
      const offsetX = activePin.offsetX || 0;
      const offsetY = activePin.offsetY || 0;
      zoomStyle = {
        transform: `scale(2.5) translate(${50 - activePin.left + offsetX}%, ${50 - activePin.top + offsetY}%)`,
        transformOrigin: '50% 50%',
      };
    }
  }

  return (
    <div className={`world-map-outer-container ${isZoomed ? 'zoomed' : ''}`}>
      <div className="world-map-container">
        <div className="world-map-zoom-wrapper" style={zoomStyle}>
          <img
            src="/assets/Map.png"
            alt="Idle Pet Village World Map"
            className="world-map-img"
            draggable={false}
          />
          {Object.entries(MAP_PINS).map(([key, pin]) => {
            const isActive =
              (pin.zone && activeTab === 'expedition' && activeZone === pin.zone) ||
              (!pin.zone && activeTab === pin.tab);

            return (
              <button
                key={key}
                id={`map-pin-${key}`}
                className={`map-pin ${pin.special ? 'map-pin-portal' : ''} ${isActive ? 'map-pin-active' : ''}`}
                style={{ top: `${pin.top}%`, left: `${pin.left}%` }}
                onClick={() => navigatePin(key, pin)}
                title={pin.label}
              >
                <span className={`sprite-pin ${pin.iconClass}`}></span>
                <span className="map-pin-label">{pin.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
