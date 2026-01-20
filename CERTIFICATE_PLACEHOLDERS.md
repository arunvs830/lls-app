# 🎓 Certificate Placeholders Guide

## Available Placeholders

When designing your certificate layout, you can use these dynamic placeholders that will be replaced with actual data when certificates are issued:

### **Student Information**
| Placeholder | Description | Example Output |
|-------------|-------------|----------------|
| `{student_name}` | Student's full name | "John Doe" |

### **Academic Information**
| Placeholder | Description | Example Output |
|-------------|-------------|----------------|
| `{program_name}` | Program/Degree name | "Bachelor of Computer Application" |
| `{course_name}` | Course name | "Web Development" |
| `{final_marks}` | Final marks or grade | "95%" or "A+" |

### **Certificate Metadata**
| Placeholder | Description | Example Output |
|-------------|-------------|----------------|
| `{date}` | Certificate issue date | "January 16, 2026" |
| `{certificate_number}` | Unique certificate ID | "CERT-2026-001234" |

---

## How to Use Placeholders

### **In the Certificate Designer:**

1. **Click the placeholder button** in the toolbar:
   - 👤 Student Name
   - �� Program Name
   - 📚 Course Name
   - ⭐ Final Marks
   - 📅 Date
   - 🔢 Cert Number

2. **The placeholder text appears** on the canvas (e.g., `{student_name}`)

3. **Customize the placeholder**:
   - Change font, size, color
   - Position it where you want
   - Make it bold or italic

4. **When certificates are issued**, these placeholders will be automatically replaced with real data

---

## Example Certificate Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│         CERTIFICATE OF ACHIEVEMENT          │
│                                             │
│           This certifies that               │
│                                             │
│            {student_name}                   │  ← Student's actual name
│                                             │
│     has successfully completed the          │
│                                             │
│            {course_name}                    │  ← Course name
│                                             │
│          in the program of                  │
│                                             │
│            {program_name}                   │  ← Program name
│                                             │
│      with final marks of {final_marks}      │  ← Final grade/marks
│                                             │
│                                             │
│  Issued on: {date}                          │  ← Issue date
│  Certificate No: {certificate_number}       │  ← Unique ID
│                                             │
└─────────────────────────────────────────────┘
```

---

## Styling Tips

### **Student Name**
- **Font**: Elegant script or serif font (Times New Roman, Georgia)
- **Size**: 36-48px
- **Color**: Blue (#2563eb) or Black
- **Style**: Bold, possibly italic

### **Program Name**
- **Font**: Professional serif font
- **Size**: 28-32px
- **Color**: Black or dark gray
- **Style**: Bold

### **Course Name**
- **Font**: Same as program name
- **Size**: 26-30px
- **Color**: Black
- **Style**: Bold

### **Final Marks**
- **Font**: Bold sans-serif
- **Size**: 32-42px
- **Color**: Green (#10b981) or Gold
- **Style**: Bold - make it stand out!

### **Date & Certificate Number**
- **Font**: Small, professional
- **Size**: 16-18px
- **Color**: Gray or black
- **Position**: Bottom corners or center

---

## When Certificates Are Issued

The system will:
1. Load the certificate layout
2. Replace all placeholders with actual student data
3. Generate a PDF
4. Store the certificate
5. Make it available for download

---

## Best Practices

✅ **DO:**
- Use clear, readable fonts for names
- Make the student name prominent
- Highlight the final marks/grade
- Keep date and cert number small but visible
- Test with sample long names

❌ **DON'T:**
- Use fonts smaller than 14px
- Overlap placeholders
- Use too many different fonts (max 3-4)
- Make final marks smaller than course name

---

## Example Use Cases

### **Program Completion Certificate**
- Emphasis on: `{student_name}`, `{program_name}`
- Include: `{final_marks}`, `{date}`, `{certificate_number}`
- Optional: `{course_name}` (if for specific course)

### **Course Completion Certificate**
- Emphasis on: `{student_name}`, `{course_name}`
- Include: `{final_marks}`, `{date}`, `{certificate_number}`
- Optional: `{program_name}` (for context)

### **Merit Certificate**
- Emphasis on: `{student_name}`, `{final_marks}`
- Large, prominent marks display
- Include all other fields

---

**Need help?** Refer to `CERTIFICATE_QUICK_START.md` for step-by-step design instructions.
