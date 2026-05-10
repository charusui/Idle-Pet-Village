export default function ToastLog({ logs }) {
  return (
    <div className="toast-container" id="toast-log">
      {logs.map((log) => {
        const text = log.msg.replace(/^(⬆️|🛒|🎉|💰|✨|💎|🚀|📦|🔄)\s*/, '');
        return (
          <div key={log.id} className="toast-item card-bg bg-toast" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/assets/ui/icons/blue_exclamation.png" alt="!" style={{ width: '20px', height: '24px', objectFit: 'contain', filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))' }} />
            <span>{text}</span>
          </div>
        );
      })}
    </div>
  );
}
