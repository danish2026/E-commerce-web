import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { LogoSpark } from '../../components/icons';
import { Button, Card, Input } from '../../components/ui';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (credentials.password !== credentials.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (credentials.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        await register(credentials.email, credentials.password);
      } else {
        await login(credentials.email, credentials.password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-secondary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(31,154,138,0.35)_0%,_rgba(5,7,9,0.95)_55%)]" />

      <div className="relative z-10 flex min-h-screen flex-col gap-8 px-4 py-10 lg:flex-row lg:gap-12 lg:px-10">
        <section className="flex w-full flex-col rounded-3xl border border-white/5 bg-white/5 p-8 text-white backdrop-blur-2xl dark:border-white/10 lg:w-1/2">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 px-4 py-2 text-sm uppercase tracking-[0.3em] text-white/80">
            <LogoSpark className="h-6 w-6 text-white" />
            Bliss Commerce
          </div>
          
          <div className="flex flex-1 flex-col items-center justify-center space-y-10 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight">Welcome to Your Store</h1>
              <p className="text-white/70">
              Sign in to track orders, manage your cart, and explore new deals. 
              </p>
            </div>    
            
            <p className="text-sm text-white/60">
              Secure SSO • SOC2 • GDPR • 99.99% uptime
            </p>
          </div>
        </section>

        <section className="flex w-full items-center justify-center lg:w-1/2">
          <Card className="w-full max-w-md space-y-8 bg-[var(--surface-1)]/90 p-8 shadow-card backdrop-blur-2xl">
            <header className="space-y-2">
              <p className="text-sm uppercase tracking-[0.4em] text-muted">
                {isRegisterMode ? 'Create account' : 'Welcome back'}
              </p>
              <h2 className="text-3xl font-semibold text-text-primary">
                {isRegisterMode ? 'Sign up for your account' : 'Access your dashboard'}
              </h2>
            </header>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                  {error}
                </div>
              )}
              <label className="space-y-1 text-sm text-text-secondary">
                Email address
                <Input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={(event) => {
                    setCredentials((prev) => ({ ...prev, email: event.target.value }));
                    setError('');
                  }}
                  placeholder="you@company.com"
                />
              </label>
              <label className="space-y-1 text-sm text-text-secondary">
                Password
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={credentials.password}
                    onChange={(event) => {
                      setCredentials((prev) => ({ ...prev, password: event.target.value }));
                      setError('');
                    }}
                    placeholder="••••••••"
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </label>
              {isRegisterMode && (
                <label className="space-y-1 text-sm text-text-secondary">
                  Confirm Password
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={credentials.confirmPassword}
                      onChange={(event) => {
                        setCredentials((prev) => ({ ...prev, confirmPassword: event.target.value }));
                        setError('');
                      }}
                      placeholder="••••••••"
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </label>
              )}
              {!isRegisterMode && (
                <div className="flex items-center justify-between text-sm text-muted">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border border-surface-2 accent-brand" />
                    Remember me
                  </label>
                  <button type="button" className="text-brand transition hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : isRegisterMode ? 'Create account' : 'Sign in'}
              </Button>
            </form>
            <footer className="text-center text-sm text-muted">
              {isRegisterMode ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setError('');
                      setCredentials({ email: '', password: '', confirmPassword: '' });
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="text-brand underline underline-offset-4 hover:no-underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError('');
                      setCredentials({ email: '', password: '', confirmPassword: '' });
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="text-brand underline underline-offset-4 hover:no-underline"
                  >
                    Create account
                  </button>
                </>
              )}
            </footer>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Login;

