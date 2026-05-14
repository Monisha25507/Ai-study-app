import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, signInWithGoogle } from '../firebase/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await signUp(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label>{label}</label>
      <div className="input-wrapper">
        <input
          type={key === 'password' || key === 'confirm' ? (showPass ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={errors[key] ? 'input-error' : ''}
        />
        {(key === 'password') && (
          <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {errors[key] && <span className="error-msg">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <Sparkles size={36} />
            <span>StudyAI</span>
          </div>
          <h2 className="auth-tagline">Start your AI<br />learning journey</h2>
          <p className="auth-sub">Join thousands of students using AI to study smarter, not harder.</p>
          <div className="auth-features">
            {['🤖 AI-powered Q&A', '📝 Smart Notes', '📄 PDF Summaries', '🧠 Quiz Generator'].map(f => (
              <div key={f} className="auth-feature-chip">{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <h2 className="form-title">Create account</h2>
          <p className="form-subtitle">Start learning smarter today</p>

          <button className="google-btn" onClick={handleGoogle} disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} />
            Continue with Google
          </button>

          <div className="divider"><span>or</span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            {field('name', 'Full Name', 'text', 'John Doe')}
            {field('email', 'Email', 'email', 'you@example.com')}
            {field('password', 'Password', 'password', '••••••••')}
            {field('confirm', 'Confirm Password', 'password', '••••••••')}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
