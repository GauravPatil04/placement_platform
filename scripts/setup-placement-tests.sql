-- Complete Setup: Create Placement Tests with Proper Mapping
-- Run this in your PostgreSQL database (Supabase SQL Editor)

-- First, let's clean up any existing company tests to start fresh
-- (OPTIONAL - only run if you want to start clean)
-- DELETE FROM "Test" WHERE type = 'company';

-- ============================================
-- TCS PLACEMENT TESTS
-- ============================================

-- 1. TCS Foundation Test
INSERT INTO "Test" (id, title, description, duration, difficulty, type, company, topic, "createdAt", "updatedAt")
VALUES (
  'tcs-foundation-test-001',
  'TCS Foundation Test',
  'Foundation level test covering Numerical Ability, Verbal Ability, and Reasoning',
  60,
  'Medium',
  'company',
  'TCS',
  'Foundation',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  topic = EXCLUDED.topic,
  "updatedAt" = NOW();

-- 2. TCS Advanced Test
INSERT INTO "Test" (id, title, description, duration, difficulty, type, company, topic, "createdAt", "updatedAt")
VALUES (
  'tcs-advanced-test-001',
  'TCS Advanced Test',
  'Advanced level test covering Quantitative and Logical Reasoning',
  45,
  'Hard',
  'company',
  'TCS',
  'Advanced',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  topic = EXCLUDED.topic,
  "updatedAt" = NOW();

-- 3. TCS Coding Test
INSERT INTO "Test" (id, title, description, duration, difficulty, type, company, topic, "createdAt", "updatedAt")
VALUES (
  'tcs-coding-test-001',
  'TCS Coding Test',
  'Programming test with coding challenges',
  90,
  'Hard',
  'company',
  'TCS',
  'Coding',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  topic = EXCLUDED.topic,
  "updatedAt" = NOW();

-- ============================================
-- WIPRO PLACEMENT TESTS
-- ============================================

-- 4. Wipro Aptitude Test
INSERT INTO "Test" (id, title, description, duration, difficulty, type, company, topic, "createdAt", "updatedAt")
VALUES (
  'wipro-aptitude-test-001',
  'Wipro Aptitude Test',
  'Aptitude test covering Quantitative, Logical, and Verbal sections',
  60,
  'Medium',
  'company',
  'Wipro',
  'Aptitude',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  topic = EXCLUDED.topic,
  "updatedAt" = NOW();

-- 5. Wipro Essay Test
INSERT INTO "Test" (id, title, description, duration, difficulty, type, company, topic, "createdAt", "updatedAt")
VALUES (
  'wipro-essay-test-001',
  'Wipro Essay Test',
  'Essay writing test to assess communication skills',
  30,
  'Easy',
  'company',
  'Wipro',
  'Essay',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  topic = EXCLUDED.topic,
  "updatedAt" = NOW();

-- 6. Wipro Coding Test
INSERT INTO "Test" (id, title, description, duration, difficulty, type, company, topic, "createdAt", "updatedAt")
VALUES (
  'wipro-coding-test-001',
  'Wipro Coding Test',
  'Programming test with coding challenges',
  90,
  'Hard',
  'company',
  'Wipro',
  'Coding',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  topic = EXCLUDED.topic,
  "updatedAt" = NOW();

-- ============================================
-- VERIFY THE SETUP
-- ============================================

-- Check what will appear in the dropdown
SELECT 
  company || ' - ' || topic as "Dropdown Display",
  id,
  title,
  company,
  topic,
  type
FROM "Test"
WHERE type = 'company'
ORDER BY company, topic;

-- Expected output:
-- TCS - Advanced
-- TCS - Coding
-- TCS - Foundation
-- Wipro - Aptitude
-- Wipro - Coding
-- Wipro - Essay
