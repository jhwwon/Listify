from db import connect_to_mysql
import os

def get_conn():
    return connect_to_mysql(
        os.getenv("DB_HOST"),
        int(os.getenv("DB_PORT")),
        os.getenv("DB_USER"),
        os.getenv("DB_PASSWORD"),
        os.getenv("DB_DATABASE"),
    )

def find_genre_no_by_name(name):
    conn = get_conn()
    try:
        with conn.cursor() as c:
            c.execute("SELECT genre_no FROM genre WHERE name = %s", (name,))
            row = c.fetchone()
            return row["genre_no"] if row else None
    finally:
        conn.close()