import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fabric } from 'fabric';
import '../../../styles/CertificateDesigner.css';

const CertificateDesigner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    
    const [layoutName, setLayoutName] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [programs, setPrograms] = useState([]);
    const [isDefault, setIsDefault] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [showTemplates, setShowTemplates] = useState(false);
    
    // Text properties
    const [textContent, setTextContent] = useState('');
    const [fontSize, setFontSize] = useState(24);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontColor, setFontColor] = useState('#000000');
    const [fontWeight, setFontWeight] = useState('normal');
    const [fontStyle, setFontStyle] = useState('normal');
    
    useEffect(() => {
        loadPrograms();
        loadTemplates();
        initCanvas();
        
        return () => {
            if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose();
            }
        };
    }, []);

    useEffect(() => {
        if (id) {
            loadLayout(id);
        }
    }, [id]);

    const loadPrograms = async () => {
        try {
            const response = await fetch('/api/programs');
            const data = await response.json();
            setPrograms(data);
        } catch (error) {
            console.error('Error loading programs:', error);
        }
    };

    const loadTemplates = async () => {
        try {
            const response = await fetch('/api/certificate-templates');
            const data = await response.json();
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const loadTemplate = (template) => {
        if (window.confirm(`Load template "${template.layout_name}"? This will replace your current design.`)) {
            setLayoutName(template.layout_name + ' (Copy)');
            
            if (template.template_content) {
                const templateData = JSON.parse(template.template_content);
                fabricCanvasRef.current.loadFromJSON(templateData, () => {
                    fabricCanvasRef.current.renderAll();
                });
            }
            
            if (template.background_image) {
                loadBackgroundImage(template.background_image);
            }
            
            setShowTemplates(false);
        }
    };

    const loadLayout = async (layoutId) => {
        try {
            const response = await fetch(`/api/certificate-layouts/${layoutId}`);
            const data = await response.json();
            
            setLayoutName(data.layout_name);
            setSelectedProgram(data.program_id);
            setIsDefault(data.is_default);
            
            if (data.template_content) {
                const templateData = JSON.parse(data.template_content);
                fabricCanvasRef.current.loadFromJSON(templateData, () => {
                    fabricCanvasRef.current.renderAll();
                });
            }
            
            if (data.background_image) {
                loadBackgroundImage(data.background_image);
            }
        } catch (error) {
            console.error('Error loading layout:', error);
        }
    };

    const initCanvas = () => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1000,
            height: 700,
            backgroundColor: '#ffffff',
        });

        fabricCanvasRef.current = canvas;

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', () => setSelectedElement(null));
        canvas.on('object:modified', updateElementProperties);
    };

    const handleSelection = (e) => {
        const obj = e.selected[0];
        setSelectedElement(obj);
        
        if (obj.type === 'i-text' || obj.type === 'text') {
            setTextContent(obj.text);
            setFontSize(obj.fontSize);
            setFontFamily(obj.fontFamily);
            setFontColor(obj.fill);
            setFontWeight(obj.fontWeight);
            setFontStyle(obj.fontStyle);
        }
    };

    const updateElementProperties = () => {
        fabricCanvasRef.current.renderAll();
    };

    const addText = (type = 'normal') => {
        let text;
        
        const options = {
            left: 100,
            top: 100,
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#000000',
        };

        switch (type) {
            case 'student_name':
                text = new fabric.IText('{student_name}', {
                    ...options,
                    fontSize: 36,
                    fontWeight: 'bold',
                    fill: '#2563eb',
                });
                break;
            case 'program_name':
                text = new fabric.IText('{program_name}', {
                    ...options,
                    fontSize: 28,
                    fontWeight: 'bold',
                });
                break;
            case 'course_name':
                text = new fabric.IText('{course_name}', {
                    ...options,
                    fontSize: 26,
                    fontWeight: 'bold',
                    fill: '#1a1a1a',
                });
                break;
            case 'final_marks':
                text = new fabric.IText('{final_marks}', {
                    ...options,
                    fontSize: 32,
                    fontWeight: 'bold',
                    fill: '#10b981',
                });
                break;
            case 'date':
                text = new fabric.IText('{date}', { ...options, fontSize: 18 });
                break;
            case 'certificate_number':
                text = new fabric.IText('{certificate_number}', { ...options, fontSize: 16 });
                break;
            default:
                text = new fabric.IText('Double click to edit', options);
        }

        fabricCanvasRef.current.add(text);
        fabricCanvasRef.current.setActiveObject(text);
        fabricCanvasRef.current.renderAll();
    };

    const addShape = (type) => {
        let shape;
        
        switch (type) {
            case 'rectangle':
                shape = new fabric.Rect({
                    left: 100,
                    top: 100,
                    width: 200,
                    height: 100,
                    fill: 'transparent',
                    stroke: '#000000',
                    strokeWidth: 2,
                });
                break;
            case 'circle':
                shape = new fabric.Circle({
                    left: 100,
                    top: 100,
                    radius: 50,
                    fill: 'transparent',
                    stroke: '#000000',
                    strokeWidth: 2,
                });
                break;
            case 'line':
                shape = new fabric.Line([50, 100, 200, 100], {
                    stroke: '#000000',
                    strokeWidth: 2,
                });
                break;
        }

        fabricCanvasRef.current.add(shape);
        fabricCanvasRef.current.setActiveObject(shape);
        fabricCanvasRef.current.renderAll();
    };

    const handleBackgroundUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            fabric.Image.fromURL(event.target.result, (img) => {
                img.scaleToWidth(1000);
                img.scaleToHeight(700);
                fabricCanvasRef.current.setBackgroundImage(img, fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current), {
                    originX: 'left',
                    originY: 'top',
                });
            });
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            fabric.Image.fromURL(event.target.result, (img) => {
                img.scaleToWidth(200);
                img.set({
                    left: 100,
                    top: 100,
                });
                fabricCanvasRef.current.add(img);
                fabricCanvasRef.current.setActiveObject(img);
                fabricCanvasRef.current.renderAll();
            });
        };
        reader.readAsDataURL(file);
    };

    const updateTextProperties = () => {
        if (selectedElement && (selectedElement.type === 'i-text' || selectedElement.type === 'text')) {
            selectedElement.set({
                text: textContent,
                fontSize: parseInt(fontSize),
                fontFamily: fontFamily,
                fill: fontColor,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
            });
            fabricCanvasRef.current.renderAll();
        }
    };

    const deleteSelected = () => {
        const activeObjects = fabricCanvasRef.current.getActiveObjects();
        if (activeObjects.length) {
            activeObjects.forEach(obj => fabricCanvasRef.current.remove(obj));
            fabricCanvasRef.current.discardActiveObject();
            fabricCanvasRef.current.renderAll();
        }
    };

    const bringToFront = () => {
        const activeObject = fabricCanvasRef.current.getActiveObject();
        if (activeObject) {
            fabricCanvasRef.current.bringToFront(activeObject);
            fabricCanvasRef.current.renderAll();
        }
    };

    const sendToBack = () => {
        const activeObject = fabricCanvasRef.current.getActiveObject();
        if (activeObject) {
            fabricCanvasRef.current.sendToBack(activeObject);
            fabricCanvasRef.current.renderAll();
        }
    };

    const clearCanvas = () => {
        if (window.confirm('Are you sure you want to clear the entire canvas?')) {
            fabricCanvasRef.current.clear();
            fabricCanvasRef.current.backgroundColor = '#ffffff';
            fabricCanvasRef.current.renderAll();
        }
    };

    const handleSave = async () => {
        if (!layoutName.trim()) {
            alert('Please enter a layout name');
            return;
        }

        const templateContent = JSON.stringify(fabricCanvasRef.current.toJSON());
        const backgroundImage = fabricCanvasRef.current.backgroundImage ? 
            fabricCanvasRef.current.backgroundImage.getSrc() : null;

        const data = {
            layout_name: layoutName,
            program_id: selectedProgram || null,
            template_content: templateContent,
            background_image: backgroundImage,
            is_default: isDefault,
        };

        try {
            const url = id ? `/api/certificate-layouts/${id}` : '/api/certificate-layouts';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert('Certificate layout saved successfully!');
                navigate('/admin/certificates');
            } else {
                alert('Error saving certificate layout');
            }
        } catch (error) {
            console.error('Error saving layout:', error);
            alert('Error saving certificate layout');
        }
    };

    return (
        <div className="certificate-designer">
            <div className="designer-header">
                <h2>{id ? 'Edit' : 'Create'} Certificate Layout</h2>
                <div className="header-actions">
                    <button className="btn btn-info" onClick={() => setShowTemplates(!showTemplates)}>
                        📋 {showTemplates ? 'Hide' : 'Load'} Templates
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/certificates')}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        Save Layout
                    </button>
                </div>
            </div>

            {showTemplates && (
                <div className="template-gallery">
                    <h3>Choose a Template</h3>
                    <div className="template-grid">
                        {templates.map(template => (
                            <div 
                                key={template.id} 
                                className="template-card"
                                onClick={() => loadTemplate(template)}
                            >
                                <div className="template-preview">
                                    <div className="template-name">{template.layout_name}</div>
                                    <div className="template-description">
                                        Click to load this template
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="designer-content">
                {/* Toolbar */}
                <div className="designer-toolbar">
                    <div className="toolbar-section">
                        <h4>Add Elements</h4>
                        <button className="tool-btn" onClick={() => addText('normal')}>
                            📝 Text
                        </button>
                        <button className="tool-btn" onClick={() => addText('student_name')}>
                            👤 Student Name
                        </button>
                        <button className="tool-btn" onClick={() => addText('program_name')}>
                            🎓 Program Name
                        </button>
                        <button className="tool-btn" onClick={() => addText('course_name')}>
                            📚 Course Name
                        </button>
                        <button className="tool-btn" onClick={() => addText('final_marks')}>
                            ⭐ Final Marks
                        </button>
                        <button className="tool-btn" onClick={() => addText('date')}>
                            📅 Date
                        </button>
                        <button className="tool-btn" onClick={() => addText('certificate_number')}>
                            🔢 Cert Number
                        </button>
                    </div>

                    <div className="toolbar-section">
                        <h4>Shapes</h4>
                        <button className="tool-btn" onClick={() => addShape('rectangle')}>
                            ▭ Rectangle
                        </button>
                        <button className="tool-btn" onClick={() => addShape('circle')}>
                            ⬤ Circle
                        </button>
                        <button className="tool-btn" onClick={() => addShape('line')}>
                            ─ Line
                        </button>
                    </div>

                    <div className="toolbar-section">
                        <h4>Images</h4>
                        <label className="tool-btn">
                            🖼️ Background
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleBackgroundUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <label className="tool-btn">
                            🖼️ Logo/Image
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    <div className="toolbar-section">
                        <h4>Actions</h4>
                        <button className="tool-btn" onClick={deleteSelected}>
                            🗑️ Delete
                        </button>
                        <button className="tool-btn" onClick={bringToFront}>
                            ⬆️ Bring Front
                        </button>
                        <button className="tool-btn" onClick={sendToBack}>
                            ⬇️ Send Back
                        </button>
                        <button className="tool-btn" onClick={clearCanvas}>
                            🧹 Clear All
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="designer-canvas-area">
                    <div className="canvas-wrapper">
                        <canvas ref={canvasRef} />
                    </div>
                </div>

                {/* Properties Panel */}
                <div className="designer-properties">
                    <div className="properties-section">
                        <h4>Layout Settings</h4>
                        <div className="form-group">
                            <label>Layout Name</label>
                            <input 
                                type="text" 
                                value={layoutName}
                                onChange={(e) => setLayoutName(e.target.value)}
                                placeholder="Enter layout name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Program</label>
                            <select 
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                            >
                                <option value="">All Programs</option>
                                {programs.map(prog => (
                                    <option key={prog.id} value={prog.id}>
                                        {prog.program_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                />
                                Set as default for program
                            </label>
                        </div>
                    </div>

                    {selectedElement && (selectedElement.type === 'i-text' || selectedElement.type === 'text') && (
                        <div className="properties-section">
                            <h4>Text Properties</h4>
                            <div className="form-group">
                                <label>Text Content</label>
                                <input 
                                    type="text" 
                                    value={textContent}
                                    onChange={(e) => {
                                        setTextContent(e.target.value);
                                        selectedElement.set('text', e.target.value);
                                        fabricCanvasRef.current.renderAll();
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Font Family</label>
                                <select 
                                    value={fontFamily}
                                    onChange={(e) => {
                                        setFontFamily(e.target.value);
                                        selectedElement.set('fontFamily', e.target.value);
                                        fabricCanvasRef.current.renderAll();
                                    }}
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Font Size</label>
                                <input 
                                    type="number" 
                                    value={fontSize}
                                    onChange={(e) => {
                                        setFontSize(e.target.value);
                                        selectedElement.set('fontSize', parseInt(e.target.value));
                                        fabricCanvasRef.current.renderAll();
                                    }}
                                    min="8"
                                    max="200"
                                />
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <input 
                                    type="color" 
                                    value={fontColor}
                                    onChange={(e) => {
                                        setFontColor(e.target.value);
                                        selectedElement.set('fill', e.target.value);
                                        fabricCanvasRef.current.renderAll();
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Style</label>
                                <div className="button-group">
                                    <button 
                                        className={`style-btn ${fontWeight === 'bold' ? 'active' : ''}`}
                                        onClick={() => {
                                            const newWeight = fontWeight === 'bold' ? 'normal' : 'bold';
                                            setFontWeight(newWeight);
                                            selectedElement.set('fontWeight', newWeight);
                                            fabricCanvasRef.current.renderAll();
                                        }}
                                    >
                                        <strong>B</strong>
                                    </button>
                                    <button 
                                        className={`style-btn ${fontStyle === 'italic' ? 'active' : ''}`}
                                        onClick={() => {
                                            const newStyle = fontStyle === 'italic' ? 'normal' : 'italic';
                                            setFontStyle(newStyle);
                                            selectedElement.set('fontStyle', newStyle);
                                            fabricCanvasRef.current.renderAll();
                                        }}
                                    >
                                        <em>I</em>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="properties-section">
                        <h4>Help</h4>
                        <div className="help-text">
                            <p><strong>Variables:</strong></p>
                            <ul>
                                <li><code>{'{student_name}'}</code> - Student's name</li>
                                <li><code>{'{program_name}'}</code> - Program name</li>
                                <li><code>{'{course_name}'}</code> - Course name</li>
                                <li><code>{'{final_marks}'}</code> - Final marks/grade</li>
                                <li><code>{'{date}'}</code> - Issue date</li>
                                <li><code>{'{certificate_number}'}</code> - Unique cert ID</li>
                            </ul>
                            <p><strong>Tips:</strong></p>
                            <ul>
                                <li>Double-click text to edit</li>
                                <li>Drag elements to position</li>
                                <li>Use corner handles to resize</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateDesigner;
