import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, cartApi } from '../api/services';
import { Product } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../store/slices/cartSlice';
import { RootState } from '../store';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const { isAuthenticated } = useSelector((s: RootState) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        productApi.getById(Number(id)).then(r => setProduct(r.data)).finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!product) return;
        setAdding(true);
        try {
            const { data } = await cartApi.addItem({
                productId: product.id, productName: product.name,
                price: product.price, quantity: qty,
                imageUrl: product.imageUrls?.[0] || '',
            });
            dispatch(setCart(data));
            navigate('/cart');
        } finally { setAdding(false); }
    };

    if (loading) return <div className="spinner" />;
    if (!product) return <div className="container"><p>Product not found.</p></div>;

    return (
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
            <button className="btn btn-secondary btn-sm mb-4" onClick={() => navigate(-1)}>← Back</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
                <div>
                    {product.imageUrls?.length > 0
                        ? <img src={product.imageUrls[0]} alt={product.name} style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 480 }} />
                        : <div style={{ width: '100%', height: 400, background: 'var(--bg-elevated)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', color: 'var(--text-muted)' }}>🛍</div>
                    }
                </div>
                <div>
                    <div className="text-sm text-muted mb-4">{product.categoryName} · {product.brand}</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>{product.name}</h1>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-light)', marginBottom: 24 }}>${product.price?.toFixed(2)}</div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>{product.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <span className="text-sm text-muted">Quantity:</span>
                        <div className="qty-control">
                            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                            <span style={{ fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{qty}</span>
                            <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}>+</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: product.stockQuantity > 0 ? 'var(--success)' : 'var(--error)', display: 'inline-block' }} />
                        <span className="text-sm">{product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}</span>
                    </div>
                    <button className="btn btn-primary btn-lg w-full" onClick={handleAddToCart}
                        disabled={adding || product.stockQuantity === 0}>
                        {adding ? 'Adding...' : '🛒 Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}
