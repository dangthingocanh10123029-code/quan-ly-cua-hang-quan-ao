import mysql.connector
from mysql.connector import pooling
from contextlib import contextmanager
from .config import settings

# Connection pool
db_pool = pooling.MySQLConnectionPool(
    pool_name="clothing_pool",
    pool_size=10,
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    user=settings.DB_USER,
    password=settings.DB_PASSWORD,
    database=settings.DB_NAME,
    charset='utf8mb4',
    collation='utf8mb4_unicode_ci',
    autocommit=False
)


def get_db():
    """Get database connection from pool"""
    conn = db_pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def get_db_cursor(dictionary=True):
    """Context manager for database cursor"""
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=dictionary)
    try:
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def execute_query(query: str, params: tuple = None, fetch_one=False, fetch_all=False, return_lastrowid=False):
    """Execute a query and optionally return results"""
    with get_db_cursor() as cursor:
        cursor.execute(query, params or ())
        if return_lastrowid:
            return cursor.lastrowid
        if fetch_one:
            return cursor.fetchone()
        if fetch_all:
            return cursor.fetchall()
        return None


def execute_many(query: str, data: list):
    """Execute multiple queries with data"""
    with get_db_cursor() as cursor:
        cursor.executemany(query, data)
        return cursor.rowcount
