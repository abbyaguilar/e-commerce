import sqlite3

def populate_products():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO Products (Name, Price, StockQuantity)
            VALUES
            ('Sample Product 1', 19.99, 100),
            ('Sample Product 2', 29.99, 150),
            ('Sample Product 3', 39.99, 200)
        ''')
        conn.commit()
        print("Products inserted successfully.")
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    populate_products()
