const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getUserAnalytics,
  getGroupAnalytics,
  getMeetingAnalytics,
  getSystemHealth,
  getAuditLogs,
  getContentModeration
} = require('../Controller/admin1.controller');
const adminRole = require('../Helper/authMiddleware');


// Dashboard Overview
// GET /api/analytics/dashboard
router.get('/dashboard', getDashboardOverview);

// User Analytics
// GET /api/analytics/users
router.get('/users', getUserAnalytics);

// Group Analytics
// GET /api/analytics/groups
router.get('/groups', getGroupAnalytics);

// Meeting and Session Analytics
// GET /api/analytics/meetings
router.get('/meetings', getMeetingAnalytics);

// System Health and Performance (Admin only)
// GET /api/analytics/system-health
router.get('/system-health',  getSystemHealth);

// Audit Logs (Admin only)
// GET /api/analytics/audit-logs
router.get('/audit-logs', getAuditLogs);

// Content Moderation (Admin only)
// GET /api/analytics/moderation
router.get('/moderation', getContentModeration);

module.exports = router;

// Example usage in app.js: