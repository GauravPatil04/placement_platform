# 📚 Placement Question System - Documentation Index

Welcome! This directory contains complete documentation for the Placement Question Upload and User-Side Integration system.

---

## 🚀 Quick Start

**New to the system?** Start here:
1. Read [`PLACEMENT_SYSTEM_README.md`](./PLACEMENT_SYSTEM_README.md) for an overview
2. Follow [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md) to upload questions
3. Check [`VISUAL_FLOW_DIAGRAM.md`](./VISUAL_FLOW_DIAGRAM.md) to understand the flow

**Developer?** Check:
1. [`PLACEMENT_QUESTION_MAPPING.md`](./PLACEMENT_QUESTION_MAPPING.md) for technical details
2. [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) for what was built

---

## 📄 Documentation Files

### 1. [PLACEMENT_SYSTEM_README.md](./PLACEMENT_SYSTEM_README.md)
**Purpose:** Complete system overview and quick start guide

**Contents:**
- Architecture overview
- Quick start for admins and developers
- Complete flow walkthrough
- Stage configuration
- Frontend integration examples
- Testing guide

**Best for:** Getting a high-level understanding of the entire system

---

### 2. [ADMIN_QUICK_START.md](./ADMIN_QUICK_START.md)
**Purpose:** Step-by-step guide for administrators

**Contents:**
- How to create tests
- How to prepare CSV files
- How to upload questions
- Verification checklist
- Common errors and solutions
- Best practices
- Question distribution tables

**Best for:** Admins who need to upload questions

---

### 3. [PLACEMENT_QUESTION_MAPPING.md](./PLACEMENT_QUESTION_MAPPING.md)
**Purpose:** Technical documentation for developers

**Contents:**
- Detailed architecture
- Flow diagrams
- API endpoint specifications
- Database schema
- CSV format specifications
- Security features
- Testing procedures
- Troubleshooting

**Best for:** Developers implementing the frontend or modifying the backend

---

### 4. [VISUAL_FLOW_DIAGRAM.md](./VISUAL_FLOW_DIAGRAM.md)
**Purpose:** Visual representation of the entire system

**Contents:**
- Admin workflow diagram
- User workflow diagram
- Database layer diagram
- Question selection logic
- Stage progression (TCS & Wipro)
- Data flow diagram
- Security flow diagram

**Best for:** Visual learners who want to understand the system flow

---

### 5. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
**Purpose:** Summary of what was implemented

**Contents:**
- List of all files created
- Features implemented
- How it works
- Stage mapping tables
- Security features
- Integration examples
- Testing steps

**Best for:** Understanding what was delivered and how to use it

---

### 6. [ADMIN_UPLOAD_INTEGRATION.md](./ADMIN_UPLOAD_INTEGRATION.md)
**Purpose:** Shows how admin upload page connects to user-side tests

**Contents:**
- Complete flow diagram
- Topic field mapping (KEY connection)
- Step-by-step admin workflow
- CSV format for each test
- Verification checklist
- Code flow explanation
- Frontend integration examples

**Best for:** Understanding how admin uploads map to user tests

---

### 7. [QUESTION_ORDER_IMPLEMENTATION.md](./QUESTION_ORDER_IMPLEMENTATION.md) ⭐ NEW
**Purpose:** Complete implementation guide for question order mapping

**Contents:**
- Database schema changes
- Admin upload API enhancements
- User-side API updates
- Complete flow explanation
- Configuration options
- Testing checklist
- Best practices

**Best for:** Understanding how questions maintain upload sequence

---

### 8. [QUESTION_ORDER_MAPPING.md](./QUESTION_ORDER_MAPPING.md) ⭐ NEW
**Purpose:** Technical documentation for question order system

**Contents:**
- How the order system works
- Database schema details
- Upload process explanation
- Retrieval logic
- Category-based selection
- Multiple upload handling
- Configuration options
- Troubleshooting guide

**Best for:** Developers implementing or modifying the order system

---

### 9. [ADMIN_QUESTION_ORDER_GUIDE.md](./ADMIN_QUESTION_ORDER_GUIDE.md) ⭐ NEW
**Purpose:** Quick reference for admins on maintaining question order

**Contents:**
- Simple upload instructions
- Order strategies
- Best practices
- Common mistakes to avoid
- Verification methods
- Quick tips

**Best for:** Admins who want to control question sequence

---

## 📁 CSV Templates

Location: [`csv-templates/`](./csv-templates/)

### TCS Templates
- **`tcs-foundation-numerical.csv`** - 10 numerical questions
- **`tcs-foundation-verbal.csv`** - 10 verbal questions
- **`tcs-foundation-reasoning.csv`** - 10 reasoning questions
- **`tcs-coding.csv`** - 3 coding problems

### Wipro Templates
- **`wipro-aptitude-quant.csv`** - 10 quantitative questions
- **`wipro-essay.csv`** - Essay prompts

**Usage:** Download and modify these templates to create your own question sets

---

## 🗺️ Navigation Guide

### I want to...

#### Upload questions as an admin
→ Read [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md)
→ Read [`ADMIN_UPLOAD_INTEGRATION.md`](./ADMIN_UPLOAD_INTEGRATION.md) for how it connects
→ Read [`ADMIN_QUESTION_ORDER_GUIDE.md`](./ADMIN_QUESTION_ORDER_GUIDE.md) for order control ⭐ NEW
→ Use templates from [`csv-templates/`](./csv-templates/)

#### Control question order/sequence
→ Read [`ADMIN_QUESTION_ORDER_GUIDE.md`](./ADMIN_QUESTION_ORDER_GUIDE.md) ⭐ NEW
→ Check [`QUESTION_ORDER_IMPLEMENTATION.md`](./QUESTION_ORDER_IMPLEMENTATION.md) for details

#### Understand how admin uploads connect to user tests
→ Read [`ADMIN_UPLOAD_INTEGRATION.md`](./ADMIN_UPLOAD_INTEGRATION.md)
→ Check the Topic field mapping section

#### Understand the system architecture
→ Read [`PLACEMENT_SYSTEM_README.md`](./PLACEMENT_SYSTEM_README.md)
→ View [`VISUAL_FLOW_DIAGRAM.md`](./VISUAL_FLOW_DIAGRAM.md)

#### Integrate the frontend
→ Read [`PLACEMENT_QUESTION_MAPPING.md`](./PLACEMENT_QUESTION_MAPPING.md)
→ Check API reference section
→ Use helper functions in `src/lib/placement-questions.ts`

#### Understand what was built
→ Read [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)
→ Read [`QUESTION_ORDER_IMPLEMENTATION.md`](./QUESTION_ORDER_IMPLEMENTATION.md) ⭐ NEW

#### See visual diagrams
→ View [`VISUAL_FLOW_DIAGRAM.md`](./VISUAL_FLOW_DIAGRAM.md)

#### Troubleshoot issues
→ Check troubleshooting sections in:
  - [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md)
  - [`PLACEMENT_QUESTION_MAPPING.md`](./PLACEMENT_QUESTION_MAPPING.md)
  - [`QUESTION_ORDER_MAPPING.md`](./QUESTION_ORDER_MAPPING.md) ⭐ NEW

---

## 📊 File Overview

| File | Size | Purpose | Audience |
|------|------|---------|----------|
| PLACEMENT_SYSTEM_README.md | ~11 KB | System overview | Everyone |
| ADMIN_QUICK_START.md | ~9 KB | Admin guide | Admins |
| PLACEMENT_QUESTION_MAPPING.md | ~17 KB | Technical docs | Developers |
| VISUAL_FLOW_DIAGRAM.md | ~27 KB | Visual diagrams | Visual learners |
| IMPLEMENTATION_SUMMARY.md | ~11 KB | Implementation summary | Project managers |
| csv-templates/ | - | Sample CSVs | Admins |

**Total Documentation:** ~75 KB of comprehensive documentation

---

## 🎯 Key Concepts

### Stage Mapping
Questions are automatically mapped to stages based on:
- **Company**: TCS or Wipro
- **Stage**: foundation, advanced, coding, aptitude, essay
- **Test Topic**: Must match stage name

### Question Selection & Order ⭐ UPDATED
- Questions **maintain upload sequence** by default
- **Filtered by category** (numerical, verbal, reasoning, etc.)
- **Correct count selected** per category
- **Correct answers removed** before sending to user
- **Optional randomization** available via configuration

### Security
- Users can only access their own applications
- Correct answers never exposed
- One-time submission per stage
- Admin-only upload

---

## 🔗 Related Code Files

### API Endpoints
- `src/app/api/placements/[id]/stage/[stageName]/questions/route.ts` - Fetch questions
- `src/app/api/placements/[id]/stage/[stageName]/route.ts` - Submit answers (existing)
- `src/app/api/admin/placement-questions/upload/route.ts` - Upload questions (existing)

### Helper Libraries
- `src/lib/placement-questions.ts` - Frontend helper functions

---

## 📞 Support

### Common Questions

**Q: How do I upload questions?**
A: See [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md) → Step 3

**Q: What CSV format should I use?**
A: See [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md) → Sample CSV Templates section
Or use templates from [`csv-templates/`](./csv-templates/)

**Q: How do I fetch questions in my frontend?**
A: See [`PLACEMENT_QUESTION_MAPPING.md`](./PLACEMENT_QUESTION_MAPPING.md) → API Endpoints section
Use helper functions from `src/lib/placement-questions.ts`

**Q: How does the system map stages to tests?**
A: See [`VISUAL_FLOW_DIAGRAM.md`](./VISUAL_FLOW_DIAGRAM.md) → Question Selection Logic

**Q: What security measures are in place?**
A: See [`PLACEMENT_QUESTION_MAPPING.md`](./PLACEMENT_QUESTION_MAPPING.md) → Security Features

---

## 🎓 Learning Path

### For Admins
1. Read [`PLACEMENT_SYSTEM_README.md`](./PLACEMENT_SYSTEM_README.md) (10 min)
2. Follow [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md) (20 min)
3. Practice with CSV templates (30 min)
4. Upload first batch of questions (10 min)

**Total Time:** ~70 minutes

### For Developers
1. Read [`PLACEMENT_SYSTEM_README.md`](./PLACEMENT_SYSTEM_README.md) (15 min)
2. Study [`PLACEMENT_QUESTION_MAPPING.md`](./PLACEMENT_QUESTION_MAPPING.md) (30 min)
3. Review [`VISUAL_FLOW_DIAGRAM.md`](./VISUAL_FLOW_DIAGRAM.md) (15 min)
4. Explore helper functions in `src/lib/placement-questions.ts` (20 min)
5. Build test UI component (60 min)

**Total Time:** ~2.5 hours

### For Project Managers
1. Read [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) (15 min)
2. Skim [`PLACEMENT_SYSTEM_README.md`](./PLACEMENT_SYSTEM_README.md) (10 min)
3. Review [`VISUAL_FLOW_DIAGRAM.md`](./VISUAL_FLOW_DIAGRAM.md) (10 min)

**Total Time:** ~35 minutes

---

## ✅ Checklist

### System Setup
- [ ] Read documentation
- [ ] Create TCS and Wipro tests
- [ ] Upload questions using CSV templates
- [ ] Verify questions in admin panel
- [ ] Test user flow

### Frontend Integration
- [ ] Import helper functions
- [ ] Create test-taking UI
- [ ] Implement timer
- [ ] Add auto-save
- [ ] Build results page
- [ ] Test complete flow

### Testing
- [ ] Test question upload
- [ ] Test question fetch
- [ ] Test answer submission
- [ ] Test stage progression
- [ ] Test track assignment
- [ ] Test security measures

---

## 🎉 Summary

This documentation provides everything you need to:
- ✅ Understand the system architecture
- ✅ Upload questions as an admin
- ✅ Integrate the frontend
- ✅ Test the complete flow
- ✅ Troubleshoot issues

**Start with [`PLACEMENT_SYSTEM_README.md`](./PLACEMENT_SYSTEM_README.md) and follow the navigation guide above!**

---

**Last Updated:** December 2025
**Version:** 1.0
**Status:** Complete and Ready to Use 🚀
