import React, { useState, useCallback } from 'react';

interface RegisterScreenProps {
  onRegistered: () => void;
  onGoToLogin: () => void;
}

function generateCaptcha(): { question: string; answer: number } {
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 20) + 1;
  const ops = [
    { symbol: '+', fn: (x: number, y: number) => x + y },
    { symbol: '-', fn: (x: number, y: number) => x - y },
  ];
  const op = ops[Math.floor(Math.random() * ops.length)];
  if (op.symbol === '-' && b > a) {
    [a, b] = [b, a];
  }
  return { question: `${a} ${op.symbol} ${b}`, answer: op.fn(a, b) };
}

export default function RegisterScreen({ onRegistered, onGoToLogin }: RegisterScreenProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (parseInt(captchaInput) !== captcha.answer) {
      setError('El resultado del captcha es incorrecto');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/proxy/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, fullName: fullName || undefined }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar');
      }

      setSuccess('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => onRegistered(), 1500);
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
      refreshCaptcha();
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
        <div className="login-icon">📝</div>
        <h2>Crear Cuenta</h2>
        <p className="login-subtitle">Completa tus datos para registrarte</p>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <label className="login-label">
          Nombre completo
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Tu nombre"
            autoComplete="name"
            autoFocus
            disabled={loading}
          />
        </label>

        <label className="login-label">
          Usuario
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Mínimo 3 caracteres"
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
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
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              minLength={8}
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

        <label className="login-label">
          Confirmar contraseña
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            autoComplete="new-password"
            required
            disabled={loading}
          />
        </label>

        <div className="login-captcha">
          <div className="captcha-box">
            <span className="captcha-question">¿Cuánto es <strong>{captcha.question}</strong> ?</span>
            <button type="button" className="captcha-refresh" onClick={refreshCaptcha} title="Nuevo captcha">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
          </div>
          <input
            type="number"
            value={captchaInput}
            onChange={e => setCaptchaInput(e.target.value)}
            placeholder="Resultado"
            required
            disabled={loading}
            className="captcha-input"
          />
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Registrando...' : 'Crear Cuenta'}
        </button>

        <div className="login-footer-link">
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={onGoToLogin} className="login-link-btn">
            Inicia sesión
          </button>
        </div>
      </form>
    </div>
  );
}
