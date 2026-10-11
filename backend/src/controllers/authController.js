import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as buyerModel from '../models/buyerModel.js'
import * as sellerModel from '../models/sellerModel.js'
import { isValidEmail, isValidPassword, normalizeEmail } from '../utils/validate.js'

const SALT_ROUNDS = 10

// JWT payload MUST only ever contain identity (id) + role. Never the
// email, never the password/hash, never DB credentials.
function signToken({ id, role }) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function parseInterests(row) {
  if (!row?.interests) return []
  if (typeof row.interests === 'string') {
    try {
      return JSON.parse(row.interests)
    } catch {
      return []
    }
  }
  return row.interests
}

export async function loginBuyer(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const buyer = await buyerModel.findBuyerByEmail(normalizeEmail(email))
    if (!buyer || !(await bcrypt.compare(password, buyer.password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = signToken({ id: buyer.id, role: 'buyer' })
    const interests = parseInterests(buyer)
    res.json({
      token,
      user: { id: buyer.id, name: buyer.name, email: buyer.email, interests }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

export async function loginSeller(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const seller = await sellerModel.findSellerByEmail(normalizeEmail(email))
    if (!seller || !(await bcrypt.compare(password, seller.password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = signToken({ id: seller.id, role: 'seller' })
    res.json({
      token,
      seller: {
        id: seller.id,
        shopName: seller.shop_name,
        ownerName: seller.owner_name,
        email: seller.email
      }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/auth/buyer/register
// Real buyer registration: validation -> bcrypt hash -> MySQL insert.
// Always creates a brand-new row with its own auto-increment id and
// starts with no cart/wishlist/orders/reviews/follows — there is nothing
// to copy from the existing test buyer because a new row simply has no
// related rows anywhere else in the schema.
export async function registerBuyer(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Name, email, password and confirmPassword are required' })
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' })
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    const normalizedEmail = normalizeEmail(email)
    const existing = await buyerModel.findBuyerByEmail(normalizedEmail)
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    // createBuyer only ever inserts a fresh row (buyers.id is
    // AUTO_INCREMENT) — this is a brand-new, unique database id with no
    // link to any existing buyer's data.
    const id = await buyerModel.createBuyer({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      interests: []
    })

    const token = signToken({ id, role: 'buyer' })
    res.status(201).json({
      token,
      user: { id, name: String(name).trim(), email: normalizedEmail, interests: [] }
    })
  } catch (e) {
    // Defense in depth: a race on the unique email constraint surfaces as
    // an ER_DUP_ENTRY from MySQL even if the pre-check above passed.
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}

// POST /api/auth/seller/register
// Real seller registration: validation -> bcrypt hash -> MySQL insert.
// There is no "role" input here that could ever be interpreted as an
// admin role — this endpoint always inserts into the sellers table, and
// the schema has no admin/role column or admin table at all, so
// registration can never produce an admin account.
export async function registerSeller(req, res) {
  try {
    const { shopName, ownerName, email, password, confirmPassword } = req.body

    if (!shopName || !ownerName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Shop name, owner name, email, password and confirmPassword are required' })
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' })
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    const normalizedEmail = normalizeEmail(email)
    const existing = await sellerModel.findSellerByEmail(normalizedEmail)
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    // createSeller only ever inserts a fresh row (sellers.id is
    // AUTO_INCREMENT) — a brand-new seller id with no products, orders,
    // reviews, followers or analytics copied from any existing seller.
    const id = await sellerModel.createSeller({
      shopName: String(shopName).trim(),
      ownerName: String(ownerName).trim(),
      email: normalizedEmail,
      passwordHash
    })

    const token = signToken({ id, role: 'seller' })
    res.status(201).json({
      token,
      seller: {
        id,
        shopName: String(shopName).trim(),
        ownerName: String(ownerName).trim(),
        email: normalizedEmail
      }
    })
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}
