import sqlite3

def check_table():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    try:
        cursor.execute('PRAGMA table_info(Products)')
        columns = cursor.fetchall()
        if columns:
            print("Table 'Products' exists with columns:")
            for column in columns:
                print(column)
        else:
            print("Table 'Products' does not exist.")
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    check_table()
