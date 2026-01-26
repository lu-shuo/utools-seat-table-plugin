/**
 * 数据迁移工具
 * 从 localStorage 迁移到 utools.db
 */

import { dbPut, DB_KEYS } from "./db";

interface MigrationResult {
  success: boolean;
  migratedKeys: string[];
  errors: string[];
}

/**
 * 执行数据迁移
 */
export function migrateFromLocalStorage(): MigrationResult {
  const result: MigrationResult = {
    success: true,
    migratedKeys: [],
    errors: [],
  };

  // 定义需要迁移的数据映射
  const migrations = [
    {
      oldKey: "classInfo",
      newKey: DB_KEYS.CLASS_INFO,
      name: "班级信息",
    },
    {
      oldKey: "studentList",
      newKey: DB_KEYS.STUDENT_LIST,
      name: "学生列表",
    },
    {
      oldKey: "seatData",
      newKey: DB_KEYS.SEAT_DATA,
      name: "座位数据",
    },
  ];

  migrations.forEach((migration) => {
    try {
      const oldData = localStorage.getItem(migration.oldKey);
      if (oldData) {
        const parsedData = JSON.parse(oldData);
        const success = dbPut(migration.newKey, parsedData);

        if (success) {
          result.migratedKeys.push(migration.name);
          // 迁移成功后删除旧数据
          localStorage.removeItem(migration.oldKey);
        } else {
          result.errors.push(`迁移 ${migration.name} 失败`);
          result.success = false;
        }
      }
    } catch (error) {
      result.errors.push(`迁移 ${migration.name} 时出错: ${error}`);
      result.success = false;
    }
  });

  return result;
}

/**
 * 检查是否需要迁移
 */
export function needsMigration(): boolean {
  const oldKeys = ["classInfo", "studentList", "seatData"];
  return oldKeys.some((key) => localStorage.getItem(key) !== null);
}
