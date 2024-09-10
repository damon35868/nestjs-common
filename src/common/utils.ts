import { createCipheriv, createHash } from "crypto";
import { config } from "dotenv";
config({ path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env" });

/**
 * @description: 获取环境变量 env
 * @param {string} key
 * @param {string} defaultVal
 * @return {*}
 */
export const env = (key: string, defaultVal?: string): string => {
  const envValue = process.env[key];

  return defaultVal && !envValue ? defaultVal : envValue;
};

/**
 * @description: 解构字符串json，容错处理
 * @param {string} val
 * @return {*}
 */
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
export const encrypt = (content: string, algorithm: string): string => {
  const hash = createHash(algorithm);
  hash.update(content);
  return hash.digest("hex");
};

/**
 * @description: 加密
 * @param {string} content
 * @return {*}
 */
export const md5 = (content: string): string => encrypt(content, "md5");

/*
 * @description: 对象组合排序
 * @param {object} options
 * @return {*}
 */
export function kSort(options: { [key: string]: any }) {
  const sorted = {};
  const keys = Object.keys(options).sort();
  keys.forEach(key => (sorted[key] = options[key]));
  return sorted;
}

/**
 * @description: sha1签名
 * @param {string} content
 * @return {*}
 */
export const sha1 = (content: string) => encrypt("sha1", content);

/**
 * @description: sha256签名
 * @param {string} content
 * @return {*}
 */
export const sha256 = (content: string) => encrypt("sha256", content);

/**
 * @description: aes签名
 * @param {any} data
 * @param {string} key
 * @param {string} iv
 * @return {*}
 */
export const aesEncrypt = (data: any, key: string, iv: string) => {
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(key), Buffer.from(iv));
  let crypted = cipher.update(data, "utf8", "base64");
  crypted += cipher.final("base64");
  return crypted;
};

/**
 * @description: 获取2个坐标之间的距离
 * @param {*} lat1
 * @param {*} lng1
 * @param {*} lat2
 * @param {*} lng2
 * @return {*}
 */
export function getDistance(lat1, lng1, lat2, lng2): number {
  const radLat1 = (lat1 * Math.PI) / 180.0;
  const radLat2 = (lat2 * Math.PI) / 180.0;
  const a = radLat1 - radLat2;
  const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  return s;
}

/**
 * @description: 等待
 * @param {number} ms
 * @return {*}
 */
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

/**
 * @description: 通过值取key
 * @param {T} enumObject
 * @param {T} value
 * @return {*}
 */
export function getKeyByValue<T extends { [index: string]: string | number }>(enumObject: T, value: T[keyof T]): keyof T | null {
  const keys = Object.keys(enumObject).filter(key => enumObject[key] === value);
  return keys.length > 0 ? keys[0] : null;
}

/**
 * @description: 转秒数
 * @param {number} val
 * @return {*}
 */
export const toSecond = (val: number): number => (val || 0) * 1000;

/**
 * @description: 生成随机密钥
 * @param {number} leng
 * @return {*}
 */
export function generateSecret(leng: number = 10, encryption: boolean = true) {
  let token = "";
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz23456789";

  for (let i = 0; i < leng; ++i) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return encryption ? md5(token) : token;
}

/**
 * @description:
 * @param {number} day 多少天前
 * @param {boolean} cover 代表是否是覆盖，覆盖就是从{day}天前到今日，反之就是多少天前当天
 * @return {*}
 */
export function getDayliy(day: number = 0, cover?: boolean): [Date, Date] {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - day);
  const startDate = new Date(currentDate);
  startDate.setHours(0, 0, 0, 0);
  let endDate = new Date(currentDate);
  cover && (endDate = new Date());
  endDate.setHours(23, 59, 59, 999);

  return [startDate, endDate];
}

/**
 * @description:
 * @param {number} month 多少月前
 * @return {*}
 */
export function getMonthly(month: number = 0): [Date, Date] {
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

/**
 * @description: 生成随机密码
 * @param {number} len
 * @return {*}
 */
export function genPass(len: number = 4): string {
  let text = "";
  for (let i = 0; i < len; i++) {
    const a = Math.floor(Math.random() * 9);
    text += a;
  }
  return text;
}

/**
 * @description: 通过头部URL获取token
 * @param {string} val
 * @return {*}
 */
export const getToken = (val: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const query = require("url").parse(val || "{}", true).query;

  const authorizationParam: string = query.authorization as string;

  if (!authorizationParam) return "";
  return authorizationParam.split("$$")[1];
};

/**
 * @description: 生成数组的随机下标
 * @param {any} array
 * @return {*}
 */
export function getRandomIndex(array: any[]): number {
  const arrayLength = array.length;
  if (arrayLength === 0) {
    throw new Error("Array is empty");
  }
  const randomIndex = Math.floor(Math.random() * arrayLength);
  return randomIndex;
}

/**
 * 格式化日期
 * @param date
 * @param fmt
 * @returns
 */
export function formatDate(date: Date = new Date(), fmt: string = "yyyy-MM-dd hh:mm:ss"): string {
  const o: any = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "h+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return fmt;
}

/**
 * @description: 生成随机ID 默认9位
 * @return {*}
 */
const randomNumRes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export function genRandomNo(length: number = 9, arr: number[] = randomNumRes): string {
  const result = [];
  const availableNumbers = [...arr];

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * availableNumbers.length);
    result.push(availableNumbers[index]);
    availableNumbers.splice(index, 1);

    if (availableNumbers.length === 0) {
      availableNumbers.push(...arr);
    }
  }

  return result.join("");
}
