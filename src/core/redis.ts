const redis = require("redis");
const { promisify } = require("util");
const { redis: redisConfig } = require("config.json");

const noop = () => {};

const clientConfig = {
  ...redisConfig,
  retry_strategy(options: any) {
    // retry 10 times
    if (options.total_retry_time >= 2000) {
      return new Error("Retry time exhausted");
    }
    return 200;
  },
};

class RedisClient {
  client: any;
  pub: any;
  sub: any;
  channels: {};
  isRegisted: boolean;
  constructor() {
    this.client = redis.createClient(clientConfig);
    this.client.on("connect", () => console.info("redis client connected."));
    this.client.on("reconnecting", () =>
      console.info("redis client reconnecting.")
    );
    this.client.on("end", () => console.info("redis client is end."));
    this.client.on("error", (err: any) => console.error("redis error:", err));

    // publish/subscribe
    this.pub = redis.createClient(clientConfig);
    this.pub.on("error", (err: any) => console.error("redis-pub error:", err));

    this.sub = redis.createClient(clientConfig);
    this.sub.on("error", (err: any) => console.error("redis-sub error:", err));

    this.channels = {};
    this.isRegisted = false;
  }

  /**
   * Get value by key
   * @param key
   * @returns {Promise.<*>}
   */
  async get(key: string) {
    const data = await promisify(this.client.get).bind(this.client)(key);

    if (data) {
      const buff = Buffer.from(data, "base64");
      return buff.toString("utf8");
    }

    return null;
  }

  /**
   * Get raw value by key
   * @param key
   * @returns {Promise.<*>}
   */
  async getRaw(key: string) {
    return promisify(this.client.get).bind(this.client)(key);
  }

  /**
   * get keys use pattern
   * @param pattern
   * @returns {Promise.<void>}
   */
  async keys(pattern: any) {
    return promisify(this.client.keys).bind(this.client)(pattern);
  }

  /**
   * @param key
   * @param value
   * @param expire seconds ('EX' option)
   * @description 本函数适用于长字符串，会对其进行压缩处理，如果是数字或boolean值，请使用setRaw方法
   * @returns {Promise.<*>}
   */
  async set(key: string, value: any, expire: number) {
    const setAsync = promisify(this.client.set).bind(this.client);

    if (!value) {
      return setAsync(key, value);
    }

    const buff = Buffer.from(String(value));
    const base64String = buff.toString("base64");

    if (expire) {
      return setAsync(key, base64String, "EX", expire);
    }

    return setAsync(key, base64String);
  }

  /**
   * @param key
   * @param value
   * @param expire seconds ('EX' option)
   * @returns {Promise.<*>}
   */
  async setRaw(key: string, value: any, expire: number) {
    const setAsync = promisify(this.client.set).bind(this.client);

    if (expire) {
      return setAsync(key, value, "EX", expire);
    }

    return setAsync(key, value);
  }

  /**
   * increment
   * @param key
   * @returns {Promise.<*>}
   */
  async incr(key: any) {
    return promisify(this.client.incr).bind(this.client)(key);
  }

  /**
   * decrement
   * @param key
   * @returns {Promise.<*>}
   */
  async decr(key: any) {
    return promisify(this.client.decr).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
