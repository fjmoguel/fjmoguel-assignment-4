from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Load the 20 Newsgroups dataset
newsgroups = fetch_20newsgroups(subset='all')
documents = newsgroups.data

# Step 1: Create a Term-Document Matrix using TF-IDF
vectorizer = TfidfVectorizer(stop_words='english')
X = vectorizer.fit_transform(documents)  # Term-document matrix (TF-IDF)

# Step 2: Apply SVD to the matrix to reduce its dimensionality (performing LSA)
svd = TruncatedSVD(n_components=100)  # Reduce to 100 dimensions
X_reduced = svd.fit_transform(X)

# Step 3: Normalize the reduced matrix for cosine similarity calculation
X_reduced_normalized = X_reduced / np.linalg.norm(X_reduced, axis=1, keepdims=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    query = data['query']
    
    # Step 4: Process the user query
    query_vector = vectorizer.transform([query])  # Transform the query into the same TF-IDF space
    query_reduced = svd.transform(query_vector)   # Project the query into the reduced LSA space
    query_reduced_normalized = query_reduced / np.linalg.norm(query_reduced)
    
    # Step 5: Compute cosine similarity between query and all documents
    similarities = cosine_similarity(query_reduced_normalized, X_reduced_normalized)
    
    # Step 6: Get top 5 most similar documents
    top_docs_idx = similarities.argsort()[0][-5:][::-1]
    top_docs = [{
        'text': documents[i],
        'similarity': similarities[0][i],
        'category': newsgroups.target_names[newsgroups.target[i]]
    } for i in top_docs_idx]
    
    # Return the results as JSON
    return jsonify(results=top_docs)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3000)
