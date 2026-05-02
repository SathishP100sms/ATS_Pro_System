from sentence_transformers import SentenceTransformer
from typing import Union, List
import threading


class EmbeddingModel:
    _instance = None
    _lock = threading.Lock()  

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance.model = SentenceTransformer("all-MiniLM-L6-v2")
        return cls._instance

    def get_embedding(
        self,
        text: Union[str, List[str]],
        normalize: bool = True
    ):
        if not text:
            raise ValueError("Text cannot be empty")

        try:
            is_single = isinstance(text, str)
            texts = [text] if is_single else text

            embeddings = self.model.encode(
                texts,
                normalize_embeddings=normalize,
                show_progress_bar=False
            )

            return embeddings[0] if is_single else embeddings

        except Exception as e:
            raise Exception(f"Error generating embeddings: {str(e)}")

