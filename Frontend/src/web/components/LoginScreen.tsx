import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (role: string) => void;
  onGoToRegister: () => void;
}

export default function LoginScreen({ onLogin, onGoToRegister }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Credenciales inválidas');
      }

      const data = await res.json();
      onLogin(data.role || 'User');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <span className="login-brand-icon">⚡</span>
        <h1>Gestión de Tareas</h1>
      </div>
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">🔐</div>
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Ingresa tus credenciales para acceder</p>

        {error && <div className="login-error">{error}</div>}

        <label className="login-label">
          Usuario
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="usuario"
            autoComplete="username"
            autoFocus
            required
            disabled={loading}
          />
        </label>

        <label className="login-label">
          Contraseña
          <div className="login-password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="login-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </label>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Verificando...' : 'Ingresar'}
        </button>

        <div className="login-footer-link">
          ¿No tienes cuenta?{' '}
          <button type="button" onClick={onGoToRegister} className="login-link-btn">
            Regístrate aquí
          </button>
        </div>
      </form>
    </div>
  );
}
