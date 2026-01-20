# 🎓 Certificate Templates - Quick Reference

## ✨ What's New?

**5 beautiful, ready-to-use certificate templates** have been added to your LLS application!

## 🚀 Quick Start (30 seconds)

### Step 1: Seed Templates (First time only)
```bash
cd "/Users/macbook/Documents/lls app"
python3 seed_templates.py
```

### Step 2: Access & Use
1. Login as Admin
2. Go to: **Admin Dashboard** → **Certificates**
3. Click: **"Create New Layout"**
4. Click: **"📋 Load Templates"** button
5. Choose a template, customize, and save!

## 🎨 Available Templates

| Template | Style | Best For |
|----------|-------|----------|
| **Classic Elegant** | Traditional, Gold & Navy | Formal ceremonies |
| **Modern Professional** | Contemporary, Gradient | Modern programs |
| **Academic Excellence** | Distinguished, Star emblem | Honors & distinctions |
| **Minimalist Design** | Clean, Blue accent | Tech programs |
| **Royal Diploma** | Luxurious, Multi-border | Traditional diplomas |

## 📝 Template Variables

Use these in your templates - they auto-replace with real data:

```
{{student_name}}         → Student's full name
{{program_name}}         → Program/course name
{{course_name}}          → Specific course
{{final_marks}}          → Grades/scores
{{issue_date}}           → Certificate date
{{certificate_number}}   → Unique ID
```

## ⚡ Common Actions

### Load a Template
```
Click "📋 Load Templates" → Choose one → Confirm
```

### Edit Template Elements
```
• Text: Double-click to edit
• Colors: Properties panel → Color picker
• Position: Drag and drop
• Delete: Select → Press Delete or click 🗑️
```

### Save Your Custom Certificate
```
1. Enter layout name
2. Select program (optional)
3. Check "Set as default" (optional)
4. Click "Save Layout"
```

## 🎯 Pro Tips

✅ **DO:**
- Load template first, then customize
- Give unique names to each layout
- Test with sample data before finalizing
- Set one default per program

❌ **DON'T:**
- Edit templates directly (they're shared!)
- Use same name twice (add program/year)
- Forget to save after customizing
- Delete variables accidentally

## 🔧 Troubleshooting

### Templates not showing?
```bash
# Re-run seed script
python3 seed_templates.py
```

### Can't load template?
- Ensure backend is running (port 5001)
- Check browser console for errors
- Try refreshing the page

### Variables not replacing?
- Verify exact syntax: `{{variable_name}}`
- Check double curly braces: `{{` and `}}`
- Ensure no extra spaces

## 📁 Important Files

```
backend/routes/certificate_templates.py  ← Template routes
frontend/.../CertificateDesigner.jsx     ← Designer UI
seed_templates.py                         ← Seeding script
```

## 🌐 API Endpoints

```
GET  /api/certificate-templates          Get all templates
POST /api/certificate-templates/seed     Seed defaults
GET  /api/certificate-layouts            Get custom layouts
POST /api/certificate-layouts            Save custom layout
```

## 📚 Full Documentation

For complete details, see:
- `CERTIFICATE_TEMPLATES_GUIDE.md` - Complete guide
- `CERTIFICATE_TEMPLATES_VISUAL_GUIDE.md` - Visual examples
- `CERTIFICATE_TEMPLATES_IMPLEMENTATION.md` - Technical details

## 🎉 Benefits

✨ **Save Time** - No designing from scratch  
🎨 **Professional** - Designer-quality templates  
🔄 **Flexible** - Fully customizable  
📦 **Ready** - Use immediately  
🎯 **Consistent** - Brand uniformity  

## 📞 Need Help?

1. Check documentation files above
2. Review browser console for errors
3. Verify backend server is running
4. Test API endpoints independently

---

**Quick Links:**
- Backend: http://localhost:5001
- Frontend: http://localhost:5173 (or your port)
- API Test: `curl http://localhost:5001/api/certificate-templates`

**Last Updated:** January 2026  
**Status:** ✅ Ready to Use
