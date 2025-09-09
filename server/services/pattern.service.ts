// 文件内的函数：createOrUpdateCrochetPattern
import { BasicError } from '../utils/errors';
import prisma from '../utils/prisma';
// 注意：现在可以不再直接导入 createError，除非在 BasicError 无法覆盖的场景下仍需使用

//  Crochet Pattern 服务 ========================================================================

// 创建 or 更新 Crochet Pattern
export async function createOrUpdateCrochetPattern(id: number | null, data: any) {
  try {
    if (id === null) {
      // 如果 id 为 null，直接创建新记录
      const created = await prisma.crochetPattern.create({ data });
      return created.id; // 仅返回 id
    }

    const result = await prisma.crochetPattern.upsert({
      where: { id },
      update: data,
      create: data,
    });
    return result.id; // 仅返回 id
  } catch (error) {
    console.error('创建/更新 Crochet Pattern 失败:', error);
    if (id === null) {
      throw new BasicError('RESOURCE_CREATION_FAILED', { statusCode: 500 });
    }
    throw new BasicError('RESOURCE_UPDATE_FAILED', { statusCode: 500 });
  }
}

// 获取 Crochet Pattern 列表
export async function getCrochetPatternList() {
  try {
    const patterns = await prisma.crochetPattern.findMany({
      where: {
        deleted: 0,
      },
      select: {
        id: true,
        title: true,
        cover_image: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc',
      }
    });
    return patterns;
  } catch (error) {
    console.error('获取 Crochet Pattern 列表失败:', error);
    throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Crochet Pattern 列表不存在' });
  }
}


// 获取Crochet Pattern
export async function getCrochetPattern(id: number) {
  try {
    const pattern = await prisma.crochetPattern.findFirst({
      where: { id, deleted: 0 },
      select: {
        id: true,
        title: true,
        cover_image: true,
        description: true,
        pattern_json: true,
        updated_at: true,
      },
    });

    if (!pattern) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Crochet Pattern 不存在' });
    }
    return pattern;
  } catch (error) {
    console.error('获取 Crochet Pattern 详情失败:', error);
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500 });
  }
}


// 删除 Crochet Pattern
export async function deleteCrochetPattern(id: number) {
  try {
    const result = await prisma.crochetPattern.update({
      where: { id },
      data: { deleted: 1 },
    });
    return result;
  } catch (error) {
    console.error('删除 Crochet Pattern 失败:', error);
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500 });
  }
}
