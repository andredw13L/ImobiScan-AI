import io
import re
import cv2
import docx
import numpy as np
import pytesseract
import pdf2image
from typing import Dict, Optional, Any
from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI(title="Imobiscan AI", description="Motor de OCR e Extração de Dados")


def extract_metadata(text: str) -> Dict[str, Optional[str]]:

    metadata: Dict[str, Optional[str]] = {
        "valor_contrato": None,
        "cpf_encontrado": None,
        "data_contrato": None
    }
    
    valor_res = re.search(r"R\$\s?(\d{1,3}(\.\d{3})*,\d{2})", text)
    if valor_res:
        metadata["valor_contrato"] = valor_res.group(1)

    cpf_res = re.search(r"(\d{3}\.\d{3}\.\d{3}-\d{2})", text)
    if cpf_res:
        metadata["cpf_encontrado"] = cpf_res.group(1)
        
    data_res = re.search(r"(\d{2}/\d{2}/\d{4})", text)
    if data_res:
        metadata["data_contrato"] = data_res.group(1)

    return metadata

def improve_image_quality(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None: return None

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    height, width = gray.shape[:2]
    target_height = 2200.0  

    if height < target_height:
        factor = target_height / height
        gray = cv2.resize(gray, (int(width * factor), int(height * factor)), interpolation=cv2.INTER_CUBIC)

    processed_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return processed_img

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    filename = file.filename.lower()
    content = await file.read()
    
    try:
        texto_final = ""
        status_info = ""

        if filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            texto_final = "\n".join([para.text for para in doc.paragraphs])
            status_info = "digital"
        elif filename.endswith(".txt"):
            texto_final = content.decode("utf-8")
            status_info = "digital"
        elif filename.endswith(".pdf"):
            images = pdf2image.convert_from_bytes(content)
            pages = []
            for img in images:
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                processed = improve_image_quality(img_byte_arr.getvalue())
                if processed is not None:
                    pages.append(pytesseract.image_to_string(processed, lang='por', config='--psm 3'))
            texto_final = "\n\n".join(pages)
            status_info = "ocr_pdf"
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            processed = improve_image_quality(content)
            if processed is not None:
                texto_final = pytesseract.image_to_string(processed, lang='por', config='--psm 1')
                status_info = "ocr_imagem"

        metadados = extract_metadata(texto_final)

        return {
            "texto": texto_final,
            "metadados": metadados,
            "tipo": filename.split('.')[-1],
            "status": status_info
        }

    except Exception as e:
        print(f"Erro: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno no processamento.")