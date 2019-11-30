const Sqlite3Storage = require('./sqlite3');

class Storage {
  storage = null;

  constructor(storage) {
    this.storage = new storage();
    this.storage.init();
  }

  async set(key, value) {
    await this.storage.set(key, value);
  }

  async get(key) {
    return this.storage.get(key);
  }
}

module.exports = new Storage(Sqlite3Storage);
