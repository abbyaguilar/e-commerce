from flask import Flask, jsonify, request, render_template
import sqlite3
import stripe
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM Products').fetchall()
    conn.close()
    return jsonify([dict(row) for row in products])

@app.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM Products WHERE ProductID = ?', (id,)).fetchone()
    conn.close()
    if product is None:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(dict(product))

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.json
        product_id = data['product_id']
        quantity = data['quantity']

        conn = get_db_connection()
        product = conn.execute('SELECT * FROM Products WHERE ProductID = ?', (product_id,)).fetchone()
        conn.close()

        if product is None or product['StockQuantity'] < quantity:
            return jsonify({'error': 'Product not available or insufficient stock'}), 400

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': product['Name'],
                    },
                    'unit_amount': int(product['Price'] * 100),
                },
                'quantity': quantity,
            }],
            mode='payment',
            success_url='http://localhost:5000/success',
            cancel_url='http://localhost:5000/cancel',
        )

        return jsonify({'id': checkout_session.id})
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/success')
def success():
    return render_template('success.html')

@app.route('/cancel')
def cancel():
    return render_template('cancel.html')

@app.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError as e:
        return 'Invalid signature', 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_payment(session)

    return '', 200

def handle_payment(session):
    product_name = session['display_items'][0]['custom']['name']
    quantity = session['display_items'][0]['quantity']

    conn = get_db_connection()
    product = conn.execute('SELECT * FROM Products WHERE Name = ?', (product_name,)).fetchone()

    new_stock_quantity = product['StockQuantity'] - quantity
    conn.execute('UPDATE Products SET StockQuantity = ? WHERE ProductID = ?', (new_stock_quantity, product['ProductID']))

    conn.execute('INSERT INTO Orders (CustomerID, OrderDate, TotalAmount, ShippingAddress) VALUES (?, ?, ?, ?)',
                 (1, '2024-08-17', session['amount_total'] / 100, '123 Elm Street')) 
    order_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
    conn.execute('INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?)',
                 (order_id, product['ProductID'], quantity, product['Price']))

    conn.commit()
    conn.close()

if __name__ == '__main__':
    app.run(debug=True)
