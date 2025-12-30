from fastapi import FastAPI, UploadFile, File, HTTPException
import pytesseract
from PIL import Image
import io
import pdf2image
import docx

app = FastAPI()

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    filename = file.filename.lower()
    try:
        content = await file.read()
        

        if filename.endswith(".pdf"):

            images = pdf2image.convert_from_bytes(content)
            text_pages = [pytesseract.image_to_string(img, lang='por') for img in images]
            return {"texto": "\n".join(text_pages), "tipo": "pdf"}


        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            text_parts = [para.text for para in doc.paragraphs]
            return {"texto": "\n".join(text_parts), "tipo": "docx"}


        elif filename.endswith(".txt"):
            return {"texto": content.decode("utf-8"), "tipo": "txt"}


        elif filename.endswith((".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp")):
            image = Image.open(io.BytesIO(content))
            text = pytesseract.image_to_string(image, lang='por')
            return {"texto": text.strip(), "tipo": "imagem"}

        else:
            raise HTTPException(status_code=400, detail=f"Extensão de arquivo {filename} não suportada.")

    except Exception as e:

        print(f"Erro ao processar arquivo {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar o documento.")
