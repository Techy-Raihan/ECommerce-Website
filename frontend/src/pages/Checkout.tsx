import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { orderApi, paymentApi, cartApi } from '../api/services';
import { clearCartState } from '../store/slices/cartSlice';
import { RootState } from '../store';

export default function Checkout() {
    const cart = useSelector((s: RootState) => s.cart.cart);
    const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
    const [paymentMethod, setPaymentMethod] = useState('CARD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cart || cart.items.length === 0) { setError('Your cart is empty'); return; }
        setLoading(true); setError('');
        try {
            const shippingAddress = `${address.street}, ${address.city}, ${address.state} ${address.pincode}`;
            const orderItems = cart.items.map(i => ({
                productId: i.productId, productName: i.productName,
                quantity: i.quantity, price: i.price, imageUrl: i.imageUrl,
            }));
            const { data: order } = await orderApi.createOrder({ shippingAddress, items: orderItems });
            // Initiate payment
            await paymentApi.initiate({ orderId: order.id, amount: cart.totalPrice, paymentMethod });
            // Simulate payment success
            await paymentApi.simulateSuccess(order.id);
            // Clear cart
            await cartApi.clearCart();
            dispatch(clearCartState());
            navigate('/orders', { state: { message: '🎉 Order placed successfully!' } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally { setLoading(false); }
    };

    if (!cart || cart.items.length === 0) {
        navigate('/cart'); return null;
    }

    return (
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
            <div className="page-header">
                <h1 className="page-title">Checkout</h1>
                <p className="page-subtitle">Complete your order</p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="cart-layout">
                <form onSubmit={handlePlaceOrder}>
                    <div className="card" style={{ padding: 32, marginBottom: 24 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 24 }}>📮 Shipping Address</h3>
                        <div className="form-group">
                            <label className="form-label">Street Address</label>
                            <input className="form-input" required value={address.street}
                                onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="123 Main St" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input className="form-input" required value={address.city}
                                    onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="New York" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input className="form-input" required value={address.state}
                                    onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="NY" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">PIN / ZIP Code</label>
                            <input className="form-input" required value={address.pincode}
                                onChange={e => setAddress({ ...address, pincode: e.target.value })} placeholder="10001" />
                        </div>
                    </div>
                    <div className="card" style={{ padding: 32, marginBottom: 24 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 24 }}>💳 Payment Method</h3>
                        {['CARD', 'UPI', 'NET_BANKING', 'WALLET'].map(m => (
                            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
                                <input type="radio" name="payment" value={m} checked={paymentMethod === m}
                                    onChange={() => setPaymentMethod(m)} />
                                <span>{m === 'CARD' ? '💳 Credit/Debit Card' : m === 'UPI' ? '📱 UPI' : m === 'NET_BANKING' ? '🏦 Net Banking' : '👛 Wallet'}</span>
                            </label>
                        ))}
                        <p className="text-sm text-muted" style={{ marginTop: 8 }}>
                            ℹ️ Payment is simulated — no real charges will be made.
                        </p>
                    </div>
                    <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
                        {loading ? '⏳ Placing Order...' : `🛍 Place Order · $${cart.totalPrice?.toFixed(2)}`}
                    </button>
                </form>
                <div className="card order-summary-card">
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
                    {cart.items.map(i => (
                        <div key={i.id} className="flex justify-between text-sm mb-4">
                            <span className="text-muted">{i.productName} ×{i.quantity}</span>
                            <span>${i.subtotal?.toFixed(2)}</span>
                        </div>
                    ))}
                    <hr className="divider" />
                    <div className="flex justify-between font-bold" style={{ fontSize: '1.2rem' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--accent-light)' }}>${cart.totalPrice?.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
