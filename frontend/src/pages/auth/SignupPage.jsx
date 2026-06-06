import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/authSlice';
import { API_BASE } from '../../services/api';

const schema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Password strength checker
function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '#334155' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#f87171' };
  if (score <= 3) return { score, label: 'Fair', color: '#fb923c' };
  if (score === 4) return { score, label: 'Good', color: '#facc15' };
  return { score, label: 'Strong', color: '#4ade80' };
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
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
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'USER', // Default to USER role
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result?.error || 'Registration failed');
        return;
      }

      dispatch(setCredentials({
        user: {
          name: result.name || data.name,
          email: data.email,
          role: result.role || 'USER',
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

  const strength = getStrength(passwordVal);

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
          <h1 style={styles.heroHeading}>Join the<br />platform today.</h1>
          <p style={styles.heroSub}>
            Create your account and start managing stores, submitting ratings, and tracking performance — all in one place.
          </p>
        </div>

        <div style={styles.featureList}>
          {[
            ['Real-time store ratings', 'Get live feedback from customers instantly.'],
            ['Role-based dashboards', 'Tailored views for admins, owners & users.'],
            ['Secure & private', 'Your data is encrypted and never shared.'],
          ].map(([title, desc]) => (
            <div key={title} style={styles.featureItem}>
              <div style={styles.featureDot} />
              <div>
                <div style={styles.featureTitle}>{title}</div>
                <div style={styles.featureDesc}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Create account</h2>
            <p style={styles.cardSub}>Fill in the details below to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
            {/* Error message */}
            {error && (
              <div style={styles.errorBanner}>
                <span style={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            <Field label="Full Name" error={errors.name?.message} hint="20–60 characters">
              <InputWithIcon
                icon={<PersonIcon />}
                type="text"
                placeholder="e.g. Jonathan Alexander Smith"
                hasError={!!errors.name}
                {...register('name')}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" error={errors.email?.message}>
              <InputWithIcon
                icon={<MailIcon />}
                type="email"
                placeholder="you@example.com"
                hasError={!!errors.email}
                {...register('email')}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password?.message} hint="6+ chars · 1 uppercase · 1 special char">
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}><LockIcon /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: '44px', ...(errors.password ? styles.inputError : {}) }}
                  {...register('password', {
                    onChange: (e) => setPasswordVal(e.target.value),
                  })}
                />
                <EyeToggle show={showPassword} onToggle={() => setShowPassword(p => !p)} />
              </div>
              {/* Strength bar */}
              {passwordVal && (
                <div style={styles.strengthWrap}>
                  <div style={styles.strengthBarTrack}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.strengthSegment,
                          backgroundColor: i <= strength.score ? strength.color : '#1e293b',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirmPassword?.message}>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}><LockIcon /></span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: '44px', ...(errors.confirmPassword ? styles.inputError : {}) }}
                  {...register('confirmPassword')}
                />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(p => !p)} />
              </div>
            </Field>

            <button
              type="submit"
              disabled={isLoading}
              style={{ ...styles.submitBtn, ...(isLoading ? styles.submitBtnDisabled : {}) }}
            >
              {isLoading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={styles.loginText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.loginLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function Field({ label, error, hint, children }) {
  return (
    <div style={styles.fieldGroup}>
      <div style={styles.labelRow}>
        <label style={styles.label}>{label}</label>
        {hint && <span style={styles.hint}>{hint}</span>}
      </div>
      {children}
      {error && <span style={styles.errorMsg}>{error}</span>}
    </div>
  );
}

import { forwardRef } from 'react';
const InputWithIcon = forwardRef(function InputWithIcon({ icon, hasError, ...props }, ref) {
  return (
    <div style={styles.inputWrap}>
      <span style={styles.inputIcon}>{icon}</span>
      <input
        ref={ref}
        style={{ ...styles.input, ...(hasError ? styles.inputError : {}) }}
        {...props}
      />
    </div>
  );
});

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} style={styles.eyeBtn} aria-label={show ? 'Hide' : 'Show'}>
      {show ? (
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
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
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
    flex: '1 1 45%',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 60%, #1a1040 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px 56px',
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
    paddingBottom: '20px',
  },
  heroHeading: {
    fontSize: 'clamp(30px, 3.5vw, 48px)',
    fontWeight: '800',
    color: '#f8fafc',
    lineHeight: '1.15',
    margin: '0 0 20px 0',
    letterSpacing: '-1px',
  },
  heroSub: {
    fontSize: '15px',
    color: '#94a3b8',
    lineHeight: '1.7',
    maxWidth: '360px',
    margin: 0,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingBottom: '8px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  featureDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    marginTop: '5px',
    flexShrink: 0,
    boxShadow: '0 0 8px rgba(99,102,241,0.5)',
  },
  featureTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '2px',
  },
  featureDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
  },

  // ── Right panel ─────────────────────────────────────────────
  rightPanel: {
    flex: '1 1 55%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#0f172a',
    overflowY: 'auto',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#1e293b',
    borderRadius: '20px',
    padding: '44px 40px',
    border: '1px solid #334155',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
  },
  cardHeader: {
    marginBottom: '28px',
  },
  cardTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 6px 0',
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
    gap: '18px',
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
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#cbd5e1',
    letterSpacing: '0.2px',
  },
  hint: {
    fontSize: '11px',
    color: '#475569',
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
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#f1f5f9',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    lineHeight: '1.6',
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
  },

  // ── Strength bar ─────────────────────────────────────────────
  strengthWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '6px',
  },
  strengthBarTrack: {
    display: 'flex',
    gap: '4px',
    flex: 1,
  },
  strengthSegment: {
    flex: 1,
    height: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  strengthLabel: {
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '40px',
    textAlign: 'right',
  },

  // ── Submit ───────────────────────────────────────────────────
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
  loginText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b',
    marginTop: '22px',
    marginBottom: 0,
  },
  loginLink: {
    color: '#818cf8',
    textDecoration: 'none',
    fontWeight: '600',
  },
};
