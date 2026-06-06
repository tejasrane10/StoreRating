import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import { API_BASE } from '../../services/api';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result?.error || 'Invalid email or password');
        return;
      }

      const roleMap = {
        ADMIN: 'admin',
        STORE_OWNER: 'storeOwner',
        USER: 'user',
      };

      dispatch(setCredentials({
        user: {
          name: result.name || data.email,
          email: data.email,
          role: roleMap[result.role] || 'user',
          avatar: null,
        },
        token: result.token,
      }));

      navigate('/');
    } catch (err) {
      setError('Unable to reach the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.brandWrap}>
          <div style={styles.logoCircle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={styles.brandName}>StoreRating</span>
        </div>
        <div style={styles.heroText}>
          <h1 style={styles.heroHeading}>Manage stores,<br />track ratings.</h1>
          <p style={styles.heroSub}>
            A unified platform for admins, store owners, and customers to rate and review stores in real time.
          </p>
        </div>
        <div style={styles.statsRow}>
          {[['1.2K+', 'Stores'], ['48K+', 'Reviews'], ['99.9%', 'Uptime']].map(([val, label]) => (
            <div key={label} style={styles.statItem}>
              <span style={styles.statVal}>{val}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Welcome back</h2>
            <p style={styles.cardSub}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
            {/* Error message */}
            {error && (
              <div style={styles.errorBanner}>
                <span style={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
                  {...register('email')}
                />
              </div>
              {errors.email && <span style={styles.errorMsg}>{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Password</label>
                <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: '44px', ...(errors.password ? styles.inputError : {}) }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={styles.eyeBtn}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span style={styles.errorMsg}>{errors.password.message}</span>}
            </div>

            {/* Remember me */}
            <div style={styles.rememberRow}>
              <label style={styles.checkLabel}>
                <input type="checkbox" style={styles.checkbox} {...register('rememberMe')} />
                <span style={styles.checkText}>Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} style={{ ...styles.submitBtn, ...(isLoading ? styles.submitBtnDisabled : {}) }}>
              {isLoading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p style={styles.signupText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.signupLink}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: '#0f172a',
  },

  // ── Left panel ──────────────────────────────────────────────
  leftPanel: {
    flex: '1 1 50%',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 60%, #1a1040 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px 56px',
    position: 'relative',
    overflow: 'hidden',
  },
  brandWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
  },
  brandName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.3px',
  },
  heroText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '40px',
  },
  heroHeading: {
    fontSize: 'clamp(32px, 4vw, 52px)',
    fontWeight: '800',
    color: '#f8fafc',
    lineHeight: '1.15',
    margin: '0 0 20px 0',
    letterSpacing: '-1px',
  },
  heroSub: {
    fontSize: '16px',
    color: '#94a3b8',
    lineHeight: '1.7',
    maxWidth: '380px',
    margin: 0,
  },
  statsRow: {
    display: 'flex',
    gap: '40px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statVal: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#a5b4fc',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },

  // ── Right panel ─────────────────────────────────────────────
  rightPanel: {
    flex: '1 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#0f172a',
    flexDirection: 'column',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#1e293b',
    borderRadius: '20px',
    padding: '44px 40px',
    border: '1px solid #334155',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
  },
  cardHeader: {
    marginBottom: '32px',
  },
  cardTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  cardSub: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },

  // ── Form ────────────────────────────────────────────────────
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 14px', backgroundColor: 'rgba(248,113,113,0.12)',
    border: '1px solid rgba(248,113,113,0.3)', borderRadius: '10px',
    color: '#f87171', fontSize: '13px', fontWeight: '500',
  },
  errorIcon: { fontSize: '14px' },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#cbd5e1',
    letterSpacing: '0.2px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: '13px',
    color: '#818cf8',
    textDecoration: 'none',
    fontWeight: '500',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#f1f5f9',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#f87171',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  errorMsg: {
    fontSize: '12px',
    color: '#f87171',
    marginTop: '2px',
  },
  rememberRow: {
    display: 'flex',
    alignItems: 'center',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#6366f1',
    cursor: 'pointer',
  },
  checkText: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'opacity 0.2s, transform 0.1s',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  spinnerWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  signupText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b',
    marginTop: '24px',
    marginBottom: 0,
  },
  signupLink: {
    color: '#818cf8',
    textDecoration: 'none',
    fontWeight: '600',
  },
};
