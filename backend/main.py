from typing import Dict, Tuple, List
from sklearn.metrics.pairwise import cosine_similarity
from keyword_extraction import KeywordsExtractor


class ATSScore:
    def __init__(self, embedder):
        self.embedder = embedder
        self.keyword_extractor = KeywordsExtractor()

    # ---------------- TEXT CLEANING ---------------- #
    def _clean_text(self, text: str) -> str:
        return " ".join(text.strip().lower().split())

    # ---------------- CHUNKING (IMPORTANT) ---------------- #
    def _chunk_text(self, text: str, chunk_size: int = 300) -> List[str]:
        words = text.split()
        return [
            " ".join(words[i:i + chunk_size])
            for i in range(0, len(words), chunk_size)
        ]

    # ---------------- SEMANTIC SCORE ---------------- #
    def semantic_score(self, resume: str, jd: str) -> float:
        if not resume or not jd:
            raise ValueError("Resume and Job Description cannot be empty")

        try:
            resume = self._clean_text(resume)
            jd = self._clean_text(jd)

            # Chunk both texts
            resume_chunks = self._chunk_text(resume)
            jd_chunks = self._chunk_text(jd)

            resume_embeddings = self.embedder.get_embedding(resume_chunks)
            jd_embeddings = self.embedder.get_embedding(jd_chunks)

            scores = []

            # Compare each JD chunk with best resume chunk
            for jd_emb in jd_embeddings:
                similarities = cosine_similarity(
                    [jd_emb], resume_embeddings
                )[0]
                scores.append(max(similarities))

            # Final semantic score = average best matches
            return sum(scores) / len(scores) if scores else 0.0

        except Exception as e:
            raise Exception(f"Error calculating semantic score: {str(e)}")

    # ---------------- KEYWORD SCORE ---------------- #
    def keyword_score(self, resume: str, jd: str) -> Tuple[float, List[str]]:
        if not resume or not jd:
            raise ValueError("Resume and Job Description cannot be empty")

        try:
            resume_keywords = self.keyword_extractor.extract_keywords(resume)
            jd_keywords = self.keyword_extractor.extract_keywords(jd)

            if len(jd_keywords) == 0:
                return 0.0, []

            matched_keywords = resume_keywords.intersection(jd_keywords)
            missing_keywords = jd_keywords.difference(resume_keywords)

            score = len(matched_keywords) / len(jd_keywords)

            return score, sorted(list(missing_keywords))

        except Exception as e:
            raise Exception(f"Error calculating keyword score: {str(e)}")

    # ---------------- FINAL SCORE ---------------- #
    def final_score(
        self,
        resume: str,
        jd: str,
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3
    ) -> Dict:

        if not resume or not resume.strip() or not jd or not jd.strip():
            raise ValueError("Resume and Job Description cannot be empty")

        try:
            sem_score = self.semantic_score(resume, jd)
            key_score, missing_keywords = self.keyword_score(resume, jd)

            final = (semantic_weight * sem_score) + (keyword_weight * key_score)

            return {
                "semantic_score": round(sem_score, 3),
                "keyword_score": round(key_score, 3),
                "final_score": round(final, 3),
                "missing_keywords": missing_keywords[:15],
                "total_missing_keywords": len(missing_keywords),
                "matched_keywords": int(len(missing_keywords) == 0)
            }

        except Exception as e:
            raise Exception(f"Error calculating final score: {str(e)}")