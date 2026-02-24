import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi, cartApi } from '../api/services';
import { Product, Category, PageResponse } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../store/slices/cartSlice';
import { RootState } from '../store';

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [activeCat, setActiveCat] = useState<number | undefined>();
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [addingId, setAddingId] = useState<number | null>(null);
    const { isAuthenticated } = useSelector((s: RootState) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        productApi.getCategories().then(r => setCategories(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        productApi.getAll({ keyword: keyword || undefined, categoryId: activeCat, page, size: 12 })
            .then(r => {
                setProducts(r.data.content);
                setTotalPages(r.data.totalPages);
            }).catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [keyword, activeCat, page]);

    const handleAddToCart = async (p: Product) => {
        if (!isAuthenticated) { navigate('/login'); return; }
        setAddingId(p.id);
        try {
            const { data } = await cartApi.addItem({
                productId: p.id, productName: p.name,
                price: p.price, quantity: 1,
                imageUrl: p.imageUrls?.[0] || '',
            });
            dispatch(setCart(data));
        } finally { setAddingId(null); }
    };

    return (
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
            <div className="page-header">
                <h1 className="page-title">All Products</h1>
                <p className="page-subtitle">Browse our curated collection</p>
            </div>

            <div className="search-bar">
                <input className="search-input" placeholder="Search products..."
                    value={keyword} onChange={e => { setKeyword(e.target.value); setPage(0); }} />
            </div>

            <div className="category-pills">
                <button className={`category-pill ${!activeCat ? 'active' : ''}`}
                    onClick={() => { setActiveCat(undefined); setPage(0); }}>All</button>
                {categories.map(c => (
                    <button key={c.id} className={`category-pill ${activeCat === c.id ? 'active' : ''}`}
                        onClick={() => { setActiveCat(c.id); setPage(0); }}>{c.name}</button>
                ))}
            </div>

            {loading ? <div className="spinner" /> : products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <div className="empty-state-title">No products found</div>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid-4">
                    {products.map(p => (
                        <div key={p.id} className="card product-card" onClick={() => navigate(`/products/${p.id}`)}>
                            {p.imageUrls?.length > 0
                                ? <img className="product-card-img" src={p.imageUrls[0]} alt={p.name} />
                                : <div className="product-card-img-placeholder">🛍</div>
                            }
                            <div className="product-card-body">
                                <div className="product-card-name">{p.name}</div>
                                <div className="product-card-brand">{p.brand}</div>
                                <div className="product-card-price">${p.price?.toFixed(2)}</div>
                            </div>
                            <div className="product-card-footer">
                                <button className="btn btn-primary w-full"
                                    disabled={addingId === p.id || p.stockQuantity === 0}
                                    onClick={e => { e.stopPropagation(); handleAddToCart(p); }}>
                                    {addingId === p.id ? 'Adding...' : p.stockQuantity === 0 ? 'Out of Stock' : '+ Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex gap-4 mt-6" style={{ justifyContent: 'center' }}>
                    <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Page {page + 1} of {totalPages}</span>
                    <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            )}
        </div>
    );
}
