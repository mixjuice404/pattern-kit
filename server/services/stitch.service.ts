// 文件内的函数：createOrUpdateCrochetPattern
import { BasicError } from '../utils/errors';
import prisma from '../utils/prisma';
// 注意：现在可以不再直接导入 createError，除非在 BasicError 无法覆盖的场景下仍需使用

/**
 * =======================================================
 * 1. 创建或更新钩织针法
 * 2. 获取钩织针法详情(默认1个) - 待定
 * 3. 删除钩织针法
 * 4. 查询钩织针法List（条件查询）
 * 5. 批量导入针法（JSON）
 * =======================================================
 */

// 创建或更新钩织针法
export async function createOrUpdateStitch(id: number | null, data: {
  defaultName: string;
  description?: string | null;
  type: string;
  level: string;
}) {
  try {
    const stitchData = {
      defaultName: data.defaultName,
      description: data.description ?? undefined,
      type: data.type,
      level: data.level,
    };

    if (id === null) {
      const created = await prisma.stitch.create({ data: stitchData });
      return created.id;
    }

    const result = await prisma.stitch.upsert({
      where: { id },
      update: stitchData,
      create: stitchData,
    });
    return result.id;
  } catch (error) {
    console.error('创建/更新 Stitch 失败:', error);
    if (id === null) {
      throw new BasicError('RESOURCE_CREATION_FAILED', { statusCode: 500 });
    }
    throw new BasicError('RESOURCE_UPDATE_FAILED', { statusCode: 500 });
  }
}



/**
 * 查询钩织针法List（条件查询）
 * @param query 查询参数对象(包含 defaultName（可选，支持模糊查询）, type（可选）)
 * @returns 针法详情对象(包含 id, defaultName, description, type, level, localizations(语言代码, 名称, 描述, flag), createdAt, updatedAt)
 */
export async function getStitchList(query: {
  defaultName?: string | null;
  type?: string | null;
}) {
  try {
    const languages = await prisma.stitchLanguage.findMany({
      where: { deleted: 0 },
      select: { code: true, flag: true },
    });

    const stitches = await prisma.stitch.findMany({
      where: {
        deleted: 0,
        ...(query.defaultName?.trim()
          ? { defaultName: { contains: query.defaultName.trim(), mode: 'insensitive' } }
          : {}),
        ...(query.type?.trim() ? { type: query.type.trim() } : {}),
      },
      include: {
        localizations: {
          where: { deleted: 0 },
          select: { languageCode: true, name: true, description: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return stitches.map((s) => {
      const locMap = new Map(s.localizations.map((l) => [l.languageCode, l]));
      const localizations = languages.map((lang) => {
        const l = locMap.get(lang.code);
        return {
          languageCode: lang.code,
          flag: lang.flag,
          name: l?.name ?? null,
          description: l?.description ?? null,
        };
      });

      return {
        id: s.id,
        defaultName: s.defaultName,
        description: s.description ?? null,
        type: s.type,
        level: s.level,
        localizations,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      };
    });
  } catch (error) {
    console.error('查询 Stitch 列表失败:', error);
    throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Stitch 列表不存在或查询失败' });
  }
}


/**
 * 批量导入针法（JSON）
 * @param jsonData 包含多条针法数据的 JSON 数组
 * @returns 导入成功的针法数量
 * 
 * 导入逻辑：
 * 1. 遍历 JSON 数组中的每个对象
 * 2. 调用 createOrUpdateStitch 函数创建或更新每条针法
 * 3. 统计成功导入的条数
 * 4. 返回成功导入的条数
 * 5. json 中至少要有一个 localization 对象 并且 languageCode 字段必须是已存在的语言代码
 * 6. 每个 localization 对象必须包含 languageCode, name，description 字段
 * 7. 如果存在 stitchLanguage 中没有的 languageCode 则报错 并 中断导入，并返回失败信息（信息中需要提及具体的 languageCode）
 */
export async function importStitches(jsonData: any[]) {
  try {
    const languages = await prisma.stitchLanguage.findMany({
      where: { deleted: 0 },
      select: { code: true },
    });
    const validCodes = new Set(languages.map(l => l.code));

    let count = 0;
    for (const item of jsonData ?? []) {
      const locs: Array<{ languageCode: string; name: string; description: string; abbrev?: string }> =
        Array.isArray(item?.localizations) ? item.localizations : [];
      if (!locs.length) {
        throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: '缺少 localizations（至少 1 个）' });
      }
      if (locs.some(l => !l?.languageCode || !l?.name || !l?.description)) {
        throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'localization 字段不完整（需 languageCode/name/description）' });
      }
      const invalid = locs.map(l => l.languageCode).filter(code => !validCodes.has(code));
      if (invalid.length) {
        throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `无效 languageCode: ${invalid.join(', ')}` });
      }

      const stitchId = await createOrUpdateStitch(item.id ?? null, {
        defaultName: item.defaultName,
        description: item.description,
        type: item.type,
        level: item.level,
      });

      await prisma.$transaction(
        locs.map(l =>
          prisma.stitchLocalization.upsert({
            where: { stitchId_languageCode: { stitchId, languageCode: l.languageCode } },
            update: { name: l.name, description: l.description, abbrev: l.abbrev ?? undefined },
            create: { stitchId, languageCode: l.languageCode, name: l.name, description: l.description, abbrev: l.abbrev ?? undefined },
          })
        )
      );

      count++;
    }
    return count;
  } catch (error) {
    console.error('批量导入 Stitch 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '批量导入失败' });
  }
}


/**
 * 添加一个 language支持
 * @param languageCode 语言代码
 * @param flag 语言标志
 * @returns 新增的 StitchLanguage 对象
 */
export async function addStitchLanguage(languageCode: string, flag: string, name: string) {
  try {
    const code = languageCode?.trim();
    const f = flag?.trim();
    const n = name?.trim();
    if (!code || !f || !n) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'code、flag、name 为必填' });
    }

    const exists = await prisma.stitchLanguage.findUnique({ where: { code } });
    if (exists) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `语言已存在：${code}` });
    }

    return await prisma.stitchLanguage.create({ data: { code, name: n, flag: f } });
  } catch (error) {
    console.error('添加 StitchLanguage 失败:', error);
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '添加 StitchLanguage 失败' });
  }
}


/**
 * 删除 一个 language支持
 * @param languageCode 语言代码
 * @returns 删除的 StitchLanguage 对象
 */
export async function deleteStitchLanguage(languageCode: string) {
  try {
    const code = languageCode?.trim();
    if (!code) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'languageCode 为必填' });
    }

    const exists = await prisma.stitchLanguage.findUnique({ where: { code } });
    if (!exists) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `语言不存在：${code}` });
    }

    return await prisma.stitchLanguage.update({
      where: { code },
      data: { deleted: 1 },
    });
  } catch (error) {
    console.error('删除 StitchLanguage 失败:', error);
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '删除 StitchLanguage 失败' });
  }
}


/** 查询所有 StitchLanguage */
export async function queryStitchLanguages() {
  try {
    return await prisma.stitchLanguage.findMany({
      where: { deleted: 0 },
      select: { code: true, name: true, flag: true },
    });
  } catch (error) {
    console.error('查询 StitchLanguage 失败:', error);
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '查询 StitchLanguage 失败' });
  }
}
