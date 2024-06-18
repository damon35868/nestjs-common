import { Cluster, Redis, RedisOptions } from "ioredis";
import { Logger } from "@nestjs/common";

type RedisClient = Redis | Cluster;
type OnMessage<T> = (message: T) => void;
type DeserializerContext = { channel: string; pattern?: string };

export type Path = Array<string | number>;
export type Trigger = string | Path;
export type TriggerTransform = (trigger: Trigger, channelOptions?: unknown) => string;
export type Reviver = (key: any, value: any) => any;
export type Serializer = (source: any) => string;
export type Deserializer = (source: string | Buffer, context: DeserializerContext) => any;

export interface PubSubRedisOptions {
  connection?: RedisOptions | string;
  triggerTransform?: TriggerTransform;
  connectionListener?: (err: Error) => void;
  publisher?: RedisClient;
  subscriber?: RedisClient;
  reviver?: Reviver;
  serializer?: Serializer;
  deserializer?: Deserializer;
  messageEventName?: string;
  pmessageEventName?: string;
}

export class RedisPubSub {
  private readonly serializer?: Serializer;
  private readonly deserializer?: Deserializer;
  private readonly triggerTransform: TriggerTransform;
  private readonly redisSubscriber: RedisClient;
  private readonly redisPublisher: RedisClient;
  private readonly reviver: Reviver;

  private readonly logger = new Logger(RedisPubSub.name);

  private readonly subscriptionMap: {
    [subId: number]: [string, OnMessage<any>];
  };
  private readonly subsRefsMap: Map<string, Set<number>>;
  // private currentSubscriptionId: number

  constructor(options: PubSubRedisOptions = {}) {
    const {
      triggerTransform,
      connection,
      connectionListener,
      subscriber,
      publisher,
      reviver,
      serializer,
      deserializer,
      messageEventName = "message",
      pmessageEventName = "pmessage"
    } = options;

    this.triggerTransform = triggerTransform || (trigger => trigger as string);

    if (reviver && deserializer) {
      this.logger.error("[--PubSub--] reviver和deserializer不可以同时使用");
    }

    this.reviver = reviver;
    this.serializer = serializer;
    this.deserializer = deserializer;

    if (subscriber && publisher) {
      this.redisPublisher = publisher;
      this.redisSubscriber = subscriber;
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const IORedis = require("ioredis");
        this.redisPublisher = new IORedis(connection);
        this.redisSubscriber = new IORedis(connection);
      } catch (error) {
        this.logger.error(`[--PubSub--] 没有配置publisher和subscriber`);
      }
    }

    if (connectionListener) {
      this.redisPublisher.on("connect", connectionListener).on("error", connectionListener);
      this.redisSubscriber.on("connect", connectionListener).on("error", connectionListener);
    } else {
      this.redisPublisher.on("error", console.error);
      this.redisSubscriber.on("error", console.error);
    }

    this.redisSubscriber.on(pmessageEventName, this.onMessage.bind(this));
    this.redisSubscriber.on(messageEventName, this.onMessage.bind(this, undefined));

    this.subscriptionMap = {};
    this.subsRefsMap = new Map<string, Set<number>>();
    // this.currentSubscriptionId = 0
  }

  public async publish<T>(channel: string, payload: T): Promise<void> {
    await this.redisPublisher.publish(channel, this.serializer ? this.serializer(payload) : JSON.stringify(payload));
  }

  public subscribe<T = any>(userId: number, channelName: string, onMessage: OnMessage<T>, options: any = {}): Promise<boolean> {
    // const id = this.currentSubscriptionId++
    const channel: string = this.triggerTransform(channelName, options);
    this.subscriptionMap[userId] = [channel, onMessage];

    this.logger.log({ subscribeChannel: channel }, `[--PubSub--] 客户端 ${userId} 订阅`);
    if (!this.subsRefsMap.has(channel)) {
      this.subsRefsMap.set(channel, new Set());
    }

    const refs: any = this.subsRefsMap.get(channel);
    if (refs.has(userId)) return Promise.resolve(true);

    if (refs.size > 0) {
      refs.add(userId);
      return Promise.resolve(false);
    } else {
      return new Promise<boolean>((resolve, reject) => {
        const subscribeFn = options["pattern"] ? this.redisSubscriber.psubscribe : this.redisSubscriber.subscribe;

        subscribeFn.call(this.redisSubscriber, channel, (err: any) => {
          if (err) {
            reject(err);
          } else {
            refs.add(userId);
            resolve(false);
          }
        });
      });
    }
  }

  public unSubscribeAll(channel: string) {
    const refs = this.subsRefsMap.get(channel);
    if (!refs) return this.logger.error("[--PubSub--] channel不存在");

    refs.forEach((id: number) => this.unSubscribe(id));
    this.logger.log({ unSubscribeChannelAll: channel }, `[--PubSub--] channel: ${channel} 取消全部订阅`);
  }

  public unSubscribe(subId: number): void {
    const [channel = null]: any = this.subscriptionMap[subId] || [];
    const refs = this.subsRefsMap.get(channel);

    if (!refs) return;

    if (refs.size <= 1) {
      this.redisSubscriber.unsubscribe(channel);
      this.redisSubscriber.punsubscribe(channel);

      this.subsRefsMap.delete(channel);
      this.logger.log({ emptyChannel: channel }, `[--PubSub--] channel: ${channel} 通道已销毁`);
    } else refs.delete(subId);

    delete this.subscriptionMap[subId];
    this.logger.log(`[--PubSub--] 客户端 ${subId} 取消订阅`);
  }

  public getSubscriber(): RedisClient {
    return this.redisSubscriber;
  }

  public getPublisher(): RedisClient {
    return this.redisPublisher;
  }

  public close(): Promise<"OK"[]> {
    return Promise.all([this.redisPublisher.quit(), this.redisSubscriber.quit()]);
  }

  private onMessage(pattern: string, channel: string, message: string) {
    const subscribers = this.subsRefsMap.get(pattern || channel);

    if (!subscribers?.size) return;

    let parsedMessage: any;
    try {
      parsedMessage = this.deserializer ? this.deserializer(message, { pattern, channel }) : JSON.parse(message, this.reviver);
    } catch (e) {
      parsedMessage = message;
    }

    subscribers.forEach(subId => {
      if (!subId) return;
      const [, listener] = this.subscriptionMap[subId] || ["", val => val];
      listener(parsedMessage);
    });
  }
}
