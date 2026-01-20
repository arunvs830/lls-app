# 🚀 Quick Start Guide - Certificate Designer

## How to Run the Feature

### 1️⃣ Start the Backend
```bash
cd backend
python3 app.py
```
✅ Backend will run on: http://127.0.0.1:6000

### 2️⃣ Start the Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend will run on: http://localhost:6001

### 3️⃣ Access the Certificate Designer

1. **Login to Admin Dashboard**:
   - Go to: http://localhost:6001
   - Login with admin credentials

2. **Navigate to Certificates**:
   - Click "🎓 Certificates" in the left sidebar
   - OR go directly to: http://localhost:6001/admin/certificates

3. **Create Your First Certificate Layout**:
   - Click "+ Create New Layout" button
   - You'll see the designer with three panels:
     - **Left**: Toolbar (add elements)
     - **Center**: Canvas (design area)
     - **Right**: Properties (customize elements)

## 🎨 Using the Designer

### Basic Workflow:
1. **Name your layout** (e.g., "CS Completion Certificate")
2. **Select a program** from dropdown (optional)
3. **Upload background image** (Click "🖼️ Background" button)
4. **Add text elements**:
   - Click "👤 Student Name" - adds `{student_name}` placeholder
   - Click "🎓 Program Name" - adds `{program_name}` placeholder
   - Click "📅 Date" - adds `{date}` placeholder
   - Click "📝 Text" - adds custom text (e.g., "Certificate of Completion")
5. **Customize elements**:
   - Click on any text to select it
   - Use Properties Panel on the right to change:
     - Font family
     - Font size
     - Color
     - Bold/Italic
6. **Position elements**:
   - Drag elements to position them
   - Use corner handles to resize
7. **Add decorative elements**:
   - Click shapes (Rectangle, Circle, Line) for borders
   - Click "🖼️ Logo/Image" to add institution logo
8. **Save your layout**:
   - Check "Set as default" if this is the primary layout
   - Click "Save Layout" button

## 📝 Example Certificate Design

Here's a simple certificate layout to start:

1. Upload a certificate border background (1000x700px recommended)
2. Add these elements:

```
Top (centered):
- Custom Text: "Certificate of Achievement"
- Font: Times New Roman, Size: 48, Color: Black, Bold

Middle (centered):
- Text: "This certifies that"
- Font: Arial, Size: 24

- Student Name: {student_name}
- Font: Cursive/Script, Size: 42, Color: Blue, Italic

- Text: "has successfully completed"
- Font: Arial, Size: 24

- Program Name: {program_name}
- Font: Arial, Size: 32, Bold

Bottom (left):
- Date: {date}
- Font: Arial, Size: 18

Bottom (right):
- Certificate Number: {certificate_number}
- Font: Arial, Size: 16

- Add signature image
- Add institution logo
```

## 🔑 Important Variables

Use these exact placeholders - they will be replaced with real data when certificates are issued:

| Placeholder | Will be replaced with |
|-------------|----------------------|
| `{student_name}` | Student's full name |
| `{program_name}` | Program/course name |
| `{date}` | Issue date |
| `{certificate_number}` | Unique certificate ID |

## ⌨️ Keyboard Shortcuts

- **Delete**: Delete selected element
- **Drag**: Move element
- **Double-click text**: Edit text directly on canvas
- **Corner handles**: Resize element

## 💾 Saving & Editing

- **Saving**: All canvas data is saved as JSON
- **Background**: Background images are stored
- **Editing**: Go back to certificate list and click "Edit" on any layout
- **Default**: Only one layout per program can be default

## 🎯 Tips for Best Results

1. **Use high-quality background images** (1000x700px or larger)
2. **Keep text readable** - minimum font size 14px
3. **Test with sample data** before finalizing
4. **Use common fonts** for compatibility
5. **Add borders/frames** using Rectangle shapes
6. **Leave space** for signatures and seals
7. **Center important elements** for balance
8. **Use contrasting colors** for readability

## 📱 Responsive Canvas

The canvas is set to 1000x700px which:
- ✅ Fits standard certificate paper
- ✅ Good for printing (landscape A4)
- ✅ Displays well on screens
- ✅ Easy to convert to PDF

## 🐛 Troubleshooting

### "Cannot read property of undefined"
- Make sure you've saved the layout before navigating away
- Check browser console for errors

### Background image not showing
- Ensure image format is PNG or JPG
- Check file size (< 5MB recommended)
- Try refreshing the page

### Text appears blurry
- Increase font size
- Use web-safe fonts
- Check zoom level

### Changes not saving
- Verify backend is running
- Check browser network tab for API errors
- Ensure layout name is filled

## 📊 Database Info

Certificate layouts are stored in the `certificate_layout` table with:
- Layout name
- Template content (JSON)
- Background image (base64 or path)
- Program association
- Default flag
- Created timestamp

## 🔄 What's Next?

After creating layouts, the next phase would be:
1. Issue certificates to students
2. Generate PDFs from layouts
3. Allow students to download certificates
4. Add QR codes for verification

---

## ✅ Verification Checklist

Before considering your certificate ready:
- [ ] Layout has a descriptive name
- [ ] Background image uploaded (optional but recommended)
- [ ] Student name placeholder added
- [ ] Program name placeholder added  
- [ ] Date placeholder added
- [ ] Certificate number added
- [ ] All text is readable
- [ ] Elements are well-positioned
- [ ] Layout is saved successfully
- [ ] Set as default if primary layout

---

**Need Help?** Check the full documentation in `CERTIFICATE_FEATURE_IMPLEMENTATION.md`
