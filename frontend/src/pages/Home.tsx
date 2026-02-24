import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Home() {
    const { isAuthenticated } = useSelector((s: RootState) => s.auth);
    return (
        <div>
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Shop the Future,<br />Today.</h1>
                    <p className="hero-subtitle">
                        Discover thousands of premium products with lightning-fast delivery,
                        secure payments, and an experience that redefines online shopping.
                    </p>
                    <div className="hero-actions">
                        <Link to="/products" className="btn btn-primary btn-lg">Browse Products →</Link>
                        {!isAuthenticated && <Link to="/register" className="btn btn-secondary btn-lg">Create Account</Link>}
                    </div>
                </div>
            </section>

            <section style={{ padding: '64px 0', background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 40, textAlign: 'center' }}>
                        Why ShopNest?
                    </h2>
                    <div className="grid-3">
                        {[
                            { icon: '⚡', title: 'Lightning Fast', desc: 'Microservices architecture ensures blazing fast response times and near-zero downtime.' },
                            { icon: '🔒', title: 'Secure Payments', desc: 'JWT-authenticated checkout with simulated payment gateway and order confirmation.' },
                            { icon: '📦', title: 'Real-Time Inventory', desc: 'Kafka-powered events auto-deduct stock on payment and send instant notifications.' },
                        ].map((f) => (
                            <div key={f.title} className="card" style={{ padding: 32, textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 16 }}>{f.icon}</div>
                                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '64px 0' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>Ready to Shop?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Join thousands of happy shoppers today.</p>
                    <Link to="/products" className="btn btn-primary btn-lg">Explore All Products</Link>
                </div>
            </section>
        </div>
    );
}
