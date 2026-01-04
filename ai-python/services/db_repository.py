import mysql.connector
import os

class DbRepository:
    def __init__(self):
        
        self.config = {
            'host': os.getenv("DB_HOST", "db"),
            'user': os.getenv("DB_USER", "root"),
            'password': os.getenv("DB_PASSWORD", "imobiscan_secure_password"),
            'database': os.getenv("DB_NAME", "imobiscan"),
            'port': int(os.getenv("DB_PORT", 3306))
        }

    def buscar_texto_por_id(self, id_documento: str):
        conexao = None
        try:
            conexao = mysql.connector.connect(**self.config)
            cursor = conexao.cursor(dictionary=True)
            
            query = "SELECT textoExtraido FROM analises WHERE documento_id = %s"
            cursor.execute(query, (id_documento,))
            
            resultado = cursor.fetchone()
            cursor.close()
            
            if resultado:
                return resultado['textoExtraido']
            return None
            
        except Exception as e:
            print(f"Erro na consulta ao banco: {e}")
            return None
        finally:
            if conexao and conexao.is_connected():
                conexao.close()

