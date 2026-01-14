"""
Thumbnail generator for PPT/PPTX files using LibreOffice
Converts first slide to PNG image for preview
"""
import os
import subprocess
import shutil
from pathlib import Path

# LibreOffice paths for macOS
LIBREOFFICE_PATHS = [
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/usr/local/bin/soffice',
    '/opt/homebrew/bin/soffice',
    'soffice'  # System PATH
]

def get_libreoffice_path():
    """Find LibreOffice executable"""
    for path in LIBREOFFICE_PATHS:
        if os.path.exists(path) or shutil.which(path):
            return path
    return None

def generate_thumbnail(ppt_path, output_dir, output_name=None):
    """
    Generate a thumbnail from the first slide of a PPT/PPTX file.
    
    Args:
        ppt_path: Path to the PPT/PPTX file
        output_dir: Directory to save the thumbnail
        output_name: Optional custom name for output (without extension)
    
    Returns:
        Path to the generated thumbnail, or None if failed
    """
    soffice = get_libreoffice_path()
    if not soffice:
        print("LibreOffice not found")
        return None
    
    ppt_path = Path(ppt_path)
    output_dir = Path(output_dir)
    
    if not ppt_path.exists():
        print(f"PPT file not found: {ppt_path}")
        return None
    
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create a temp directory for LibreOffice output
    temp_dir = output_dir / 'temp_thumb'
    temp_dir.mkdir(exist_ok=True)
    
    try:
        # Convert PPT to PDF first (LibreOffice headless)
        cmd = [
            soffice,
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', str(temp_dir),
            str(ppt_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode != 0:
            print(f"LibreOffice conversion failed: {result.stderr}")
            return None
        
        # Find the generated PDF
        pdf_name = ppt_path.stem + '.pdf'
        pdf_path = temp_dir / pdf_name
        
        if not pdf_path.exists():
            print(f"PDF not generated: {pdf_path}")
            return None
        
        # Now convert PDF first page to PNG using sips (macOS) or ImageMagick
        if output_name:
            thumb_name = f"{output_name}.png"
        else:
            thumb_name = f"{ppt_path.stem}_thumb.png"
        
        thumb_path = output_dir / thumb_name
        
        # Try using pdftoppm (poppler) for better quality
        try:
            cmd_pdf = [
                'pdftoppm',
                '-png',
                '-f', '1',  # First page
                '-l', '1',  # Last page (same as first)
                '-r', '150',  # Resolution
                str(pdf_path),
                str(output_dir / ppt_path.stem)
            ]
            subprocess.run(cmd_pdf, capture_output=True, timeout=30)
            
            # pdftoppm adds -1 suffix
            generated_thumb = output_dir / f"{ppt_path.stem}-1.png"
            if generated_thumb.exists():
                generated_thumb.rename(thumb_path)
        except Exception:
            # Fallback: just copy the PDF (browsers can display PDFs)
            shutil.copy(pdf_path, output_dir / f"{ppt_path.stem}.pdf")
            thumb_path = output_dir / f"{ppt_path.stem}.pdf"
        
        return thumb_path if thumb_path.exists() else None
        
    except subprocess.TimeoutExpired:
        print("Conversion timed out")
        return None
    except Exception as e:
        print(f"Error generating thumbnail: {e}")
        return None
    finally:
        # Cleanup temp directory
        if temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)


def generate_thumbnail_simple(ppt_path, output_dir):
    """
    Simpler approach: Just convert to PDF for browser viewing
    """
    soffice = get_libreoffice_path()
    if not soffice:
        return None
    
    ppt_path = Path(ppt_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        cmd = [
            soffice,
            '--headless',
            '--convert-to', 'png',
            '--outdir', str(output_dir),
            str(ppt_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        # LibreOffice creates PNG with same name
        png_path = output_dir / f"{ppt_path.stem}.png"
        
        return png_path if png_path.exists() else None
        
    except Exception as e:
        print(f"Error: {e}")
        return None


if __name__ == '__main__':
    # Test
    import sys
    if len(sys.argv) > 1:
        result = generate_thumbnail_simple(sys.argv[1], './thumbnails')
        print(f"Generated: {result}")
    else:
        print("Usage: python thumbnail_generator.py <ppt_file>")
