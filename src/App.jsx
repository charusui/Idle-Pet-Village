import useGameState from './hooks/useGameState';
import TopBar from './components/TopBar';
import WorldMap from './components/WorldMap';
import FarmTab from './components/FarmTab';
import TownTab from './components/TownTab';
import SanctuaryTab from './components/SanctuaryTab';
import ExpeditionTab from './components/ExpeditionTab';
import AdventureTab from './components/AdventureTab';
import ClaimModal from './components/ClaimModal';
import RenameModal from './components/RenameModal';
import ToastLog from './components/ToastLog';
import './index.css';

function App() {
  const {
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
  } = useGameState();

  const renderTab = () => {
    switch (activeTab) {
      case 'farm':
        return (
          <FarmTab 
            gameState={gameState} 
            renamePet={renamePet} 
            toggleFavoritePet={toggleFavoritePet} 
            setRenameModalPet={setRenameModalPet}
          />
        );
      case 'town':
        return <TownTab gameState={gameState} buyUpgrade={buyUpgrade} buyEvoItem={buyEvoItem} />;
      case 'sanctuary':
        return <SanctuaryTab gameState={gameState} evolvePet={evolvePet} />;
      case 'expedition':
        return (
          <ExpeditionTab
            gameState={gameState}
            activeZone={activeZone}
            setActiveZone={setActiveZone}
            exploreZone={exploreZone}
            sendOnExpedition={sendOnExpedition}
            claimExpedition={claimExpedition}
          />
        );
      case 'ai_portal':
        return <AdventureTab gameState={gameState} addLog={addLog} setGameState={setGameState} />;
      default:
        return (
          <FarmTab 
            gameState={gameState} 
            renamePet={renamePet} 
            toggleFavoritePet={toggleFavoritePet} 
            setRenameModalPet={setRenameModalPet}
          />
        );
    }
  };

  return (
    <div className="app">
      <TopBar gameState={gameState} totalCoinRate={totalCoinRate} />

      <main className="main-content">
        <WorldMap
          navigatePin={navigatePin}
          activeTab={activeTab}
          activeZone={activeZone}
        />
        {activeTab !== 'map' && (
          <div className="tab-container-overlay">
            <div className="tab-container">
              <button className="back-to-map" onClick={() => setActiveTab('map')}>
                ⬅ Back to Map
              </button>
              {renderTab()}
            </div>
          </div>
        )}
      </main>

      <button className="reset-btn" onClick={resetGame} title="Reset Game" id="reset-btn">
        <span className="sprite-adv adv-refresh"></span>
      </button>

      <ClaimModal data={claimModalData} onConfirm={confirmClaim} />
      <RenameModal 
        pet={renameModalPet} 
        onConfirm={(id, name) => {
          renamePet(id, name);
          setRenameModalPet(null);
        }} 
        onCancel={() => setRenameModalPet(null)} 
      />
      <ToastLog logs={logs} />
    </div>
  );
}

export default App;
