import sqlite3

def create_tables():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Products (
                ProductID INTEGER PRIMARY KEY,
                Name TEXT NOT NULL,
                Price REAL NOT NULL,
                StockQuantity INTEGER NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Orders (
                OrderID INTEGER PRIMARY KEY,
                CustomerID INTEGER NOT NULL,
                OrderDate TEXT NOT NULL,
                TotalAmount REAL NOT NULL,
                ShippingAddress TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS OrderDetails (
                OrderDetailID INTEGER PRIMARY KEY,
                OrderID INTEGER NOT NULL,
                ProductID INTEGER NOT NULL,
                Quantity INTEGER NOT NULL,
                Price REAL NOT NULL,
                FOREIGN KEY (OrderID) REFERENCES Orders (OrderID),
                FOREIGN KEY (ProductID) REFERENCES Products (ProductID)
            )
        ''')
        conn.commit()
        print("Tables created successfully.")
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    create_tables()
