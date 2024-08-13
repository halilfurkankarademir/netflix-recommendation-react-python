from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

filepath = "./netflix_titles.csv"


data = pd.read_csv(filepath)
data = data.fillna('')
data['tags'] = data['description'] + " " + data['listed_in'] + " " + data['country'] + " " +data['cast']

vectorizer = TfidfVectorizer(stop_words='english')
vectors = vectorizer.fit_transform(data['tags'].values.astype('U'))
similarity_matrix = cosine_similarity(vectors)

@app.route('/recommend', methods=['GET'])
def recommend_movie():
    movie_name = request.args.get('movieName')
    if not movie_name:
        return jsonify({'error': 'Movie name is required'}), 400

    if movie_name not in data['title'].values:
        return jsonify({'error': 'Movie not found'}), 404

    index = data[data['title'] == movie_name].index[0]
    distances = sorted(list(enumerate(similarity_matrix[index])), reverse=True, key=lambda x: x[1])


    recommendations = [
        {
            'title': data.iloc[i[0]].title,
            'description': data.iloc[i[0]].description
        }
        for i in distances[1:10] 
    ]
    

    return jsonify({'recommendations': recommendations})

if __name__ == '__main__':
    app.run(debug=True)
