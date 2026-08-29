import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register Service Worker for Android PWA and offline support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('Catharsis Matrix SW registered successfully:', reg.scope);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Catharsis Matrix: New content available offline.');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.debug('SW registration note:', err);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050a14] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif text-3xl font-bold mb-4 shadow-lg">
            ✧
          </div>
          <h1 className="text-xl font-serif font-bold text-amber-400 mb-2">
            Связь с пространством восстанавливается
          </h1>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Произошло временное прерывание потока данных. Нажмите кнопку ниже для быстрой перезагрузки интерфейса матрицы.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('chubuk_matrix_data');
                } catch (e) {}
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-lg transition-all cursor-pointer"
            >
              Перезапустить
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-all cursor-pointer"
            >
              Попробовать снова
            </button>
          </div>
          {this.state.error && (
            <pre className="mt-8 p-3 rounded-lg bg-black/60 border border-red-500/30 text-red-400 text-[10px] max-w-lg text-left overflow-auto max-h-36">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);