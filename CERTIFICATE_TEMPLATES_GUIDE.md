# Certificate Template System - Quick Start Guide

## Overview
Beautiful, customizable certificate templates have been added to your LLS application. You can now choose from 5 pre-designed templates and customize them as needed.

## Available Templates

### 1. **Classic Elegant**
- Traditional certificate design with ornate borders
- Gold and navy color scheme
- Perfect for formal academic achievements
- Features: Double border frame, serif fonts, centered layout

### 2. **Modern Professional**
- Contemporary design with gradient header
- Purple gradient color scheme
- Clean and minimalist aesthetic
- Features: Bold typography, horizontal layout, modern fonts

### 3. **Academic Excellence**
- Distinguished design with star emblem
- Gold accents on white background
- Ideal for honors and distinctions
- Features: Circle medallion, serif fonts, formal language

### 4. **Minimalist Design**
- Ultra-clean with vertical accent bar
- Blue accent color
- Space-efficient and modern
- Features: Left-aligned layout, sans-serif fonts, minimal elements

### 5. **Royal Diploma**
- Luxurious multi-border design
- Brown and gold color scheme
- Traditional diploma style
- Features: Triple border, fleur-de-lis, ornate typography

## Quick Start

### Step 1: Seed Default Templates (One-time setup)

Run the following command to add the templates to your database:

```bash
# Make sure backend server is running first
cd "/Users/macbook/Documents/lls app"
python3 seed_templates.py
```

Or manually via API:
```bash
curl -X POST http://localhost:5001/api/certificate-templates/seed \
  -H "Content-Type: application/json"
```

### Step 2: Access Certificate Designer

1. Log in as admin
2. Navigate to **Admin Dashboard** → **Certificates**
3. Click **"Create New Layout"**
4. Click **"📋 Load Templates"** button in the header

### Step 3: Choose and Customize a Template

1. Browse the template gallery
2. Click on any template to load it
3. The template will load into the editor
4. Customize as needed:
   - Edit text content
   - Change colors and fonts
   - Adjust element positions
   - Add/remove elements

### Step 4: Save Your Custom Layout

1. Give your layout a unique name
2. Select the program it applies to (or leave blank for all programs)
3. Check "Set as default" if this should be the default for that program
4. Click **"Save Layout"**

## Template Variables

All templates support these dynamic variables that will be replaced with actual data:

- `{{student_name}}` - Student's full name
- `{{program_name}}` - Program/course name
- `{{course_name}}` - Specific course name
- `{{final_marks}}` - Student's final grade/marks
- `{{issue_date}}` - Certificate issue date
- `{{certificate_number}}` - Unique certificate ID

## Customization Features

### Text Elements
- Change font family, size, color
- Adjust font weight (bold) and style (italic)
- Position anywhere on canvas
- Support for custom text and variables

### Shapes
- Rectangles, circles, and lines
- Adjustable colors and borders
- Layer ordering (bring to front/send to back)

### Images
- Upload custom logos
- Add background images
- Scale and position freely

### Canvas Actions
- Delete selected elements
- Clear entire canvas
- Undo/redo support (via browser)

## API Endpoints

### Get All Templates
```http
GET /api/certificate-templates
```

### Seed Default Templates
```http
POST /api/certificate-templates/seed
```

### Get Certificate Layouts
```http
GET /api/certificate-layouts
```

### Create Custom Layout
```http
POST /api/certificate-layouts
Content-Type: application/json

{
  "layout_name": "My Custom Certificate",
  "program_id": 1,
  "template_content": "{...fabric.js JSON...}",
  "background_image": null,
  "is_default": false
}
```

## Technical Details

### Backend Files
- **`backend/routes/certificate_templates.py`** - Template seeding and retrieval
- **`backend/routes/certificate.py`** - Certificate layout CRUD operations
- **`backend/models.py`** - CertificateLayout model definition

### Frontend Files
- **`frontend/src/pages/admin/certificates/CertificateDesigner.jsx`** - Main designer component
- **`frontend/src/styles/CertificateDesigner.css`** - Designer styles including template gallery

### Database Schema
```sql
CREATE TABLE certificate_layout (
    id INTEGER PRIMARY KEY,
    layout_name VARCHAR(100) NOT NULL,
    template_content TEXT,
    background_image VARCHAR(500),
    program_id INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES program(id)
);
```

## Best Practices

1. **Template Naming**: Use descriptive names like "2024 Graduation - Gold Theme"
2. **Program Assignment**: Assign templates to specific programs for better organization
3. **Default Templates**: Set one default per program for automatic certificate generation
4. **Backup**: Export template JSON before major edits (copy from database)
5. **Testing**: Preview certificates with sample data before finalizing

## Troubleshooting

### Templates Not Showing
- Ensure templates are seeded: Run `seed_templates.py`
- Check backend server is running
- Verify API endpoint `/api/certificate-templates` returns data

### Template Won't Load
- Check browser console for errors
- Ensure template has valid JSON content
- Try clearing canvas and loading again

### Customization Not Saving
- Verify layout name is provided
- Check network tab for API errors
- Ensure proper permissions (admin role)

### Variables Not Replacing
- Verify variable syntax: `{{variable_name}}`
- Check certificate issue endpoint implementation
- Ensure student data is passed correctly

## Next Steps

1. ✅ Seed default templates
2. ✅ Explore and customize templates
3. ✅ Assign templates to programs
4. ⏭️ Test certificate generation with real student data
5. ⏭️ Create additional custom templates as needed

## Support

For issues or feature requests:
1. Check console logs for errors
2. Verify all backend routes are registered
3. Test API endpoints independently
4. Review fabric.js documentation for advanced customization

---

**Last Updated**: January 2026
**Version**: 1.0.0
