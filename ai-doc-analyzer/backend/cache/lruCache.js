const AICacheEntry = require('../models/AICacheEntry');

class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const node = this.cache.get(key);
    this._moveToHead(node);
    return node.value;
  }

  async set(key, value) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      node.value = value;
      this._moveToHead(node);
    } else {
      const newNode = new Node(key, value);
      this.cache.set(key, newNode);
      this._addNode(newNode);
      if (this.cache.size > this.maxSize) {
        await this._evict();
      }
    }
  }

  _addNode(node) {
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  _moveToHead(node) {
    if (node === this.head) return;
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.tail) this.tail = node.prev;
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
  }

  async _evict() {
    if (!this.tail) return;
    try {
      await AICacheEntry.findOneAndUpdate(
        { key: this.tail.key },
        { value: this.tail.value, createdAt: new Date() },
        { upsert: true }
      );
    } catch (err) {
      console.error('Failed to persist evicted cache entry:', err);
    }
    this.cache.delete(this.tail.key);
    if (this.tail.prev) {
      this.tail = this.tail.prev;
      this.tail.next = null;
    } else {
      this.head = this.tail = null;
    }
  }
}

module.exports = LRUCache;