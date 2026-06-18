-- ============================================
-- SCHOLARSHIP PORTAL - DATABASE FIX SCRIPT
-- ============================================
-- Run this script to fix all database schema issues
-- Compatible with MySQL 5.7+

-- ============================================
-- 1. FIX APPLICATIONS TABLE
-- ============================================

-- Fix status column to support APPROVED/REJECTED (8 chars)
ALTER TABLE applications MODIFY status VARCHAR(20) NOT NULL;

-- Add created_at column if it doesn't exist with default value
-- Note: If column exists but is NULL for existing rows, you might need to update them first
ALTER TABLE applications MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- ============================================
-- 2. FIX NOTIFICATIONS TABLE
-- ============================================

-- Ensure notifications table has proper structure
ALTER TABLE notifications MODIFY created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- ============================================
-- 3. VERIFY TABLE STRUCTURE
-- ============================================

-- Verify applications table structure
-- DESC applications;

-- Verify notifications table structure  
-- DESC notifications;

-- ============================================
-- 4. FIX EXISTING DATA (if needed)
-- ============================================

-- If there are applications with NULL created_at, fix them:
-- UPDATE applications SET created_at = NOW() WHERE created_at IS NULL;

-- If there are notifications with NULL created_at, fix them:
-- UPDATE notifications SET created_at = NOW() WHERE created_at IS NULL;
