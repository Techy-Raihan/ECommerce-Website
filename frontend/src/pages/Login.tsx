import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/services';
import { setCredentials } from '../store/slices/authSlice';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const { data } = await authApi.login(form);
            localStorage.setItem('refreshToken', data.accessToken); // store for demo
            dispatch(setCredentials({
                user: { userId: data.userId, name: data.name, email: data.email, role: data.role },
                accessToken: data.accessToken,
            }));
            navigate(data.role === 'ADMIN' ? '/admin' : '/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h1 className="auth-title">Welcome back 👋</h1>
                <p className="auth-subtitle">Sign in to your ShopNest account</p>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" required
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="you@example.com" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" required
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••" />
                    </div>
                    <button className="btn btn-primary w-full mt-4" type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p className="text-sm text-muted mt-4" style={{ textAlign: 'center' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-light)' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
