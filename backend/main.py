from typing import Dict, Tuple, List

from sklearn.metrics.pairwise import cosine_similarity

try:
    from keyword_extraction import KeywordsExtractor
except ImportError:
    from .keyword_extraction import KeywordsExtractor


class ATSScore:

    def __init__(self, embedder):
        self.embedder = embedder
        self.keyword_extractor = KeywordsExtractor()

    # --------------------------------------------------
    # TEXT CLEANING
    # --------------------------------------------------

    def _clean_text(self, text: str) -> str:
        return " ".join(
            text.strip().lower().split()
        )

    # --------------------------------------------------
    # TEXT CHUNKING
    # --------------------------------------------------

    def _chunk_text(
        self,
        text: str,
        chunk_size: int = 300
    ) -> List[str]:

        words = text.split()

        if not words:
            return []

        return [
            " ".join(words[i:i + chunk_size])
            for i in range(
                0,
                len(words),
                chunk_size
            )
        ]

    # --------------------------------------------------
    # SEMANTIC SCORE
    # --------------------------------------------------

    def semantic_score(
        self,
        resume: str,
        jd: str
    ) -> float:

        if not resume or not jd:
            raise ValueError(
                "Resume and Job Description cannot be empty"
            )

        resume = self._clean_text(resume)
        jd = self._clean_text(jd)

        resume_chunks = self._chunk_text(resume)
        jd_chunks = self._chunk_text(jd)

        if not resume_chunks:
            raise ValueError(
                "Resume contains no usable content"
            )

        if not jd_chunks:
            raise ValueError(
                "Job description contains no usable content"
            )

        resume_embeddings = self.embedder.get_embedding(
            resume_chunks
        )

        jd_embeddings = self.embedder.get_embedding(
            jd_chunks
        )

        scores = []

        for jd_emb in jd_embeddings:

            similarities = cosine_similarity(
                [jd_emb],
                resume_embeddings
            )[0]

            scores.append(
                float(max(similarities))
            )

        if not scores:
            return 0.0

        return round(
            sum(scores) / len(scores),
            4
        )

    # --------------------------------------------------
    # KEYWORD SCORE
    # --------------------------------------------------

    def keyword_score(
        self,
        resume: str,
        jd: str
    ) -> Tuple[float, List[str]]:

        if not resume or not jd:
            raise ValueError(
                "Resume and Job Description cannot be empty"
            )

        resume_keywords = (
            self.keyword_extractor
            .extract_keywords(resume)
        )

        jd_keywords = (
            self.keyword_extractor
            .extract_keywords(jd)
        )

        if not jd_keywords:
            return 0.0, []

        matched_keywords = (
            resume_keywords.intersection(
                jd_keywords
            )
        )

        missing_keywords = (
            jd_keywords.difference(
                resume_keywords
            )
        )

        score = (
            len(matched_keywords)
            / len(jd_keywords)
        )

        return (
            round(score, 4),
            sorted(list(missing_keywords))
        )

    # --------------------------------------------------
    # FINAL SCORE
    # --------------------------------------------------

    def final_score(
        self,
        resume: str,
        jd: str,
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3
    ) -> Dict:

        if (
            not resume
            or not resume.strip()
            or not jd
            or not jd.strip()
        ):
            raise ValueError(
                "Resume and Job Description cannot be empty"
            )

        if (
            round(
                semantic_weight + keyword_weight,
                5
            ) != 1.0
        ):
            raise ValueError(
                "Weights must sum to 1"
            )

        sem_score = self.semantic_score(
            resume,
            jd
        )

        key_score, missing_keywords = (
            self.keyword_score(
                resume,
                jd
            )
        )

        final = (
            semantic_weight * sem_score
            + keyword_weight * key_score
        )

        return {
            "semantic_score": round(
                sem_score,
                4
            ),
            "keyword_score": round(
                key_score,
                4
            ),
            "final_score": round(
                final,
                4
            ),
            "missing_keywords":
                missing_keywords[:15],
            "total_missing_keywords":
                len(missing_keywords),
            "matched_keywords":
                len(missing_keywords) == 0
        }
