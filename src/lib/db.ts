import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function openDb() {
  return open({
    filename: './mydb.sqlite',
    driver: sqlite3.Database,
  });
}
