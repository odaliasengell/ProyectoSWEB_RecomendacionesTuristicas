"""
Procesador Multimodal
Maneja diferentes tipos de entrada: imágenes (OCR), PDFs, etc.
"""
from typing import Dict, Any
import io
import os
from PIL import Image
import pytesseract
import PyPDF2
import pdfplumber

# Configurar ruta de Tesseract en Windows
if os.name == 'nt':
    tesseract_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Users\DESKTOP\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
    ]
    for path in tesseract_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break


class MultimodalProcessor:
    """Procesador de diferentes tipos de contenido"""
    
    async def process_image(self, image_data: bytes) -> str:
        """
        Procesar imagen con OCR
        Extrae texto de imágenes
        """
        try:
            # Abrir imagen
            image = Image.open(io.BytesIO(image_data))
            
            # Aplicar OCR
            text = pytesseract.image_to_string(image, lang='spa+eng')
            
            # Obtener información adicional
            width, height = image.size
            format_img = image.format
            
            result = f"""
Dimensiones: {width}x{height}
Formato: {format_img}

Texto extraído:
{text}
            """.strip()
            
            return result if text.strip() else "No se detectó texto en la imagen"
            
        except Exception as e:
            return f"Error procesando imagen: {str(e)}"
    
    async def process_pdf(self, pdf_data: bytes) -> Dict[str, Any]:
        """
        Procesar PDF y extraer contenido
        Extrae texto, metadatos, tablas, etc.
        """
        try:
            result = {
                "text": "",
                "metadata": {},
                "pages": 0,
                "tables": []
            }
            
            # Método 1: PyPDF2 para metadatos y texto básico
            pdf_file = io.BytesIO(pdf_data)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            result["pages"] = len(pdf_reader.pages)
            result["metadata"] = {
                "title": pdf_reader.metadata.get("/Title", "N/A") if pdf_reader.metadata else "N/A",
                "author": pdf_reader.metadata.get("/Author", "N/A") if pdf_reader.metadata else "N/A",
                "creator": pdf_reader.metadata.get("/Creator", "N/A") if pdf_reader.metadata else "N/A",
            }
            
            # Extraer texto de todas las páginas
            text_parts = []
            for page_num, page in enumerate(pdf_reader.pages, 1):
                text = page.extract_text()
                if text.strip():
                    text_parts.append(f"--- Página {page_num} ---\n{text}")
            
            # Método 2: pdfplumber para extracción más detallada
            pdf_file.seek(0)  # Reiniciar buffer
            with pdfplumber.open(pdf_file) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    # Extraer tablas
                    tables = page.extract_tables()
                    if tables:
                        result["tables"].extend([
                            {"page": page_num, "data": table}
                            for table in tables
                        ])
            
            result["text"] = "\n\n".join(text_parts) if text_parts else "No se pudo extraer texto del PDF"
            
            # Limitar longitud del texto para no saturar el LLM
            if len(result["text"]) > 4000:
                result["text"] = result["text"][:4000] + "\n\n[... texto truncado ...]"
            
            return result
            
        except Exception as e:
            return {
                "text": f"Error procesando PDF: {str(e)}",
                "metadata": {},
                "pages": 0,
                "tables": []
            }
    
    async def process_audio(self, audio_data: bytes) -> str:
        """
        Procesar audio (bonus - implementación futura)
        Transcripción de voz a texto
        """
        # TODO: Implementar con Whisper API o similar
        return "Procesamiento de audio no implementado aún"
