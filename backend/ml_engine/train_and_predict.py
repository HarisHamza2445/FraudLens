"""
FraudLens: Machine Learning UPI Scam Classifier
Model: Scikit-Learn TF-IDF Vectorizer + Multinomial Naive Bayes / Logistic Regression Pipeline
Trained on Indian Cyber Crime & UPI Scam Corpus (English + Hinglish)
"""

import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

def load_dataset():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, 'dataset.json')
    with open(dataset_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    texts = [item['text'] for item in data]
    labels = [item['label'] for item in data]
    return texts, labels

def train_model():
    texts, labels = load_dataset()
    print(f"Loaded {len(texts)} samples from Indian UPI Scam Corpus.")

    # High precision TF-IDF vectorizer with n-grams (1-2) to capture phrases like 'upi pin', 'line cut'
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english', lowercase=True)),
        ('clf', MultinomialNB(alpha=0.1))
    ])

    pipeline.fit(texts, labels)
    preds = pipeline.predict(texts)
    acc = accuracy_score(labels, preds)
    print(f"FraudLens ML Model Training Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(labels, preds))

    # Sanity checks on representative samples
    test_cases = [
        "Dear user your electricity power will be disconnected at 9:30 PM call officer 9876543210 immediately",
        "Congratulations! Scan this QR and enter UPI PIN to receive Rs 5000 cashback",
        "Sent Rs 250 to Chai Point via UPI ref 409281726354"
    ]
    print("Evaluating Test Scenarios:")
    for test in test_cases:
        pred = pipeline.predict([test])[0]
        probs = pipeline.predict_proba([test])[0]
        print(f"Input: {test}")
        print(f"Prediction: {pred} | Probabilities: {probs}\n")

if __name__ == '__main__':
    train_model()
