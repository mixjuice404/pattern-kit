// 文件内的函数：createOrUpdateCrochetPattern
import { BasicError } from '../utils/errors';
import prisma from '../utils/prisma';
import { aiGenerateText } from './ai';
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

export async function buildPatternPrompt(patternInfo: any) {
  try {
    const normalizeTemplate = await getPromptTemplateByAlias('normalize');
    const patternTemplate = await getPromptTemplateByAlias('pattern');

    const content = JSON.stringify(patternInfo ?? {}, null, 2);
    const normalizePrompt = String(normalizeTemplate.template ?? '').replace(/\{\{content\}\}/g, content);
    if (!normalizePrompt.trim()) {
      throw new BasicError('INVALID_PROMPT', { statusCode: 400, message: 'normalize 模板为空' });
    }

    const text = await aiGenerateText({
      prompt: normalizePrompt,
      model: 'gemini-3-flash-preview',
    });

    return String(patternTemplate.template ?? '').replace(/\{\{json\}\}/g, text);
  } catch (error) {
    console.error('构建 Pattern Prompt 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '构建 Pattern Prompt 失败' });
  }
}


/**
 * ====================================================================
 * 构建 Pattern 草稿
 * 1.创建
 * 2.更新
 * 3.查询list
 * 4.查询详情
 * 5.删除
 * 
 * status 为阶段 默认值 待处理，（待处理, 修订中，标准化，审核中, 已通过）
 * ====================================================================
 */

// 创建 Pattern 草稿
export async function createPatternDraft(draftData: {
  title: string;
  raw_content?: string | null;
  revised_content?: string | null;
  result_content?: string | null;
  meta?: any | null;
}) {
  try {
    const title = String(draftData?.title ?? '').trim();
    if (!title) {
      throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'title 为必填' });
    }

    const data: any = { title };
    if (draftData.raw_content !== undefined) data.raw_content = draftData.raw_content;
    if (draftData.revised_content !== undefined) data.revised_content = draftData.revised_content;
    if (draftData.result_content !== undefined) data.result_content = draftData.result_content;
    if (draftData.meta !== undefined) data.meta = draftData.meta;

    const draft = await prisma.patternDraft.create({
      data,
      select: {
        id: true,
        title: true,
        raw_content: true,
        revised_content: true,
        result_content: true,
        meta: true,
        status: true,
        version: true,
        created_at: true,
        updated_at: true,
      },
    });
    console.log(`Pattern 草稿 ${draft.id} 创建成功`);
    return draft;
  } catch (error) {
    console.error('创建 Pattern 草稿失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '创建 Pattern 草稿失败' });
  }
}


// 查询 Pattern 草稿列表(分页)
export async function getPatternDraftList(page: number = 1, pageSize: number = 10) {
  try {
    const drafts = await prisma.patternDraft.findMany({
      where: { deleted: 0 },
      select: {
        id: true,
        title: true,
        status: true,
        version: true,
        created_at: true,
        updated_at: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    console.log(`查询 Pattern 草稿列表成功，共 ${drafts.length} 条`);
    return drafts;
  } catch (error) {
    console.error('查询 Pattern 草稿列表失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '查询 Pattern 草稿列表失败' });
  }
}


// 查询 Pattern 草稿详情
export async function getPatternDraftDetail(draftId: number) {
  try {
    const draft = await prisma.patternDraft.findFirst({
      where: { id: draftId, deleted: 0 },
      select: {
        id: true,
        title: true,
        raw_content: true,
        revised_content: true,
        result_content: true,
        meta: true,
        status: true,
        version: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!draft) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern 草稿不存在' });
    }
    console.log(`查询 Pattern 草稿 ${draftId} 详情成功`);
    return draft;
  } catch (error) {
    console.error(`查询 Pattern 草稿 ${draftId} 详情失败:`, error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '查询 Pattern 草稿详情失败' });
  }
}


// 更新 Pattern 草稿
export async function updatePatternDraft(
  draftId: number,
  draftData: {
    title?: string | null;
    raw_content?: string | null;
    revised_content?: string | null;
    result_content?: string | null;
    meta?: any | null;
  }
) {
  try {
    const data: any = {};

    const title = typeof draftData?.title === 'string' ? draftData.title.trim() : '';
    if (title) data.title = title;

    const raw = typeof draftData?.raw_content === 'string' ? draftData.raw_content : null;
    if (raw != null && raw.trim()) data.raw_content = raw;

    const revised = typeof draftData?.revised_content === 'string' ? draftData.revised_content : null;
    if (revised != null && revised.trim()) data.revised_content = revised;

    const result = typeof draftData?.result_content === 'string' ? draftData.result_content : null;
    if (result != null && result.trim()) data.result_content = result;

    if (draftData?.meta != null) data.meta = draftData.meta;

    if (!Object.keys(data).length) {
      return await getPatternDraftDetail(draftId);
    }

    const exists = await prisma.patternDraft.findFirst({
      where: { id: draftId, deleted: 0 },
      select: { id: true },
    });
    if (!exists) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern 草稿不存在' });
    }

    const draft = await prisma.patternDraft.update({
      where: { id: draftId },
      data,
      select: {
        id: true,
        title: true,
        raw_content: true,
        revised_content: true,
        result_content: true,
        meta: true,
        status: true,
        version: true,
        created_at: true,
        updated_at: true,
      },
    });
    console.log(`Pattern 草稿 ${draftId} 更新成功`);
    return draft;
  } catch (error) {
    console.error(`更新 Pattern 草稿 ${draftId} 失败:`, error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '更新 Pattern 草稿失败' });
  }
}