class Redis {
    constructor() {
        this.data = {};
    }

    connect() {
        return Promise.resolve();
    }

    on(event, callback) {
        if (event === 'connect') {
            callback(); // Simulate the 'connect' event
        }
    }

    get(key) {
        return Promise.resolve(this.data[key] || null);
    }

    set(key, value) {
        this.data[key] = value;
        return Promise.resolve('OK');
    }

    quit() {
        return Promise.resolve();
    }
}

module.exports = Redis;
