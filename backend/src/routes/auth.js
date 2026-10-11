import { Router } from 'express'
import * as authController from '../controllers/authController.js'

const router = Router()

router.post('/buyer/login', authController.loginBuyer)
router.post('/seller/login', authController.loginSeller)
router.post('/buyer/register', authController.registerBuyer)
router.post('/seller/register', authController.registerSeller)

export default router
