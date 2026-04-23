import sqlite3

class Database:
    def __init__(self, db_path='photobooth.db'):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # ၁။ Photos Table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS photos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT DEFAULT 'Untitled',
                    photo_path TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # ၂။ Stickers Table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS stickers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    url TEXT,
                    is_active INTEGER DEFAULT 1
                )
            ''')

            # ၃။ Effects Table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS effects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    filter_css TEXT,
                    is_active INTEGER DEFAULT 1
                )
            ''')

            # ၄။ Orders Table (Updated with layout_id)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id TEXT UNIQUE,
                    amount REAL,
                    status TEXT DEFAULT 'pending',
                    layout_id TEXT DEFAULT 'A+',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()

    def query(self, sql, params=(), one=False):
        with self.get_connection() as conn:
            cursor = conn.execute(sql, params)
            rv = cursor.fetchall()
            conn.commit()
            return (rv[0] if rv else None) if one else rv

