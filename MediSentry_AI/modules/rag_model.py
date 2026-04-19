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

    def generate_explanation(self, risk_level, context):
        """
        Generates doctor-friendly explanation for both interactions and clinical alerts.
        """
        explanations = []
        for item in context:
            if 'drug_a' in item and 'drug_b' in item:
                # DDI Interaction
                d1, d2 = item['drug_a'], item['drug_b']
                query = f"{d1} {d2} interaction"
                label = f"{d1} + {d2}"
            else:
                # Clinical Alert (Allergy, Contraindication, etc)
                drug = item.get('drug', 'Unknown Drug')
                reason = item.get('reason', '')
                query = f"{drug} {reason}"
                label = drug

            evidence = self.retrieve_context(query)
            
            explanations.append({
                'pair': label,
                'mechanism': evidence,
                'recommendation': item.get('reason', 'Consult clinical guidelines for management.'),
                'evidence_source': "MediSentry AI Knowledge Base"
            })
            
        return explanations
