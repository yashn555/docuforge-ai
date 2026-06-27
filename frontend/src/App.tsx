import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Setup } from './pages/Setup';
import { Preview } from './pages/Preview'; // NEW
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';

function App() {
  console.log('App rendering...');
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/preview" element={<Preview />} /> {/* NEW */}
            {/* Catch-all for debugging */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Page not found</p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="btn-primary"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;