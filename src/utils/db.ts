/**
 * utools.db 数据库操作封装
 */

// 数据库 key 常量
export const DB_KEYS = {
  CLASS_INFO: "class_info",
  STUDENT_LIST: "student_list",
  SEAT_DATA: "seat_data",
};

/**
 * 保存数据到 utools.db
 */
export function dbPut<T>(key: string, data: T): boolean {
  if (!window.utools) {
    console.warn("utools 环境不可用，使用 localStorage 作为降级方案");
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }

  try {
    // 先尝试获取现有数据（用于更新）
    const existing = window.utools.db.get(key);

    const doc = {
      _id: key,
      data: data,
      ...(existing?._rev ? { _rev: existing._rev } : {}),
    };

    const result = window.utools.db.put(doc);
    return !!result;
  } catch (error) {
    console.error(`保存数据失败 [${key}]:`, error);
    return false;
  }
}

/**
 * 从 utools.db 获取数据
 */
export function dbGet<T>(key: string): T | null {
  if (!window.utools) {
    console.warn("utools 环境不可用，使用 localStorage 作为降级方案");
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  try {
    const doc = window.utools.db.get(key);
    return doc?.data ?? null;
  } catch (error) {
    console.error(`获取数据失败 [${key}]:`, error);
    return null;
  }
}

/**
 * 从 utools.db 删除数据
 */
export function dbRemove(key: string): boolean {
  if (!window.utools) {
    console.warn("utools 环境不可用，使用 localStorage 作为降级方案");
    localStorage.removeItem(key);
    return true;
  }

  try {
    const doc = window.utools.db.get(key);
    if (doc) {
      const result = window.utools.db.remove(doc._id);
      return !!result;
    }
    return true;
  } catch (error) {
    console.error(`删除数据失败 [${key}]:`, error);
    return false;
  }
}
