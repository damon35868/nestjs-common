import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { TtlFunction } from "cache-manager";

@Injectable()
export class CacheHelper {
  constructor(@Inject(CACHE_MANAGER) private cacheManger: Cache) {}

  async remember(key: string, fn: () => Promise<any>, ttl: number | TtlFunction = 3600) {
    const cache = await this.cacheManger.get(key);
    if (cache) return cache;

    const value = await fn();
    this.cacheManger.set(key, value, { ttl });
    return value;
  }
}
