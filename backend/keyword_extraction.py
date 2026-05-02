from typing import Set, List
import spacy
import threading


class KeywordsExtractor:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance.nlp = spacy.load("en_core_web_sm")
        return cls._instance

    def extract_keywords(
        self,
        text: str,
        include_verbs: bool = False,
        remove_stopwords: bool = True
    ) -> Set[str]:
        """
        Extract keywords + key phrases from text
        """

        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")

        try:
            doc = self.nlp(text)

            keywords = set()

            # ---------------- TOKEN-LEVEL ---------------- #
            pos_tags = ["NOUN", "PROPN"]
            if include_verbs:
                pos_tags.append("VERB")

            for token in doc:
                if token.pos_ in pos_tags:
                    if remove_stopwords and token.is_stop:
                        continue

                    lemma = token.lemma_.lower()

                    if lemma not in {"-pron-", "be", "have", "do"} and len(lemma) > 2:
                        keywords.add(lemma)

            # ---------------- PHRASE-LEVEL (IMPORTANT) ---------------- #
            for chunk in doc.noun_chunks:
                phrase = chunk.text.lower().strip()

                if remove_stopwords:
                    words = [w for w in phrase.split() if w not in self.nlp.Defaults.stop_words]
                    phrase = " ".join(words)

                if len(phrase.split()) >= 2:  # only meaningful phrases
                    keywords.add(phrase)

            return keywords

        except Exception as e:
            raise Exception(f"Error extracting keywords: {str(e)}")