// 文件内的函数：createOrUpdateCrochetPattern
import { BasicError } from '../utils/errors';
import prisma from '../utils/prisma';
// 注意：现在可以不再直接导入 createError，除非在 BasicError 无法覆盖的场景下仍需使用

//  Crochet Pattern 服务 ========================================================================

// 创建 or 更新 Crochet Pattern
export async function createOrUpdateCrochetPattern(id: number | null, data: any) {
  try {

    const patternInfo = {
      title: data.title,
      cover_image: data.pattern_json.cover_image || '', 
      description: data.description,
      pattern_json: data.pattern_json,
    };

    if (id === null) {
      // 如果 id 为 null，直接创建新记录
      const created = await prisma.crochetPattern.create({ data: patternInfo });
      return created.id; // 仅返回 id
    }

    const result = await prisma.crochetPattern.upsert({
      where: { id },
      update: patternInfo,
      create: patternInfo,
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
export async function getCrochetPatternList(page: number, pageSize: number) {
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
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      patterns,
      total: await prisma.crochetPattern.count({
        where: { deleted: 0 },
      }),
      page,
      pageSize
    };
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


/*
 * 提示词模板服务 ========================================================================
 * 1. 创建或更新提示词模板
 * 3. 获取提示词模板详情(默认1 个)
 */

// 创建或更新提示词模板
export async function createOrUpdatePromptTemplate(id: number | null, data: {
  name: string;
  template: string;
  description?: string;
  alias?: string;
}) {
  try {
    // 检查 alias 是否为空
    if (!data.alias || data.alias.trim() === '') {
      throw new BasicError('UNKNOWN_ERROR', { statusCode: 400, message: 'alias 不能为空' });
    }

    if (id) {
      // 更新现有模板
      const updatedTemplate = await prisma.promptTemplate.update({
        where: { id, deleted: 0 },
        data: {
          name: data.name,
          alias: data.alias,
          template: data.template,
          description: data.description,
          updated_at: new Date(),
        },
        select: {
          id: true,
          name: true,
          alias: true,
          template: true,
          description: true,
          version: true,
          created_at: true,
          updated_at: true,
        },
      });
      console.log(`提示词模板 ${data.name} 更新成功`);
      return updatedTemplate;
    } else {
      // 检查是否已存在同 alias 的模板
      const existingTemplate = await prisma.promptTemplate.findFirst({
        where: { 
          alias: data.alias,
          deleted: 0 
        }
      });

      if (existingTemplate) {
        // 如果存在，则更新
        const updatedTemplate = await prisma.promptTemplate.update({
          where: { id: existingTemplate.id },
          data: {
            name: data.name,
            template: data.template,
            description: data.description,
            updated_at: new Date(),
          },
          select: {
            id: true,
            name: true,
            alias: true,
            template: true,
            description: true,
            version: true,
            created_at: true,
            updated_at: true,
          },
        });
        console.log(`提示词模板 ${data.name} 更新成功`);
        return updatedTemplate;
      } else {
        // 创建新模板
        const newTemplate = await prisma.promptTemplate.create({
          data: {
            name: data.name,
            alias: data.alias,
            template: data.template,
            description: data.description,
          },
          select: {
            id: true,
            name: true,
            alias: true,
            template: true,
            description: true,
            version: true,
            created_at: true,
            updated_at: true,
          },
        });
        console.log(`提示词模板 ${data.name} 创建成功`);
        return newTemplate;
      }
    }
  } catch (error) {
    console.error('创建或更新提示词模板失败:', error);
    if (error instanceof BasicError) {
      throw error;
    }
    throw new BasicError('RESOURCE_CREATION_FAILED', { statusCode: 500, message: '提示词模板操作失败' });
  }
}

// 获取提示词模板详情(默认获取第一个)
export async function getPromptTemplateByAlias(alias?: string) {
  try {
    // 如果 alias 为空，直接抛出错误
    if (!alias) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: '提示词模板不存在' });
    }

    // 根据 alias 获取指定模板
    const template = await prisma.promptTemplate.findFirst({
      where: { alias, deleted: 0 },
      select: {
        id: true,
        name: true,
        template: true,
        description: true,
        version: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!template) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: '提示词模板不存在' });
    }

    console.log(`获取提示词模板成功: ${template.name}`);
    return template;
  } catch (error) {
    console.error('获取提示词模板失败:', error);
    if (error instanceof BasicError) {
      throw error;
    }
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '获取提示词模板失败' });
  }
}

