import sqlite3
import os

class Database:
    def __init__(self, db_path='photobooth.db'):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        """Returns a database connection with Row factory for dictionary-like access."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Initializes the database schema if tables do not exist."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Orders Table: Stores payment and session status
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id TEXT UNIQUE,
                    amount REAL,
                    status TEXT DEFAULT 'pending',
                    layout_id TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # 2. Photos Table: Links captured images to specific orders
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS photos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    photo_path TEXT NOT NULL,
                    order_id TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES orders (order_id)
                )
            ''')

            # 3. Stickers Table: Managed assets for the editor
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS stickers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    url TEXT,
                    is_active INTEGER DEFAULT 1
                )
            ''')

            # 4. Effects (Filters) Table: CSS-based photo filters
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS effects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    filter_css TEXT,
                    is_active INTEGER DEFAULT 1
                )
            ''')
            conn.commit()

    def query(self, sql, params=(), one=False):
        """Executes a SQL query and returns fetched results (Select, Insert, Update, Delete)."""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute(sql, params)
                rv = cursor.fetchall()
                conn.commit()
                return (rv[0] if rv else None) if one else rv
        except Exception as e:
            print(f"❌ Database Query Error: {e}")
            return None

