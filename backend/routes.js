
import express from 'express';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import groupsRoutes from './routes/groups.js';
import messagesRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import socialRoutes from './routes/social.js';
import analyticsRoutes from './routes/analytics.js';
import eventRoutes from './routes/events.js';
import marketplaceRoutes from './routes/marketplace.js';
import postsRoutes from './routes/posts.js'; // Novo

const router = express.Router();

// Register modular routers
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/groups', groupsRoutes);
router.use('/messages', messagesRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/events', eventRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/posts', postsRoutes); // Novo

// Mounting specific prefixes to maintain compatibility with frontend services
router.use('/', socialRoutes); // For /relationships, /rankings, /reports
router.use('/', paymentRoutes); // For /syncpay, /paypal, /stripe

export default router;
