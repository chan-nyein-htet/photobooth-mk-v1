import sqlite3

class Database:
    def __init__(self, db_path='photobooth.db'):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        """Database connection ကို row_factory နဲ့အတူ ပြန်ပေးသည်"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Tables များအားလုံးကို Conflict မဖြစ်အောင် စနစ်တကျ ဆောက်သည်"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # ✅ Conflict Fix: photos table ရဲ့ name column ကို default value ပေးလိုက်သည်
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS photos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT DEFAULT 'Untitled',
                    photo_path TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS stickers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    url TEXT,
                    is_active INTEGER DEFAULT 1
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS effects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    filter_css TEXT,
                    is_active INTEGER DEFAULT 1
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_id TEXT UNIQUE,
                    amount REAL,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()

    def query(self, sql, params=(), one=False):
        """Query လုပ်ခြင်းကို တစ်ကြောင်းတည်းဖြင့် အလုပ်လုပ်နိုင်ရန် shortcut လုပ်ပေးသည်"""
        with self.get_connection() as conn:
            cursor = conn.execute(sql, params)
            rv = cursor.fetchall()
            conn.commit()
            return (rv[0] if rv else None) if one else rv
