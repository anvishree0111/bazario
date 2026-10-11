import pool from '../db.js'
import { rowToProduct } from './productModel.js'
export async function listOrdersForBuyer(buyerId) {
  const [orderRows] = await pool.query(
    'SELECT * FROM orders WHERE buyer_id = ? ORDER BY id DESC',
    [buyerId]
  )
  const orders = []
  for (const o of orderRows) {
    const [items] = await pool.query(
      `SELECT oi.*, p.* FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
      [o.id]
    )
    const mappedItems = items.map((row) => {
      const prod = rowToProduct(row)
      return {
        ...prod,
        quantity: row.quantity,
        price: row.price
      }
    })
    orders.push({
      id: o.id,
      buyer_id: o.buyer_id,
      seller_id: o.seller_id,
      total_price: o.total_price,
      total: o.total_price,
      status: o.status,
      date: o.created_at,
      created_at: o.created_at,
      items: mappedItems
    })
  }
  return orders
}

export async function listOrdersForSeller(sellerId) {
  const [orderRows] = await pool.query(
    `SELECT o.*, b.name AS buyer_name, b.email AS buyer_email
     FROM orders o
     JOIN buyers b ON b.id = o.buyer_id
     WHERE o.seller_id = ?
     ORDER BY o.id DESC`,
    [sellerId]
  )
  const orders = []
  for (const o of orderRows) {
    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
      [o.id]
    )
    const first = items[0]
    orders.push({
      id: o.id,
      buyerName: o.buyer_name,
      buyer_name: o.buyer_name,
      status: o.status,
      date: o.created_at,
      // Real revenue for this order, straight from the orders table —
      // never derived, estimated, or randomized on the frontend.
      total: o.total_price,
      totalPrice: o.total_price,
      total_price: o.total_price,
      productName: items.map((i) => i.product_name).join(', ') || '—',
      product_name: first?.product_name,
      items
    })
  }
  return orders
}

export async function updateOrderStatus(orderId, sellerId, status) {
  const [r] = await pool.query('UPDATE orders SET status = ? WHERE id = ? AND seller_id = ?', [
    status,
    orderId,
    sellerId
  ])
  return r.affectedRows > 0
}
