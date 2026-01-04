import io
import re
import cv2
import docx
import numpy as np
import pytesseract
import pdf2image
from typing import Dict, Optional

class OCRService:
    @staticmethod
    def extrair_metadados(text: str) -> Dict[str, Optional[str]]:

        metadados: Dict[str, Optional[str]] = {
            "valor_contrato": None,
            "cpf_encontrado": None,
            "data_contrato": None
        }
        
        valor_res = re.search(r"R\$\s?(\d{1,3}(\.\d{3})*,\d{2})", text)
        if valor_res:
            metadados["valor_contrato"] = valor_res.group(1)

        cpf_res = re.search(r"(\d{3}\.\d{3}\.\d{3}-\d{2})", text)
        if cpf_res:
            metadados["cpf_encontrado"] = cpf_res.group(1)
            
        data_res = re.search(r"(\d{2}/\d{2}/\d{4})", text)
        if data_res:
            metadados["data_contrato"] = data_res.group(1)

        return metadados

    @staticmethod
    def melhorar_qualidade_imagem(image_bytes):
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

    async def processar_arquivo(self, filename: str, content: bytes):
        filename = filename.lower()
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
                processed = self.melhorar_qualidade_imagem(img_byte_arr.getvalue())
                if processed is not None:
                    pages.append(pytesseract.image_to_string(processed, lang='por', config='--psm 3'))
            texto_final = "\n\n".join(pages)
            status_info = "ocr_pdf"
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            processed = self.melhorar_qualidade_imagem(content)
            if processed is not None:
                texto_final = pytesseract.image_to_string(processed, lang='por', config='--psm 1')
                status_info = "ocr_imagem"

        metadados = self.extrair_metadados(texto_final)
        return texto_final, metadados, status_info
