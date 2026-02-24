import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/services';
import { setCredentials } from '../store/slices/authSlice';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
        setLoading(true); setError('');
        try {
            const { data } = await authApi.register(form);
            dispatch(setCredentials({
                user: { userId: data.userId, name: data.name, email: data.email, role: data.role },
                accessToken: data.accessToken,
            }));
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h1 className="auth-title">Create account ✨</h1>
                <p className="auth-subtitle">Join ShopNest and start shopping today</p>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" type="text" required
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="John Doe" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" required
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="you@example.com" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" required minLength={8}
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="Min. 8 characters" />
                    </div>
                    <button className="btn btn-primary w-full mt-4" type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                <p className="text-sm text-muted mt-4" style={{ textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-light)' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
