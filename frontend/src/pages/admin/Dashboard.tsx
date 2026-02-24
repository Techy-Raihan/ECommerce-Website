import { useEffect, useState } from 'react';
import { adminApi, productApi, orderApi } from '../../api/services';
import { DashboardStats, Order, Product } from '../../types';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products'>('dashboard');

    useEffect(() => {
        Promise.all([
            adminApi.getDashboard(),
        ]).then(([s]) => {
            setStats(s.data);
        }).finally(() => setLoading(false));
    }, []);

    const statCards = stats ? [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
        { label: 'Total Products', value: stats.totalProducts, icon: '📦' },
        { label: 'Total Orders', value: stats.totalOrders, icon: '📋' },
        { label: 'Revenue', value: `$${stats.totalRevenue?.toLocaleString()}`, icon: '💰' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳' },
    ] : [];

    if (loading) return <div className="spinner" />;

    return (
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Manage your store</p>
            </div>

            <div className="category-pills" style={{ marginBottom: 32 }}>
                {(['dashboard', 'orders', 'products'] as const).map(tab => (
                    <button key={tab} className={`category-pill ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'dashboard' ? '📊 Overview' : tab === 'orders' ? '📋 Orders' : '📦 Products'}
                    </button>
                ))}
            </div>

            {activeTab === 'dashboard' && (
                <>
                    <div className="stats-grid">
                        {statCards.map(s => (
                            <div key={s.label} className="stat-card">
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="card" style={{ padding: 32 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🏗 System Architecture</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                            {[
                                { name: 'Eureka Server', port: 8761, status: '🟢' },
                                { name: 'API Gateway', port: 8080, status: '🟢' },
                                { name: 'Auth Service', port: 8081, status: '🟢' },
                                { name: 'User Service', port: 8082, status: '🟢' },
                                { name: 'Product Service', port: 8083, status: '🟢' },
                                { name: 'Cart Service', port: 8084, status: '🟢' },
                                { name: 'Order Service', port: 8085, status: '🟢' },
                                { name: 'Payment Service', port: 8086, status: '🟢' },
                                { name: 'Inventory Service', port: 8087, status: '🟢' },
                                { name: 'Notification Service', port: 8088, status: '🟢' },
                                { name: 'Admin Service', port: 8089, status: '🟢' },
                            ].map(svc => (
                                <div key={svc.name} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{svc.status} {svc.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>:{svc.port}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'orders' && (
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>All Orders</h3>
                    <p className="text-muted">Order management functionality is connected to the Order Service API.</p>
                    <p className="text-sm text-muted" style={{ marginTop: 8 }}>
                        Use <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>PUT /api/orders/:id/status</code> to update order status.
                    </p>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Product Management</h3>
                    <p className="text-muted">Create, update, and delete products via the Product Service API (admin role required).</p>
                    <p className="text-sm text-muted" style={{ marginTop: 8 }}>
                        Endpoints: <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>POST /api/products</code>,
                        <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>POST /api/categories</code>
                    </p>
                </div>
            )}
        </div>
    );
}
