import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class CacheHelper {
  constructor(@Inject(CACHE_MANAGER) private cacheManger: Cache) {}

  async remember<T>(key: string, fn: () => Promise<T>, ttl: number = 1800000): Promise<T> {
    const cache: T = await this.cacheManger.get(key);
    if (cache) return cache;

    const value: T = await fn();
    this.cacheManger.set(key, value, ttl);
    return value;
  }

  async forget(key): Promise<boolean> {
    try {
      await this.cacheManger.del(key);
      return true;
    } catch {
      return false;
    }
  }

  set(key: string, value: any): Promise<any> {
    return this.cacheManger.set(key, value);
  }

  get<T>(key: string): Promise<T> {
    return this.cacheManger.get(key);
  }

  reset(): Promise<any> {
    return this.cacheManger.clear();
  }
}
