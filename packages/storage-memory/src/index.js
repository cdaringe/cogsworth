'use strict'

function StorageMemory () {
  this.store = {}
}

/**
 * Get the store, or, get value for id from the store
 * @param {*} value
 * @returns {Promise<*>}
 */
StorageMemory.prototype.create = function (value) {
  return this.update(value)
}

/**
 * Get the store, or, get value for id from the store
 * @param {string} id
 * @returns {Promise<*>}
 */
StorageMemory.prototype.get = function (id) {
  if (id === null || id === undefined) {
    var jobCollection = []
    for (var i in this.store) {
      jobCollection.push(this.store[i])
    }
    return Promise.resolve(jobCollection)
  }
  return Promise.resolve(this.store[id])
}

/**
 * Update item in the store
 * @param {*} value
 * @returns {Promise<*>}
 */
StorageMemory.prototype.update = function (value) {
  if (!value || !value.id) throw new Error('value with value.id required')
  this.store[value.id] = value
  return Promise.resolve(value)
}

/**
 * Clear the store, or, remove k-v pair from store
 * @param {*} [id]
 * @returns {Promise<*>}
 */
StorageMemory.prototype.delete = function (id) {
  if (id === null || id === undefined) {
    this.store = {}
  } else {
    delete this.store[id]
  }
  return Promise.resolve()
}

module.exports = StorageMemory
