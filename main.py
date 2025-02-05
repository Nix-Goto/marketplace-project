from flask import Flask, render_template, request
import psycopg2
import redis
from elasticsearch import Elasticsearch

app = Flask(__name__)

# Инициализация Redis (название контейнера - redis)
redis_client = redis.Redis(host='redis', port=6379, db=0)

# Инициализация PostgreSQL (название контейнера - db)
def get_db_connection():
    return psycopg2.connect(
        host='db',
        port=5432,
        database='marketplace_db',
        user='marketplace_user',
        password='marketplace_password'
    )

# Инициализация Elasticsearch (название контейнера - elasticsearch)
es = Elasticsearch(hosts=["http://elasticsearch:9200"])

@app.route('/', methods=['GET', 'POST'])
def index():
    query = request.form.get('search_query', '')  # Поисковый запрос
    products = []

    if query:
        # 1) Проверяем в кэше
        cache_key = f"search:{query}"
        cached_result = redis_client.get(cache_key)
        if cached_result:
            # Если есть в кэше, декодируем
            products = eval(cached_result.decode('utf-8'))
        else:
            # 2) Делаем поиск в Elastic
            try:
                # Поиск сначала по точному совпадению названия,
                # потом по схожим словам в описании (примерно).
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

                # Если Elasticsearch пустой или не нашёл — fallback на PostgreSQL
                if not products:
                    products = search_in_db(query)
            except Exception:
                # Если Elastic недоступен — fallback PostgreSQL
                products = search_in_db(query)

            # 3) Сохраняем результат в кэше Redis
            redis_client.set(cache_key, str(products), ex=86400)  # срок хранения 1 сутки
    else:
        # Выводим все товары, либо ограниченное количество
        products = get_all_products()

    return render_template('index.html', products=products, query=query)

def search_in_db(query):
    con = get_db_connection()
    cur = con.cursor()
    like_query = f"%{query}%"
    sql = """
        SELECT id, name, description, price 
        FROM products 
        WHERE name ILIKE %s OR description ILIKE %s
    """
    cur.execute(sql, (like_query, like_query))
    rows = cur.fetchall()
    cur.close()
    con.close()

    results = []
    for row in rows:
        results.append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'price': row[3]
        })
    return results

def get_all_products():
    con = get_db_connection()
    cur = con.cursor()
    sql = "SELECT id, name, description, price FROM products LIMIT 50"  # условно 50 товаров
    cur.execute(sql)
    rows = cur.fetchall()
    cur.close()
    con.close()

    results = []
    for row in rows:
        results.append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'price': row[3]
        })
    return results

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
