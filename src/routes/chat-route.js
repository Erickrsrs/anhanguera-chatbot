import express from 'express'
import {
  chatConversationController,
  chatCreateController,
} from '../controllers/chat-controller.js'

const router = express.Router()

router.post('/create', chatCreateController)
router.post('/conversation', chatConversationController)

export default router
