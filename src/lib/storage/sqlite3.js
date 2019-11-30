
const sqlite3 = require('sqlite3').verbose();
const log = require('lib/debug')('lib:storage:sqlite3');

class Sqlite3Storage {

  init() {
    this.db = new sqlite3.Database('data.db');
    this.db.on('trace', (sql) => {
      log(`sql: ${sql}`);
    });
    this.db.on('profile', (sql, ms) => {
      log(`sql(${ms}): ${sql}`);
    });
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS data (
        key VARCHAR,
        value TEXT
      )`);
    });

  }

  async get(key) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare('SELECT value FROM data where key = ?');
      stmt.get(key, (err, row) => {
        if (err) {
          reject(err);
        } else {
          try {
            resolve(JSON.parse(row.value));
          } catch (err) {
            resolve(row);
          }
        }
      });
    });
  }

  async set(key, value) {
    const row = await this.get(key);
    const serializedValue = JSON.stringify(value);
    if (row) {
      this._update(key, serializedValue);
    } else {
      this._insert(key, serializedValue);
    }
  }

  _insert(key, value) {
    const stmt = this.db.prepare('INSERT INTO data VALUES (?, ?)');
    stmt.run(key, value);
    stmt.finalize();
  }

  _update(key, value) {
    const stmt = this.db.prepare('UPDATE data SET value = ? WHERE key = ?');
    stmt.run(value, key);
    stmt.finalize();
  }
}

module.exports = Sqlite3Storage;
