from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
import redis
from elasticsearch import Elasticsearch

app = Flask(__name__)

# Настройка подключения к PostgreSQL через SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://marketplace_user:marketplace_password@db:5432/marketplace_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Определяем модель Product для таблицы products
class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)

# Инициализация Redis (имя контейнера – redis)
redis_client = redis.Redis(host='redis', port=6379, db=0)

# Инициализация Elasticsearch (имя контейнера – elasticsearch)
es = Elasticsearch(hosts=["http://elasticsearch:9200"])

@app.route('/', methods=['GET', 'POST'])
def index():
    query = request.form.get('search_query', '')  # Поисковый запрос
    products = []

    if query:
        # 1) Проверяем кэш в Redis
        cache_key = f"search:{query}"
        cached_result = redis_client.get(cache_key)
        if cached_result:
            products = eval(cached_result.decode('utf-8'))
        else:
            try:
                # 2) Выполняем поиск в Elasticsearch
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

                # Если Elasticsearch не вернул результаты, используем поиск в базе через SQLAlchemy
                if not products:
                    products = search_in_db(query)
            except Exception:
                # При ошибке в Elasticsearch используем поиск в базе данных
                products = search_in_db(query)
            
            # 3) Сохраняем результат в кэше Redis (срок хранения 86400 секунд = 1 сутки)
            redis_client.set(cache_key, str(products), ex=86400)
    else:
        # Если поисковой строки нет – выводим список товаров
        products = get_all_products()

    return render_template('index.html', products=products, query=query)

def search_in_db(query):
    like_query = f"%{query}%"
    product_query = Product.query.filter(
        (Product.name.ilike(like_query)) | (Product.description.ilike(like_query))
    ).all()
    results = []
    for product in product_query:
        results.append({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': float(product.price)
        })
    return results

def get_all_products():
    product_query = Product.query.limit(50).all()
    results = []
    for product in product_query:
        results.append({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': float(product.price)
        })
    return results

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Создание таблицы, если она ещё не существует
    app.run(host='0.0.0.0', port=5000)
