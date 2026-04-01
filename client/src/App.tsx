import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { BriefBuilder } from './pages/BriefBuilder';
import { AITools } from './pages/AITools';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    // Single dark mode class logic wrapper root layer
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Single route renders Dashboard via Outlet composing the major views */}
              <Route index element={<Dashboard />} />
              {/* New Brief Builder Route */}
              <Route path="brief" element={<BriefBuilder />} />
              {/* AI Tools Route */}
              <Route path="ai-tools" element={<AITools />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;
