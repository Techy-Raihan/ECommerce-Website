import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { authApi } from '../../api/services';

export default function Navbar() {
    const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
    const cartCount = useSelector((s: RootState) => s.cart.itemCount);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { await authApi.logout(); } catch { }
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">🛍 ShopNest</Link>
            <div className="navbar-links">
                <Link to="/products" className="nav-link">Products</Link>
                {isAuthenticated && <Link to="/orders" className="nav-link">Orders</Link>}
                {user?.role === 'ADMIN' && <Link to="/admin" className="nav-link">Admin</Link>}
                {isAuthenticated ? (
                    <>
                        <span className="nav-link" style={{ color: 'var(--text-muted)' }}>Hi, {user?.name?.split(' ')[0]}</span>
                        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                    </>
                )}
                {isAuthenticated && (
                    <Link to="/cart" className="nav-cart-btn">
                        🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                )}
            </div>
        </nav>
    );
}
