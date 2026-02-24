import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { orderApi } from '../api/services';
import { Order } from '../types';

export default function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const message = (location.state as any)?.message;

    useEffect(() => {
        orderApi.getOrders().then(r => setOrders(r.data)).finally(() => setLoading(false));
    }, []);

    const statusClass = (s: string) => `order-status status-${s.toLowerCase()}`;

    if (loading) return <div className="spinner" />;

    return (
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
            <div className="page-header">
                <h1 className="page-title">Order History</h1>
                <p className="page-subtitle">Track and manage your orders</p>
            </div>
            {message && <div className="alert alert-success">{message}</div>}
            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-title">No orders yet</div>
                    <p>Once you place an order, it will appear here.</p>
                </div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="card order-card">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>Order #{order.id?.substring(0, 8).toUpperCase()}</div>
                                <div className="text-sm text-muted">{new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                            <div className="text-right">
                                <span className={statusClass(order.status)}>{order.status}</span>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-light)', marginTop: 8 }}>${order.totalPrice?.toFixed(2)}</div>
                            </div>
                        </div>
                        <hr className="divider" />
                        <div style={{ marginTop: 16 }}>
                            {order.items?.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-sm mb-4">
                                    <span>{it.productName} <span className="text-muted">×{it.quantity}</span></span>
                                    <span>${(it.price * it.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        {order.shippingAddress && (
                            <div className="text-sm text-muted mt-4">📮 {order.shippingAddress}</div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
