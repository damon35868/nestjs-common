import { config } from "dotenv";
import { FindOptionsOrder, FindOptionsWhere, Repository } from "typeorm";
import { PageDto } from "./dto/page.dto";
import { PageOutput } from "./output/page.output";
import { createHash } from "crypto";
config({ path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env" });

/**
 * @description: 获取环境变了 env
 * @param {string} key
 * @param {string} defaultVal
 * @return {*}
 */
export const env = (key: string, defaultVal?: string): string => {
  const envValue = process.env[key];

  return defaultVal && !envValue ? defaultVal : envValue;
};

/**
 * @description: 是否具备更多分页
 * @param {number} skip
 * @param {number} take
 * @param {number} total
 * @return {*}
 */
export function hasNextPage(skip: number, take: number, total: number): boolean {
  return skip * take < total;
}

/**
 * @description: 构建分页数据
 * @param {Repository<T>} repository
 * @param {PageDto} pageDto
 * @return {*}
 */
export async function buildPage<T, Tdto extends PageDto>(
  repository: Repository<T>,
  pageDto: Tdto,
  input?: {
    cover?: boolean;
    format?: (val: T[]) => Promise<T[]>;
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
    order?: FindOptionsOrder<T>;
  }
): Promise<PageOutput<T>> {
  const { page: skip, pageSize: take, where: _where = {}, order: _order = {} } = pageDto || ({} as any);

  const cover = (input || {}).cover;
  const inputWhere = (input || {}).where;
  const inputOrder = (input || {}).order;
  const where = cover ? inputWhere : { ..._where, ...inputWhere };
  const order = cover ? inputOrder : { ..._order, ...inputOrder };

  const [list, totalCount] = await repository.findAndCount({
    order,
    where,
    take,
    skip: (skip - 1) * take
  });

  const items = input?.format ? await input?.format(list) : list;
  return { items, totalCount, hasNextPage: hasNextPage(skip, take, totalCount) };
}

export const formatJson = (val: string): { [key: string]: string } => {
  let obj: { [key: string]: string } = {};

  try {
    obj = JSON.parse(val || "{}");
  } catch (e) {
    obj = {};
  }

  return obj;
};

/**
 * md5 sha1 sha256 sha512
 * @param content
 * @param algorithm
 */
export const encrypt = (content: string, algorithm: string) => {
  const hash = createHash(algorithm);
  hash.update(content);
  return hash.digest("hex");
};

export const md5 = (content: string) => encrypt(content, "md5");

export function getDistance(lat1, lng1, lat2, lng2) {
  const radLat1 = (lat1 * Math.PI) / 180.0;
  const radLat2 = (lat2 * Math.PI) / 180.0;
  const a = radLat1 - radLat2;
  const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  return s;
}

export function sleep(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, Number(ms)));
}

/**
 * @description: 生成订单号
 * @return {*}
 */
export function generateOrderNo(prefix: string = ""): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const datestring = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const randomString1 = Math.floor(Math.random() * 1090000000800)
    .toString()
    .slice(0, 4);
  const randomString2 = Math.floor(Math.random() * 1090000000800)
    .toString()
    .slice(0, 4);
  return prefix + datestring + randomString1 + randomString2;
}

export function getKeyByValue<T extends { [index: string]: string | number }>(enumObject: T, value: T[keyof T]): keyof T | null {
  const keys = Object.keys(enumObject).filter(key => enumObject[key] === value);
  return keys.length > 0 ? keys[0] : null;
}

export const toSecond = (val: number): number => (val || 0) * 1000;

export function generateRedisSecret(leng: number = 10) {
  let token = "";
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz23456789";

  for (let i = 0; i < leng; ++i) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return md5(token);
}

/**
 * @description:
 * @param {number} day 多少天前
 * @param {boolean} cover 代表是否是覆盖，覆盖就是从{day}天前到今日，反之就是多少天前当天
 * @return {*}
 */
export function getDayliy(day: number = 0, cover?: boolean) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - day);
  const startDate = new Date(currentDate);
  startDate.setHours(0, 0, 0, 0);
  let endDate = new Date(currentDate);
  cover && (endDate = new Date());
  endDate.setHours(23, 59, 59, 999);

  return [startDate, endDate];
}

export function getMonthly(month: number = 0) {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - month);
  currentDate.setDate(1);
  const startDate = new Date(currentDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(currentDate);
  endDate.setMonth(startDate.getMonth() + 1);
  endDate.setDate(0);
  endDate.setHours(23, 59, 59, 999);

  return [startDate, endDate];
}

export function genPass(len: number = 4): string {
  let text = "";
  for (let i = 0; i < len; i++) {
    const a = Math.floor(Math.random() * 9);
    text += a;
  }
  return text;
}

export const getToken = (val: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const query = require("url").parse(val || "{}", true).query;

  const authorizationParam: string = query.authorization as string;

  if (!authorizationParam) return "";
  return authorizationParam.split("$$")[1];
};

export function getRandomIndex(array: any[]) {
  const arrayLength = array.length;
  if (arrayLength === 0) {
    throw new Error("Array is empty");
  }
  const randomIndex = Math.floor(Math.random() * arrayLength);
  return randomIndex;
}
