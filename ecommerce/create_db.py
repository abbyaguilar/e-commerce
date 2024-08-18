import sqlite3

conn = sqlite3.connect('database.db')
cur = conn.cursor()

cur.execute('''
    CREATE TABLE IF NOT EXISTS Categories (
        CategoryID INTEGER PRIMARY KEY,
        CategoryName TEXT NOT NULL
    )
''')

cur.execute('''
    CREATE TABLE IF NOT EXISTS Products (
        ProductID INTEGER PRIMARY KEY,
        Name TEXT NOT NULL,
        Description TEXT,
        Price REAL NOT NULL,
        StockQuantity INTEGER NOT NULL,
        CategoryID INTEGER,
        FOREIGN KEY (CategoryID) REFERENCES Categories (CategoryID)
    )
''')

cur.execute('''
    CREATE TABLE IF NOT EXISTS Orders (
        OrderID INTEGER PRIMARY KEY,
        CustomerID INTEGER,
        OrderDate TEXT NOT NULL,
        TotalAmount REAL NOT NULL,
        ShippingAddress TEXT NOT NULL
    )
''')

cur.execute('''
    CREATE TABLE IF NOT EXISTS OrderDetails (
        OrderDetailID INTEGER PRIMARY KEY,
        OrderID INTEGER,
        ProductID INTEGER,
        Quantity INTEGER NOT NULL,
        Price REAL NOT NULL,
        FOREIGN KEY (OrderID) REFERENCES Orders (OrderID),
        FOREIGN KEY (ProductID) REFERENCES Products (ProductID)
    )
''')

cur.execute('INSERT INTO Categories (CategoryName) VALUES ("Electronics")')
cur.execute('INSERT INTO Categories (CategoryName) VALUES ("Books")')

cur.execute('''
    INSERT INTO Products (Name, Description, Price, StockQuantity, CategoryID)
    VALUES
    ("Smartphone", "Latest model", 699.99, 50, 1),
    ("Laptop", "High-performance laptop", 999.99, 30, 1),
    ("Novel", "Bestselling novel", 19.99, 100, 2)
''')

conn.commit()
conn.close()