import pool from '../db.js'
import * as buyerModel from '../models/buyerModel.js'
import * as cartModel from '../models/cartModel.js'
import * as wishlistModel from '../models/wishlistModel.js'
import * as orderModel from '../models/orderModel.js'
import * as followModel from '../models/followModel.js'
import * as sellerModel from '../models/sellerModel.js'

export function buyerTest(req, res) {
  res.json({ ok: true, message: 'Buyer API is up' })
}

export async function getProfile(req, res) {
  try {
    const id = Number(req.params.buyerId)
    if (req.auth.id !== id) return res.status(403).json({ error: 'Forbidden' })
    const buyer = await buyerModel.findBuyerById(id)
    if (!buyer) return res.status(404).json({ error: 'Not found' })
    let interests = buyer.interests
    if (typeof interests === 'string') {
      try {
        interests = JSON.parse(interests)
      } catch {
        interests = []
      }
    }
    res.json({
      id: buyer.id,
      name: buyer.name,
      email: buyer.email,
      interests: interests || []
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function updateProfile(req, res) {
  try {
    const id = Number(req.params.buyerId)
    if (req.auth.id !== id) return res.status(403).json({ error: 'Forbidden' })
    const { name, interests } = req.body
    await buyerModel.updateBuyer(id, { name, interests })
    const buyer = await buyerModel.findBuyerById(id)
    let ints = buyer.interests
    if (typeof ints === 'string') {
      try {
        ints = JSON.parse(ints)
      } catch {
        ints = []
      }
    }
    res.json({ id: buyer.id, name: buyer.name, email: buyer.email, interests: ints || [] })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function getCart(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    const cart = await cartModel.getCartForBuyer(buyerId)
    res.json(cart)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function postCart(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    const { productId, quantity = 1 } = req.body
    if (!productId) return res.status(400).json({ error: 'productId required' })
    await cartModel.addToCart(buyerId, Number(productId), Number(quantity) || 1)
    const cart = await cartModel.getCartForBuyer(buyerId)
    res.json(cart)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function putCart(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    const { productId, quantity, items } = req.body
    if (Array.isArray(items)) {
      await pool.query('DELETE FROM cart WHERE buyer_id = ?', [buyerId])
      for (const it of items) {
        await cartModel.upsertCartItem(buyerId, Number(it.productId || it.id), Number(it.quantity) || 1)
      }
    } else if (productId != null && quantity != null) {
      await cartModel.updateCartQuantity(buyerId, Number(productId), Number(quantity))
    } else {
      return res.status(400).json({ error: 'Provide productId+quantity or items[]' })
    }
    const cart = await cartModel.getCartForBuyer(buyerId)
    res.json(cart)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function deleteCartItem(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    const productId = Number(req.params.productId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    await cartModel.removeFromCart(buyerId, productId)
    const cart = await cartModel.getCartForBuyer(buyerId)
    res.json(cart)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function getWishlist(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    const list = await wishlistModel.getWishlistForBuyer(buyerId)
    res.json(list)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function postWishlist(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    const { productId } = req.body
    if (!productId) return res.status(400).json({ error: 'productId required' })
    await wishlistModel.addWishlist(buyerId, Number(productId))
    const list = await wishlistModel.getWishlistForBuyer(buyerId)
    res.json(list)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function deleteWishlistItem(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    const productId = Number(req.params.productId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    await wishlistModel.removeWishlist(buyerId, productId)
    const list = await wishlistModel.getWishlistForBuyer(buyerId)
    res.json(list)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function getOrders(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    const orders = await orderModel.listOrdersForBuyer(buyerId)
    res.json(orders)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function postOrder(req, res) {
  const connection = await pool.getConnection()
  try {
    const buyerId = Number(req.params.buyerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })

    const { items, shipping = 0 } = req.body
    if (!items?.length) return res.status(400).json({ error: 'items required' })

    await connection.beginTransaction()
    const bySeller = new Map()

    for (const item of items) {
      const pid = Number(item.id ?? item.productId)
      const [prodRows] = await connection.query('SELECT seller_id, price FROM products WHERE id = ?', [pid])
      const row = prodRows[0]
      if (!row) {
        await connection.rollback()
        return res.status(400).json({ error: `Product ${pid} not found` })
      }
      const seller_id = row.seller_id
      const linePrice = item.price != null ? Number(item.price) : Number(row.price)
      if (!bySeller.has(seller_id)) bySeller.set(seller_id, [])
      bySeller.get(seller_id).push({
        product_id: pid,
        quantity: Number(item.quantity) || 1,
        price: linePrice
      })
    }

    let addShipping = true
    for (const [seller_id, lines] of bySeller) {
      const sub = lines.reduce((s, l) => s + l.price * l.quantity, 0)
      const orderTotal = sub + (addShipping ? Number(shipping) || 0 : 0)
      addShipping = false

      const [or] = await connection.query(
        'INSERT INTO orders (buyer_id, seller_id, total_price, status) VALUES (?, ?, ?, ?)',
        [buyerId, seller_id, orderTotal, 'Confirmed']
      )
      const orderId = or.insertId
      for (const line of lines) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, line.product_id, line.quantity, line.price]
        )
      }
    }

    await connection.query('DELETE FROM cart WHERE buyer_id = ?', [buyerId])
    await connection.commit()

    const orders = await orderModel.listOrdersForBuyer(buyerId)
    res.json(orders)
  } catch (e) {
    try {
      await connection.rollback()
    } catch (_) {}
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  } finally {
    connection.release()
  }
}

// GET /api/buyer/:buyerId/follows/:sellerId
// Real follow state, read straight from MySQL every time — never inferred
// from localStorage or any other client-side source.
export async function getFollowState(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    const sellerId = Number(req.params.sellerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    const following = await followModel.isFollowing(buyerId, sellerId)
    res.json({ following })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/buyer/:buyerId/follows  { sellerId }
export async function followShop(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    const sellerId = Number(req.body?.sellerId)
    if (!sellerId) return res.status(400).json({ error: 'sellerId required' })
    const seller = await sellerModel.findSellerById(sellerId)
    if (!seller) return res.status(404).json({ error: 'Shop not found' })
    // UNIQUE(buyer_id, seller_id) at the database level backs this up, so a
    // duplicate follow attempt can never create a second row.
    await followModel.follow(buyerId, sellerId)
    const followerCount = await followModel.countFollowers(sellerId)
    res.json({ following: true, followerCount })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

// DELETE /api/buyer/:buyerId/follows/:sellerId
export async function unfollowShop(req, res) {
  try {
    const buyerId = Number(req.params.buyerId)
    const sellerId = Number(req.params.sellerId)
    if (req.auth.id !== buyerId) return res.status(403).json({ error: 'Forbidden' })
    await followModel.unfollow(buyerId, sellerId)
    const followerCount = await followModel.countFollowers(sellerId)
    res.json({ following: false, followerCount })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}
