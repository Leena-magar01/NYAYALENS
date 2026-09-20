import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, LogIn, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from './UIComponents';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-nyaya-950 tracking-tight">
          <div className="p-2 bg-nyaya-900 text-white rounded-lg shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <span className="flex items-center gap-1.5">
            Nyaya<span className="text-nyaya-600 font-extrabold">Lens</span>
          </span>
        </Link>

        {/* Public Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-nyaya-900 transition-colors">Home</Link>
          <a href="#features" className="hover:text-nyaya-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-nyaya-900 transition-colors">How It Works</a>
          <Link to="/disclaimer" className="hover:text-nyaya-900 transition-colors flex items-center gap-1">
            <Shield className="w-4 h-4 text-slate-400" />
            Legal Disclaimer
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
