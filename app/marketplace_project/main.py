from flask import Flask, request, jsonify
from flask_cors import CORS
from marketplace_project.database import db, Product
import redis
from elasticsearch import Elasticsearch
import logging
from logging.handlers import RotatingFileHandler
import os

app = Flask(__name__)
CORS(app)

# Конфигурация
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:12345@db:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key'

# Инициализация
db.init_app(app)
redis_client = redis.Redis(host='redis', port=6379, db=0)
es = Elasticsearch(hosts=["http://elasticsearch:9200"])

# Настройка логирования
if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler('logs/marketplace.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('Marketplace startup')

@app.route('/api/products', methods=['GET'])
def get_products():
    products = get_all_products()
    return jsonify(products)

@app.route('/api/products/search', methods=['GET'])
def search_products():
    query = request.args.get('query', '')
    products = []

    if query:
        cache_key = f"search:{query}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            products = eval(cached_result.decode('utf-8'))
        else:
            try:
                body = {
                    "query": {
                        "multi_match": {
                            "query": query,
                            "fields": ["name^2", "description"],
                            "fuzziness": "AUTO"
                        }
                    }
                }
                response = es.search(index="products", body=body)
                hits = response['hits']['hits']
                products = [hit['_source'] for hit in hits]

                if not products:
                    products = search_in_db(query)
            except Exception:
                products = search_in_db(query)
            
            redis_client.set(cache_key, str(products), ex=86400)
    else:
        products = get_all_products()

    return jsonify(products)

@app.route('/api/products', methods=['POST'])
def add_product():
    try:
        data = request.get_json()
        new_product = Product(
            name=data['name'],
            description=data['description'],
            price=float(data['price']),
            category=data['category'],
            image_url=data['image_url']
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Product added successfully', 'id': new_product.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def search_in_db(query):
    like_query = f"%{query}%"
    product_query = Product.query.filter(
        (Product.name.ilike(like_query)) | (Product.description.ilike(like_query))
    ).all()
    return [format_product(product) for product in product_query]

def get_all_products():
    product_query = Product.query.limit(50).all()
    return [format_product(product) for product in product_query]

def format_product(product):
    return {
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': float(product.price),
        'category': product.category,
        'image_url': product.image_url
    }

with app.app_context():
    db.create_all()
    
