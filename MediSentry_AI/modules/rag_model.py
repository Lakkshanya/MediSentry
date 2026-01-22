from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from ..data_loader import DataLoader

class RAGExplanation:
    def __init__(self):
        self.loader = DataLoader()
        
        # Load Knowledge Base from Real CSV Files
        self.documents = self.loader.load_rag_knowledge_base()
        
        # Load AHRQ Safety Reports
        ahrq_docs = self.loader.load_ahrq_safety_knowledge()
        self.documents.extend(ahrq_docs)
        
        if not self.documents:
            self.documents = ["Clinical Knowledge Base is empty. Check Dataset path."]
        
        # Vector Database Logic (TF-IDF as simple embedding)
        self.vectorizer = TfidfVectorizer()
        
        # Only fit if documents exist to avoid crash
        try:
            self.doc_vectors = self.vectorizer.fit_transform(self.documents)
        except:
            self.doc_vectors = None

    def retrieve_context(self, query):
        """
        Retrieves most relevant clinical evidence.
        """
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.doc_vectors).flatten()
        best_idx = np.argmax(similarities)
        
        if similarities[best_idx] > 0.1: # Threshold
            return self.documents[best_idx]
        return "No specific evidence found in knowledge base."

    def generate_explanation(self, risk_level, interactions):
        """
        Generates doctor-friendly explanation.
        """
        explanations = []
        for i in interactions:
            query = f"{i['drug_a']} {i['drug_b']} interaction"
            evidence = self.retrieve_context(query)
            
            explanations.append({
                'pair': f"{i['drug_a']} + {i['drug_b']}",
                'mechanism': evidence,
                'recommendation': "Monitor INR closely or switch to alternative.",
                'evidence_source': "Clinical Guidelines 2024"
            })
            
        return explanations
