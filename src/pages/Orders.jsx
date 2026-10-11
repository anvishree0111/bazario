import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import BottomNav from '../components/BottomNav'
import { useApp } from '../context/AppContext'
import { products } from '../data/products'

const MOCK_ORDERS = [
  {
    id: 'M001',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Delivered',
    items: [ { ...products[0], quantity: 2 }, { ...products[2], quantity: 1 } ],
    total: 19997,
    subtotal: 19898,
    shipping: 99
  },
  {
    id: 'M002',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Shipped',
    items: [ { ...products[1], quantity: 1 }, { ...products[4], quantity: 1 } ],
    total: 17598,
    subtotal: 17598,
    shipping: 0
  }
]

function OrderCard({ order, formatPrice, formatDate }) {
  // Real orders (from the API) carry seller_id at the order level. The
  // local sample orders shown before a buyer has any real history fall
  // back to the mock item's shop id — never a hardcoded/fake value.
  const sellerId = order.seller_id ?? order.items?.[0]?.shop?.id

  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <span className="order-id">Order #{order.id}</span>
          <span className="order-status">{order.status || 'Confirmed'}</span>
        </div>
        <span className="order-date">{formatDate(order.date)}</span>
      </div>
      <div className="order-items">
        {order.items?.map((item, i) => (
          <div key={i} className="order-item">
            <img src={item.image} alt={item.name} />
            <div>
              <h4>{item.name}</h4>
              <span>Qty: {item.quantity}</span>
              <span className="price">{formatPrice(item.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="order-footer">
        <span className="order-total">{formatPrice(order.total)}</span>
        {sellerId != null && (
          <Link to={`/shop/${sellerId}`} className="msg-seller-btn">Visit Shop</Link>
        )}
      </div>
    </div>
  )
}

export default function Orders() {
  const { orders } = useApp()
  const displayOrders = orders.length > 0 ? orders : MOCK_ORDERS

  const formatPrice = (n) => `₹${n?.toLocaleString('en-IN')}`
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (displayOrders.length === 0) {
    return (
      <div className="orders-page">
        <NavBar />
        <div className="orders-empty">
          <h2>No Orders Yet</h2>
          <p>Your order history will appear here once you make a purchase.</p>
        </div>
        <BottomNav />
        <style>{`
          .orders-page { min-height: 100vh; background: var(--bg-alt); padding-bottom: 80px; }
          .orders-empty {
            max-width: 500px;
            margin: 80px auto;
            text-align: center;
            padding: 48px;
          }
          .orders-empty h2 { color: #FF4800; margin-bottom: 12px; }
          .orders-empty p { color: #666; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <NavBar />
      <BottomNav />
      <div className="orders-content">
        <h1>My Orders</h1>
        {orders.length === 0 && (
          <p className="mock-notice">Showing sample orders. Your real orders will appear here after checkout.</p>
        )}
        <div className="orders-list">
          {displayOrders.map(order => (
            <OrderCard key={order.id} order={order} formatPrice={formatPrice} formatDate={formatDate} />
          ))}
        </div>
      </div>
      <style>{`
        .orders-page { min-height: 100vh; background: var(--bg-alt); padding-bottom: 80px; }
        .orders-content { max-width: 800px; margin: 0 auto; padding: 24px; }
        .orders-content h1 { margin-bottom: 16px; color: #FF4800; }
        .mock-notice {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: #fff8f5;
          border-radius: 8px;
        }
        .orders-list { display: flex; flex-direction: column; gap: 20px; }
        .order-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: #f8f8f8;
          font-weight: 600;
        }
        .order-header .order-status {
          display: block;
          font-size: 0.85rem;
          color: #FF4800;
          font-weight: 700;
          margin-top: 4px;
        }
        .order-date { color: #666; font-weight: 500; }
        .order-items { padding: 20px 24px; }
        .order-item {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }
        .order-item:last-child { margin-bottom: 0; }
        .order-item img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 8px;
        }
        .order-item h4 { font-size: 0.95rem; color: #333; margin-bottom: 4px; }
        .order-item .price { color: #FF4800; font-weight: 700; display: block; }
        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid #eee;
        }
        .order-total { font-size: 1.2rem; font-weight: 700; color: #FF4800; }
        .msg-seller-btn {
          display: inline-block;
          padding: 10px 20px;
          background: #FF4800;
          color: white;
          font-weight: 600;
          border-radius: 8px;
        }
        .msg-seller-btn:hover {
          background: #e03f00;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
