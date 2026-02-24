import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { cartApi } from '../api/services';
import { setCart } from '../store/slices/cartSlice';
import { RootState } from '../store';

export default function Cart() {
    const cart = useSelector((s: RootState) => s.cart.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        cartApi.getCart().then(r => dispatch(setCart(r.data))).catch(() => { });
    }, []);

    const handleRemove = async (itemId: number) => {
        const { data } = await cartApi.removeItem(itemId);
        dispatch(setCart(data));
    };

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container" style={{ paddingTop: 40 }}>
                <div className="empty-state">
                    <div className="empty-state-icon">🛒</div>
                    <div className="empty-state-title">Your cart is empty</div>
                    <p>Looks like you haven't added anything yet.</p>
                    <button className="btn btn-primary mt-6" onClick={() => navigate('/products')}>Browse Products</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
            <div className="page-header">
                <h1 className="page-title">Your Cart</h1>
                <p className="page-subtitle">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="cart-layout">
                <div className="card">
                    {cart.items.map(item => (
                        <div key={item.id} className="cart-item">
                            {item.imageUrl
                                ? <img className="cart-item-img" src={item.imageUrl} alt={item.productName} />
                                : <div className="cart-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--bg-elevated)' }}>🛍</div>
                            }
                            <div className="cart-item-details">
                                <div className="cart-item-name">{item.productName}</div>
                                <div className="cart-item-price">${item.price?.toFixed(2)} × {item.quantity}</div>
                                <div className="text-sm text-muted">Subtotal: ${item.subtotal?.toFixed(2)}</div>
                            </div>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.id)}>Remove</button>
                        </div>
                    ))}
                </div>
                <div className="card order-summary-card">
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
                    {cart.items.map(i => (
                        <div key={i.id} className="flex justify-between text-sm mb-4">
                            <span className="text-muted">{i.productName} ×{i.quantity}</span>
                            <span>${i.subtotal?.toFixed(2)}</span>
                        </div>
                    ))}
                    <hr className="divider" />
                    <div className="flex justify-between font-bold" style={{ fontSize: '1.2rem', marginBottom: 24 }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--accent-light)' }}>${cart.totalPrice?.toFixed(2)}</span>
                    </div>
                    <button className="btn btn-primary w-full btn-lg" onClick={() => navigate('/checkout')}>
                        Proceed to Checkout →
                    </button>
                </div>
            </div>
        </div>
    );
}
