import Redis from "ioredis";
import { RedisPubSub } from "./pubsub";
import { env } from "../utils";

const redisConfig = {
  host: env("REDIS_HOST"),
  port: Number(env("REDIS_PORT")),
  password: env("REDIS_PASSWORD"),
  db: parseInt(env("REDIS_DB"), 10)
};

const publisher = new Redis(redisConfig);
const subscriber = new Redis(redisConfig);

export const pubSub = new RedisPubSub({ publisher, subscriber });
