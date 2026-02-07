// 文件内的函数：createOrUpdateCrochetPattern
import { BasicError } from '../utils/errors';
import prisma from '../utils/prisma';
// 注意：现在可以不再直接导入 createError，除非在 BasicError 无法覆盖的场景下仍需使用

/**
 * =======================================================
 * 1. 创建或更新钩织针法
 * 2. 获取钩织针法详情
 * 3. 删除钩织针法
 * 4. 查询钩织针法List（条件查询）
 * 5. 批量导入针法（JSON）
 * =======================================================
 */

// 创建或更新钩织针法
export async function createOrUpdateStitch(
  id: number | null,
  data: {
    defaultName: string;
    description?: string | null;
    type: string;
    level: string;
    localizations?: Array<{
      languageCode: string;
      name?: string | null;
      abbrev?: string | null;
      description?: string | null;
    }>;
  }
) {
  try {
    const stitchData = {
      defaultName: data.defaultName,
      description: data.description ?? undefined,
      type: data.type,
      level: data.level,
    };

    const rawLocs = Array.isArray(data.localizations) ? data.localizations : [];
    const normalizedLocs = rawLocs
      .map((l) => ({
        languageCode: String(l?.languageCode ?? '').trim().toUpperCase(),
        name: String(l?.name ?? '').trim(),
        abbrev: String(l?.abbrev ?? '').trim(),
        description: String(l?.description ?? '').trim(),
      }))
      .filter((l) => l.languageCode);

    if (normalizedLocs.some((l) => (l.name || l.abbrev || l.description) && (!l.name || !l.description))) {
      throw new BasicError('BUSINESS_EXCEPTION', {
        statusCode: 400,
        message: 'localizations 中存在不完整项（需要 languageCode/name/description）',
      });
    }

    const locByCode = new Map<string, typeof normalizedLocs[number]>();
    for (const l of normalizedLocs) locByCode.set(l.languageCode, l);
    const locs = Array.from(locByCode.values()).filter((l) => l.name && l.description);

    return await prisma.$transaction(async (tx) => {
      const stitch = id === null
        ? await tx.stitch.create({ data: stitchData })
        : await tx.stitch.upsert({ where: { id }, update: stitchData, create: stitchData });

      if (!locs.length) return stitch.id;

      const languages = await tx.stitchLanguage.findMany({
        where: { deleted: 0 },
        select: { code: true },
      });
      const validCodes = new Set(languages.map((x) => String(x.code).toUpperCase()));

      const invalid = locs.map((l) => l.languageCode).filter((code) => !validCodes.has(code));
      if (invalid.length) {
        throw new BasicError('BUSINESS_EXCEPTION', {
          statusCode: 400,
          message: `无效 languageCode: ${Array.from(new Set(invalid)).join(', ')}`,
        });
      }

      await Promise.all(
        locs.map((l) =>
          tx.stitchLocalization.upsert({
            where: { stitchId_languageCode: { stitchId: stitch.id, languageCode: l.languageCode } },
            update: {
              name: l.name,
              description: l.description,
              abbrev: l.abbrev || undefined,
              deleted: 0,
            },
            create: {
              stitchId: stitch.id,
              languageCode: l.languageCode,
              name: l.name,
              description: l.description,
              abbrev: l.abbrev || undefined,
            },
          })
        )
      );

      return stitch.id;
    });
  } catch (error) {
    console.error('创建/更新 Stitch 失败:', error);
    if (error instanceof BasicError) throw error;
    if (id === null) {
      throw new BasicError('RESOURCE_CREATION_FAILED', { statusCode: 500 });
    }
    throw new BasicError('RESOURCE_UPDATE_FAILED', { statusCode: 500 });
  }
}


/** 查询钩织针法详情
 * @param id 钩织针法ID
 * @returns 针法详情对象(包含 id, defaultName, description, type, level, localizations(语言代码, 名称, 描述, flag), createdAt, updatedAt)
 */
export async function getStitchDetail(id: number) {
  try {
    const [languages, stitch] = await prisma.$transaction([
      prisma.stitchLanguage.findMany({
        where: { deleted: 0 },
        select: { code: true, flag: true },
      }),
      prisma.stitch.findFirst({
        where: { id, deleted: 0 },
        select: {
          id: true,
          defaultName: true,
          description: true,
          type: true,
          level: true,
          created_at: true,
          updated_at: true,
          localizations: {
            where: { deleted: 0 },
            select: {
              languageCode: true,
              name: true,
              description: true,
              abbrev: true,
            },
          },
        },
      }),
    ]);

    if (!stitch) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404 });
    }

    const locByCode = new Map(
      stitch.localizations.map((l) => [String(l.languageCode).toUpperCase(), l])
    );

    return {
      id: stitch.id,
      defaultName: stitch.defaultName,
      description: stitch.description,
      type: stitch.type,
      level: stitch.level,
      createdAt: stitch.created_at,
      updatedAt: stitch.updated_at,
      localizations: languages.map((lang) => {
        const l = locByCode.get(String(lang.code).toUpperCase());
        return {
          languageCode: lang.code,
          flag: lang.flag,
          name: l?.name ?? null,
          abbrev: l?.abbrev ?? null,
          description: l?.description ?? null,
        };
      }),
    };
  } catch (error) {
    console.error('查询 Stitch 详情失败:', error);
    throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404 });
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
  page?: number;
  pageSize?: number;
}) {
  try {
    const languages = await prisma.stitchLanguage.findMany({
      where: { deleted: 0 },
      select: { code: true, flag: true },
    });

    const where = {
      deleted: 0,
      ...(query.defaultName?.trim()
        ? { defaultName: { contains: query.defaultName.trim(), mode: 'insensitive' as const } }
        : {}),
      ...(query.type?.trim() ? { type: query.type.trim() } : {}),
    };

    const paginate = query.page != null || query.pageSize != null;
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));

    const [total, stitches] = paginate
      ? await prisma.$transaction([
          prisma.stitch.count({ where }),
          prisma.stitch.findMany({
            where,
            include: {
              localizations: {
                where: { deleted: 0 },
                select: { languageCode: true, name: true, description: true, abbrev: true },
              },
            },
            orderBy: { created_at: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
        ])
      : [
          undefined,
          await prisma.stitch.findMany({
            where,
            include: {
              localizations: {
                where: { deleted: 0 },
                select: { languageCode: true, name: true, description: true, abbrev: true },
              },
            },
            orderBy: { created_at: 'desc' },
          }),
        ];

    const list = stitches.map((s) => {
      const usDescription =
        s.localizations.find((l) => (l.languageCode ?? '').toUpperCase() === 'US')
          ?.description ?? null;

      const locMap = new Map(s.localizations.map((l) => [l.languageCode, l]));
      const localizations = languages.map((lang) => {
        const l = locMap.get(lang.code);
        return {
          languageCode: lang.code,
          flag: lang.flag,
          name: l?.name ?? null,
          abbrev: l?.abbrev ?? null
        };
      });

      return {
        id: s.id,
        defaultName: s.defaultName,
        description: usDescription ?? s.description ?? null,
        type: s.type,
        level: s.level,
        localizations,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      };
    });

    return paginate ? { list, total, page, pageSize } : list;
  } catch (error) {
    console.error('查询 Stitch 列表失败:', error);
    throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Stitch 列表不存在或查询失败' });
  }
}


/**
 * 删除 Stitch
 * @param id Stitch 主键ID
 * @returns 删除成功的 Stitch 主键ID
 */
export async function deleteStitch(id: number) {
  try {
    const result = await prisma.stitch.update({
      where: { id, deleted: 0 },
      data: { deleted: 1 },
    });
    return result.id;
  } catch (error) {
    console.error('删除 Stitch 失败:', error);
    throw new BasicError('BUSINESS_EXCEPTION', { statusCode: 400, message: '删除 Stitch 失败' });
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
    const validCodes = new Set(languages.map(l => l.code.toUpperCase()));

    const items = Array.isArray(jsonData) ? jsonData : [];
    const inputDefaultNames = Array.from(
      new Set(items.map(i => (i?.defaultName ?? '').trim()).filter(Boolean))
    );

    const existingStitches = inputDefaultNames.length
      ? await prisma.stitch.findMany({
          where: { deleted: 0, defaultName: { in: inputDefaultNames } },
          select: { id: true, defaultName: true },
        })
      : [];

    const stitchIdByDefaultName = new Map(existingStitches.map(s => [s.defaultName, s.id]));
    const seenDefaultNames = new Set<string>();

    let count = 0;
    for (let start = 0; start < items.length; start += 20) {
      const batch = items.slice(start, start + 20);
      for (const item of batch) {
        const defaultName = (item?.defaultName ?? '').trim();
        if (!defaultName) {
          throw new BasicError('BUSINESS_EXCEPTION', { statusCode: 400, message: '缺少 defaultName' });
        }
        if (seenDefaultNames.has(defaultName)) continue;
        seenDefaultNames.add(defaultName);

        const rawLocs = Array.isArray(item?.localizations) ? item.localizations : [];
        if (!rawLocs.length) {
          throw new BasicError('BUSINESS_EXCEPTION', { statusCode: 400, message: '缺少 localizations（至少 1 个）' });
        }

        const normalizedLocs = rawLocs.map((l: any) => ({
          languageCode: (l?.languageCode ?? '').trim().toUpperCase(),
          name: (l?.name ?? '').trim(),
          description: (l?.description ?? '').trim(),
          abbrev: typeof l?.abbrev === 'string' && l.abbrev.trim() ? l.abbrev.trim() : undefined,
        }));

        if (normalizedLocs.some((l: any) => !l.languageCode || !l.name || !l.description)) {
          throw new BasicError('BUSINESS_EXCEPTION', { statusCode: 400, message: 'localization 字段不完整（需 languageCode/name/description）' });
        }

        const invalid = Array.from(
          new Set(normalizedLocs.map((l: any) => l.languageCode).filter((code: string) => !validCodes.has(code)))
        );
        if (invalid.length) {
          throw new BasicError('BUSINESS_EXCEPTION', { statusCode: 400, message: `无效 languageCode: ${invalid.join(', ')}` });
        }

        const locByCode = new Map(normalizedLocs.map((l: any) => [l.languageCode, l]));
        const locs = Array.from(locByCode.values());

        const stitchId = await createOrUpdateStitch(item.id ?? stitchIdByDefaultName.get(defaultName) ?? null, {
          defaultName,
          description: item.description,
          type: item.type,
          level: item.level,
        });
        stitchIdByDefaultName.set(defaultName, stitchId);

        const existing = await prisma.stitchLocalization.findMany({
          where: { deleted: 0, stitchId, languageCode: { in: locs.map((l: any) => l.languageCode) } },
          select: { languageCode: true, name: true },
        });
        const existingNameByCode = new Map(existing.map((l: any) => [l.languageCode, l.name]));

        const toUpsert = locs.filter((l: any) => existingNameByCode.get(l.languageCode) !== l.name);
        if (toUpsert.length) {
          await prisma.$transaction(
            toUpsert.map((l: any) =>
              prisma.stitchLocalization.upsert({
                where: { stitchId_languageCode: { stitchId, languageCode: l.languageCode } },
                update: { name: l.name, description: l.description, abbrev: l.abbrev ?? undefined },
                create: { stitchId, languageCode: l.languageCode, name: l.name, description: l.description, abbrev: l.abbrev ?? undefined },
              })
            )
          );
        }

        count++;
      }
    }
    return count;
  } catch (error) {
    console.error('批量导入 Stitch 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '批量导入失败' });
  }
}


// 导入指定语言的 Stitch 到数据库
export async function importStitchLocalizations(input: {
  code: string
  list: Array<{
    stitchId: number
    name?: string | null
    alias?: string | null
    description?: string | null
  }>
}) {
  try {
    const code = String(input?.code ?? '').trim().toUpperCase()
    if (!code) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'languageCode 为必填' })
    }

    const list = Array.isArray(input?.list) ? input.list : []
    if (!list.length) return 0

    const exists = await prisma.stitchLanguage.findFirst({
      where: { deleted: 0, code },
      select: { code: true },
    })
    if (!exists) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `languageCode 不支持：${code}` })
    }

    const byId = new Map<number, { stitchId: number; name: string; description: string; abbrev?: string }>()
    for (const it of list) {
      const stitchId = Number(it?.stitchId)
      if (!Number.isFinite(stitchId) || stitchId <= 0) continue
      const name = String(it?.name ?? '').trim()
      const description = String(it?.description ?? '').trim()
      const abbrev = String(it?.alias ?? '').trim() || undefined
      byId.set(stitchId, { stitchId, name, description, abbrev })
    }

    const items = Array.from(byId.values())
    if (!items.length) return 0

    for (let i = 0; i < items.length; i += 50) {
      const batch = items.slice(i, i + 50)
      await prisma.$transaction(
        batch.map((it) =>
          prisma.stitchLocalization.upsert({
            where: { stitchId_languageCode: { stitchId: it.stitchId, languageCode: code } },
            update: {
              name: it.name,
              description: it.description,
              abbrev: it.abbrev ?? undefined,
              deleted: 0,
            },
            create: {
              stitchId: it.stitchId,
              languageCode: code,
              name: it.name,
              description: it.description,
              abbrev: it.abbrev ?? undefined,
            },
          })
        )
      )
    }

    return items.length
  } catch (error) {
    console.error('导入指定语言的 Stitch 失败:', error)
    if (error instanceof BasicError) throw error
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '导入指定语言的 Stitch 失败' })
  }
}


/**
 * 查询 所有 simple stitch
 * 入参：languageCode 语言代码
 * return data 结构：
 */
export async function getSimpleStitchSections(languageCode: string) {
  try {
    const code = String(languageCode ?? '').trim().toUpperCase();
    if (!code) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'languageCode 为必填' });
    }

    const exists = await prisma.stitchLanguage.findFirst({
      where: { deleted: 0, code },
      select: { code: true },
    });
    if (!exists) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `languageCode 不支持：${code}` });
    }

    const stitches = await prisma.stitch.findMany({
      where: { deleted: 0 },
      select: {
        id: true,
        defaultName: true,
        description: true,
        level: true,
        localizations: {
          where: { deleted: 0, languageCode: code },
          select: { name: true, abbrev: true, description: true },
        },
      },
      orderBy: [{ level: 'asc' }, { defaultName: 'asc' }],
    });

    const levelLabel: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    };
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];

    const sectionMap = new Map<string, { id: string; name: string; terms: Record<string, any> }>();

    for (const s of stitches) {
      const level = String(s.level ?? '').trim() || 'unknown';
      const loc = Array.isArray(s.localizations) ? s.localizations[0] : undefined;
      const name = String((loc as any)?.name ?? s.defaultName ?? '').trim();
      const abbrev = String((loc as any)?.abbrev ?? '').trim();
      const desc = String((loc as any)?.description ?? s.description ?? '').trim();

      const section = sectionMap.get(level) ?? {
        id: level,
        name: levelLabel[level] ?? level,
        terms: {},
      };

      const key = name || String(s.id);
      section.terms[key] = {
        chinese: '',
        notation_cn: '',
        us_abbrev: abbrev,
        us: name,
        us_description: desc,
        description: desc,
      };

      sectionMap.set(level, section);
    }

    return Array.from(sectionMap.values()).sort((a, b) => {
      const ai = levelOrder.indexOf(a.id);
      const bi = levelOrder.indexOf(b.id);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return String(a.name).localeCompare(String(b.name));
    });
  } catch (error) {
    console.error('查询 simple stitch 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '查询 simple stitch 失败' });
  }
}

// 根据 languageCode 查询所有 Stitch 对应的 name 和 abbrev
export async function getStitchNamesAndAbbrevs(languageCode: string) {
  try {
    const code = String(languageCode ?? '').trim().toUpperCase();
    if (!code) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'languageCode 为必填' });
    }

    const exists = await prisma.stitchLanguage.findFirst({
      where: { deleted: 0, code },
      select: { code: true },
    });
    if (!exists) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `languageCode 不支持：${code}` });
    }

    const stitches = await prisma.stitch.findMany({
      where: { deleted: 0 },
      select: {
        id: true,
        defaultName: true,
        localizations: {
          where: { deleted: 0, languageCode: code },
          select: { name: true, abbrev: true },
        },
      },
      orderBy: { defaultName: 'asc' },
    });

    return stitches.map((s) => {
      const loc = Array.isArray(s.localizations) ? s.localizations[0] : undefined;
      const name = String((loc as any)?.name ?? s.defaultName ?? '').trim();
      const abbrev = String((loc as any)?.abbrev ?? '').trim();
      return {
        id: s.id,
        name,
        abbrev: abbrev || null
      };
    });
  } catch (error) {
    console.error('查询 Stitch name/abbrev 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '查询 Stitch name/abbrev 失败' });
  }
}


// 根据 languageCode 查询所有 Stitch
export async function getStitchesByLanguage(languageCode: string) {
  try {
    const code = String(languageCode ?? '').trim().toUpperCase();
    if (!code) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'languageCode 为必填' });
    }

    const exists = await prisma.stitchLanguage.findFirst({
      where: { deleted: 0, code },
      select: { code: true },
    });
    if (!exists) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `languageCode 不支持：${code}` });
    }

    const rows = await prisma.stitchLocalization.findMany({
      where: { deleted: 0, languageCode: code },
      select: {
        id: true,
        stitchId: true,
        name: true,
        abbrev: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      stitchId: row.stitchId,
      name: row.name,
      alias: row.abbrev ?? null,
      description: row.description,
    }));
  } catch (error) {
    console.error('查询 Stitch 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '查询 Stitch 失败' });
  }
}


/**
 * =======================================================
 * language 支持
 * - 添加一个 language支持
 * - 删除一个 language支持
 * - 查询所有 language支持
 * =======================================================
 */

/**
 * 添加一个 language支持
 * @param languageCode 语言代码
 * @param flag 语言标志
 * @returns 新增的 StitchLanguage 对象
 */
export async function addStitchLanguage(languageCode: string, flag: string, name: string) {
  try {
    const code = languageCode?.trim().toUpperCase();
    const f = flag?.trim();
    const n = name?.trim();
    if (!code || !f || !n) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'code、flag、name 为必填' });
    }

    const exists = await prisma.stitchLanguage.findUnique({ where: { code: code.toUpperCase() } });
    if (exists) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `语言已存在：${code}` });
    }

    return await prisma.stitchLanguage.create({
      data: { code, name: n, flag: f },
      select: { code: true, name: true, flag: true } // 仅返回可序列化字段
    });
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

    const exists = await prisma.stitchLanguage.findUnique({ where: { code: code.toUpperCase() } });
    if (!exists) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `语言不存在：${code}` });
    }

    return await prisma.stitchLanguage.update({
      where: { code: code.toUpperCase() },
      data: { deleted: 1 },
      select: { code: true } // 避免返回 BigInt 字段
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


// 根据目标语言 和 aliasList 查询 StitchLanguage
export async function queryStitchLanguage(languageCode: string, aliasList: string[]) {
  try {
    const code = String(languageCode ?? '').trim().toUpperCase();
    if (!code) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'languageCode 为必填' });
    }

    const exists = await prisma.stitchLanguage.findFirst({
      where: { deleted: 0, code: code.toUpperCase() },
      select: { code: true },
    });
    if (!exists) {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: `language 不支持：${code}` });
    }

    const list = Array.isArray(aliasList) ? aliasList : [];
    const seen = new Set<string>();
    const aliases: string[] = [];
    for (const a of list) {
      const s = String(a ?? '').trim();
      if (!s) continue;
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      aliases.push(s);
    }

    if (!aliases.length) return [];

    const buildAbbrevOr = (chunk: string[]) =>
      chunk.map((a) => ({ abbrev: { equals: a, mode: 'insensitive' as const } }));

    const matches: Array<{ stitchId: number; abbrev: string | null }> = [];

    for (let i = 0; i < aliases.length; i += 100) {
      const chunk = aliases.slice(i, i + 100);
      const rows = await prisma.stitchLocalization.findMany({
        where: {
          deleted: 0,
          languageCode: 'US',
          OR: buildAbbrevOr(chunk),
        },
        select: { stitchId: true, abbrev: true },
      });
      matches.push(...rows);
    }


    const stitchIdSet = new Set<number>();
    const stitchIdByAlias = new Map<string, number>();
    const aliasByAlias = new Map<string, string>();

    for (const m of matches) {
      const ab = String(m?.abbrev ?? '').trim();
      if (!ab) continue;
      const key = ab.toLowerCase();
      if (!stitchIdByAlias.has(key)) {
        stitchIdByAlias.set(key, m.stitchId);
        aliasByAlias.set(key, ab);
      }
      stitchIdSet.add(m.stitchId);
    }

    const missing = aliases.filter((a) => !stitchIdByAlias.has(a.toLowerCase()))
    if (missing.length) {
      throw new BasicError('PARAM_INVALID', {
        statusCode: 400,
        message: `存在未收录的 US abbrev: ${missing.join(', ')}`,
      })
    }

    const stitchIds = Array.from(stitchIdSet);
    const stitches = stitchIds.length
      ? await prisma.stitch.findMany({
          where: { deleted: 0, id: { in: stitchIds } },
          select: {
            id: true,
            defaultName: true,
            description: true,
            localizations: {
              where: { deleted: 0, languageCode: { in: [code, 'US'] } },
              select: { languageCode: true, name: true, description: true, abbrev: true },
            },
          },
        })
      : [];

    const stitchById = new Map(stitches.map((s) => [s.id, s]));

    return aliases.map((inputAlias) => {
      const key = inputAlias.toLowerCase();
      const stitchId = stitchIdByAlias.get(key);
      const stitch = stitchId != null ? stitchById.get(stitchId) : undefined;
      const locs = Array.isArray(stitch?.localizations) ? stitch!.localizations : [];
      const target = locs.find((l) => String(l.languageCode).toUpperCase() === code);
      const us = locs.find((l) => String(l.languageCode).toUpperCase() === 'US');

      const alias = aliasByAlias.get(key) ?? inputAlias;
      const full_text = String(target?.name ?? us?.name ?? stitch?.defaultName ?? alias).trim();
      const description = String(target?.description ?? us?.description ?? stitch?.description ?? '').trim();

      return { inputAlias, alias, full_text, description };
    });
  } catch (error) {
    console.error('根据 aliasList 查询 StitchLanguage 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '根据 aliasList 查询 StitchLanguage 失败' });
  }

}