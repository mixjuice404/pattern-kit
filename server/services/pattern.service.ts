// 文件内的函数：createOrUpdateCrochetPattern
import { BasicError } from '../utils/errors';
import prisma from '../utils/prisma';
import { aiGenerateText } from './ai';
import { deepCleanJson } from '../utils/json.clean';
import { applyTranslations, flattenForTranslation, type FlattenedTextItem } from '../utils/json.flatten'
import { queryStitchLanguage } from './stitch.service';
// 注意：现在可以不再直接导入 createError，除非在 BasicError 无法覆盖的场景下仍需使用

//  Crochet Pattern 服务 ========================================================================

// 创建 or 更新 Crochet Pattern
export async function createOrUpdateCrochetPattern(id: number | null, data: any) {
  try {

    const rawPatternJson = data?.pattern_json ?? null
    const cleanedPatternJson = deepCleanJson(rawPatternJson)

    const patternInfo = {
      title: data.title,
      cover_image: rawPatternJson?.cover_image || '', 
      description: data.description,
      pattern_json: cleanedPatternJson ?? null,
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
export async function getCrochetPattern(id: number, lang?: string) {
  try {
    const base = await prisma.crochetPattern.findFirst({
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

    if (!base) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Crochet Pattern 不存在' });
    }

    const code = String(lang ?? '').trim().toLowerCase()
    if (!code || code === 'en') return base

    const loc = await prisma.patternLocalization.findFirst({
      where: { patternId: id, languageCode: code },
      select: { pattern_json: true },
    })
    const next = { ...base, pattern_json: (loc?.pattern_json ?? null) }
    return next
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


// Crochet Pattern 国际化 STEP 1 - 内容翻译
export async function patternLocalization(id: number, lang: string) {

  // 检查 lang 是否为空 并且只能等于 'en'、'fr','de','es'
  const validLangs = ['en','fr','de','es']
  if (!validLangs.includes(lang)) {
    throw new BasicError('PARAM_INVALID', { statusCode: 400, message: '语言参数无效' });
  }

  // 检查 Crochet Pattern 是否存在 & 查询
  const base = await prisma.crochetPattern.findFirst({
    where: { id, deleted: 0 },
    select: {
      id: true,
      pattern_json: true
    },
  });

  if (!base) {
    throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Crochet Pattern 不存在' });
  }

  // 扁平化 pattern_json
  const originalJson = base.pattern_json
  const includePaths = ['title', 'inspiration', 'finishingTips','bonus_tips','materialsDesc',
     "estimatedTime", "finishedSize", "bonus_community", "techniques"]
  const items = originalJson ? flattenForTranslation(originalJson, { includePaths }) : []
  // 去掉 items 中 包含 bottom 的项
  const filteredItems = items.filter((item) => !item.path.includes('bottom'))

  // items 为空时，直接返回 base
  if (!filteredItems.length) return base
  // items 不为空时，继续处理, items 转换为 json 字符串
  const itemsJson = JSON.stringify(filteredItems)

  // 调用 AI 执行翻译（需要根据 lang 设置对应的 prompt 语言描述） 
  const template = await getPromptTemplateByAlias('pattern_localization');
  if (!template) {
    throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: '提示词模板不存在' });
  }

  // 调用 AI 执行翻译（需要根据 lang 设置对应的 prompt 语言描述） 
  const langDesc = lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : lang === 'de' ? 'Deutsch' : 'Español'

  const prompt = template.template.replace('{{lang}}', langDesc).replace('{{json}}', itemsJson)
  console.log('prompt', prompt)
  const textJsonStr = await aiGenerateText({
      prompt,
      model: 'gemini-3-flash-preview',
    });

  // textJsonStr 转为 FlattenedTextItem[]
  const nextItems = textJsonStr ? JSON.parse(textJsonStr) as FlattenedTextItem[] : []
  // 回写结果
  const baseJson = originalJson && typeof originalJson === 'object' ? originalJson : {}
  const nextJson = applyTranslations(baseJson as any, nextItems) ?? null
  // 保存
  if (nextJson) {
    await prisma.patternLocalization.upsert({
      where: { patternId_languageCode: { patternId: id, languageCode: lang } },
      update: { pattern_json: nextJson },
      create: { patternId: id, languageCode: lang, pattern_json: nextJson },
    })
  }
}


// Crochet Pattern 国际化 STEP 2 -  图解主体翻译
export async function instructionsLocalization(patternId: number, lang: string) {
  // 检查 lang 是否为空 并且只能等于 'en'、'fr','de','es'
  const validLangs = ['en','fr','de','es']
  if (!validLangs.includes(lang)) {
    throw new BasicError('PARAM_INVALID', { statusCode: 400, message: '语言参数无效' });
  }

  // 查询对应的 pattern_json
  const base = await prisma.patternLocalization.findFirst({
    where: { patternId, languageCode: lang, deleted: 0 },
    select: {
      id: true,
      patternId: true,
      languageCode: true,
      pattern_json: true
    },
  });
  if (!base) {
    throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'PatternLocalization 不存在' });
  }
  // 解析 & 拆分 & 扁平化 pattern_json
  const originalJson = base.pattern_json
  // 提取 instructions 数组
  const instructions = isRecord(originalJson) && Array.isArray(originalJson.instructions)
  ? originalJson.instructions : []
  // 提取 terms 数组
  const terms: unknown[] = isRecord(originalJson) && Array.isArray(originalJson.terms)
    ? (originalJson.terms as unknown[])
    : []
  // 提取 terms 中的 alias 数组
  const aliasList = terms
    .map((term) => {
      if (!isRecord(term)) return ''
      const alias = term.alias
      return typeof alias === 'string' ? alias.trim() : ''
    })
    .filter(Boolean)


  // 查询 stitch dictionary - 组装配对的针法字典
  const stitchLanguages = await queryStitchLanguage(lang, aliasList)
  // 用 stitchLanguages 中的 alias,name,description 组装新的terms
  const nextTerms = Array.isArray(stitchLanguages)
    ? stitchLanguages
        .map((s: any) => {
          const alias = String(s?.alias ?? '').trim()
          const full_text = String(s?.name ?? '').trim()
          const description = String(s?.description ?? '').trim()
          return { alias, full_text, description }
        })
        .filter((t) => t.alias || t.full_text || t.description)
    : []

  const baseJson = isRecord(originalJson) ? originalJson : {}
  ;(baseJson as any).terms = nextTerms

  // 提取 stitchLanguages 组装为 inputAlias - Alias - inputName 格式(多行用\n分隔)
  const stitchLangStr = stitchLanguages.map((s: any) => `${s?.inputAlias ?? ''} - ${s?.alias ?? ''} - ${s?.inputName ?? ''}`).join('\n')
  
  // 开始 AI 翻译处理 instructions
  // instructions 扁平化
  const flattenedInstructions = flattenForTranslation(instructions)
  // 去掉 flattenedInstructions 中 path 包含imageBottom，bottom的项
  const filteredInstructions = flattenedInstructions.filter((item) => !item.path.includes('imageBottom') && !item.path.includes('bottom'))

  // 开始AI 翻译 
  const template = await getPromptTemplateByAlias('pattern_localization_instructions');
  if (!template) {
    throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: '提示词模板不存在' });
  }

  // 调用 AI 执行翻译（需要根据 lang 设置对应的 prompt 语言描述） 
  const langDesc = lang === 'es' ? 'Spanish(西班牙语标准)' : lang === 'fr' ? 'French(法语标准)' : lang === 'de' ? 'German(德语标准)' : 'US Terms'

  const prompt = template.template.replace('{{target_lang}}', langDesc)
  .replace('{{dict}}', stitchLangStr)
  .replace('{{json}}', JSON.stringify(filteredInstructions))
  const translateJsonStr = await aiGenerateText({
      prompt,
      model: 'gemini-3-flash-preview',
    });

  // translateJsonStr 转为 FlattenedTextItem[]
  const nextItems = translateJsonStr ? JSON.parse(translateJsonStr) as FlattenedTextItem[] : []
  // 回写结果
 
  const nextInstructions = applyTranslations(instructions as any, nextItems) ?? null
   ;(baseJson as any).instructions = nextInstructions
  // 保存
  await prisma.patternLocalization.upsert({
    where: { patternId_languageCode: { patternId: patternId, languageCode: lang.toLowerCase() } },
    update: { pattern_json: baseJson },
    create: { patternId: patternId, languageCode: lang.toLowerCase(), pattern_json: baseJson },
  })

  return baseJson;
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

// 获取提示词模板详情 id
export async function getPromptTemplateById(id: number) {
  try {
    // 根据 id 获取指定模板
    const template = await prisma.promptTemplate.findFirst({
      where: { id, deleted: 0 },
      select: {
        id: true,
        name: true,
        alias: true,
        template: true,
        description: true,
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


// 查询 prompt 模板列表
// 获取提示词模板列表(分页)
export async function getPromptTemplateList(page: number = 1, pageSize: number = 10) {
  try {
    const templates = await prisma.promptTemplate.findMany({
      where: { deleted: 0 },
      select: {
        id: true,
        name: true,
        alias: true,
        updated_at: true,
      },
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: templates,
      total: await prisma.promptTemplate.count({ where: { deleted: 0 } }),
      page,
      pageSize,
    };
  } catch (error) {
    console.error('获取提示词模板列表失败:', error);
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '获取提示词模板列表失败' });
  }
}


/**
 * ====================================================================
 * 构建 和 执行 AI Pattern 预处理
 * 1.拆分内容（基础信息 & pattern detail）
 * 2.基础信息校验
 *   - 结构化
 *   - 内容补全（AI，统一生成）
 * 3. pattern detail 校验
 *   - 结构化
 *   - AI 初审 & 统计针法
 * 4. 翻译转换
 *   - 组装 针法 prompt & 执行翻译结果
 * ====================================================================
 */


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


export async function preprocessPatternDraft(title: string, description: string) {
  try {
    const cleanTitle = String(title ?? '').trim()
    if (!cleanTitle) {
      throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'title 为必填' });
    }
    // 创建新的 patternDraft 记录
    const draft = await prisma.patternDraft.create({
      data: {
        title: cleanTitle,
        description: String(description ?? '').trim(),
        status: 'pending',
        state: 0,
      },
    });
    return draft.id;
  } catch (error) {
    console.error('预处理 Pattern Draft 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '预处理 Pattern Draft 失败' });
  }
}


// 更新 Pattern Draft - 上传raw_content
export async function updateRawContent(draftId: number, content: string) {
  try {
    const id = Number(draftId)
    if (!Number.isFinite(id) || id <= 0) {
      throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'draftId 为必填' })
    }

    const raw = String(content ?? '')
    if (!raw.trim()) {
      throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'raw_content 为必填' })
    }

    const exists = await prisma.patternDraft.findFirst({
      where: { id, deleted: 0 },
      select: { id: true },
    })
    if (!exists) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern Draft 不存在' })
    }

    await prisma.patternDraft.update({
      where: { id },
      data: {
        status: 'pending',
        raw_content: raw,
        state: 1,
      }
    })

    return id
  } catch (error) {
    console.error(`上传 raw_content 失败:`, error)
    if (error instanceof BasicError) throw error
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '上传 raw_content 失败' })
  }
}


export async function normalizeContent(draftId: number) {
  try {
    // 根据draftId 判断是否存在 & status 是否为 pending
    const draft = await prisma.patternDraft.findFirst({
      where: { id: draftId, deleted: 0 },
    });
    if (!draft) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern Draft 不存在或已处理' });
    }
    // 开始 归一化处理
    const normalizeTemplate = await getPromptTemplateByAlias('pattern_draft_structure');
    const normalizePrompt = String(normalizeTemplate.template ?? '').replace(/\{\{content\}\}/g, draft.raw_content ?? '');
    if (!normalizePrompt.trim()) {
      throw new BasicError('INVALID_PROMPT', { statusCode: 400, message: 'normalize 模板为空' });
    }
    const text = await aiGenerateText({
      prompt: normalizePrompt,
      model: 'gemini-3-flash-preview',
    });
    // todo 解析 text & 保存内容到 patternDraft 表
    // 更新 patternDraft 中status - 流转到下一阶段 normalized
    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { status: 'normalized', revised_content: text, state: 2 },
    });
    // 返回成功 - 由前端发起下一步指令（分散执行时间）
    return text;
   } catch (error) {
    console.error('构建 Pattern Prompt 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '构建 Pattern Prompt 失败' });
  }
}

export async function analyzePatternDraft(draftId: number) {
  try {
    // 根据draftId 判断是否存在 & status 是否为 normalized
    const draft = await prisma.patternDraft.findFirst({
      where: { id: draftId, deleted: 0 },
    });
    if (!draft) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern Draft 不存在或已处理' });
    }
    // 校验 revised_content 是否存在
    if (!draft.revised_content) {
      throw new BasicError('INPUT_REQUIRED', { statusCode: 400, message: 'revised_content 为必填' });
    }

    // todo call ai - gemini-pro-3.0 审核 revised_content
    const reviewTemplate = await getPromptTemplateByAlias('pattern_draft_ai_analyzed');
    const analyzePrompt = String(reviewTemplate.template ?? '').replace(/\{\{content\}\}/g, draft.revised_content);
    if (!analyzePrompt.trim()) {
      throw new BasicError('INVALID_PROMPT', { statusCode: 400, message: 'analyze 模板为空' });
    }
    const text = await aiGenerateText({
      prompt: analyzePrompt, 
      model: 'gemini-3-flash-preview',
    });

    let parsed: any
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new BasicError('PARAM_INVALID', { statusCode: 400, message: 'AI 输出不是合法 JSON' })
    }
    const list = Array.isArray(parsed?.report)
      ? parsed.report
      : Array.isArray(parsed?.list)
        ? parsed.list
        : null

    if (!list) {
      throw new BasicError('PARAM_INVALID', { statusCode: 400, message: 'AI 输出 JSON 缺少 report/list 数组' })
    }
    const info = { timestamp: Date.now(), list }

    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { report: info, state: 3 },
    });
  } catch (error) {
    console.error('审核 Pattern Draft 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '审核 Pattern Draft 失败' });
  }
}

// pattern_draft_stitch 查询模板 pattern_draft_stitch 组装 prompt 并调用 ai 生成结果
// 提取 Pattern 草稿中 stitches 元数据
export async function getStitchMeta(draftId: number) {
  try {
    const draft = await prisma.patternDraft.findFirst({
      where: { id: draftId, deleted: 0 },
      select: { revised_content: true },
    });
    if (!draft) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern 草稿不存在' });
    }
    // 3. 解析 revised_content 中的 stitches 元数据
    const stitchesTemplate = await getPromptTemplateByAlias('pattern_draft_stitch');
    const stitchesPrompt = String(stitchesTemplate.template ?? '').replace(/\{\{content\}\}/g, draft.revised_content ?? '');
    if (!stitchesPrompt.trim()) {
      throw new BasicError('INVALID_PROMPT', { statusCode: 400, message: 'stitches 模板为空' });
    }
    const text = await aiGenerateText({
      prompt: stitchesPrompt,
      model: 'gemini-3-flash-preview',
    });
    // text 解析 JSON 格式
    let parsed: any
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new BasicError('PARAM_INVALID', { statusCode: 400, message: 'AI 输出不是合法 JSON' })
    }
    const stitches = Array.isArray(parsed?.stitches)
      ? parsed.stitches
      : null
    if (!stitches) {
      throw new BasicError('PARAM_INVALID', { statusCode: 400, message: 'AI 输出 JSON 缺少 stitches 数组' })
    }
    const info = { timestamp: Date.now(), items:stitches }
    // 保存到 patternDraft 表
    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { stitches: info },
    }); 
    return info;
  } catch (error) {
    console.error('提取 Pattern 草稿中 stitches 元数据失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '提取 Pattern 草稿中 stitches 元数据失败' });
  }
}


// 更新 Pattern 草稿状态
export async function confirmReviewed(draftId: number, content: string) {
  try {
    const exists = await prisma.patternDraft.findFirst({
      where: { id: draftId, deleted: 0 },
      select: { id: true },
    });
    if (!exists) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern 草稿不存在' });
    }
    // 2.更新 status
    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { status: "info_completion", revised_content: content, state: 5 },
    });
  } catch (error) {
    console.error(`更新 Pattern 草稿 ${draftId} 状态失败:`, error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '更新 Pattern 草稿状态失败' });
  }
}


// 翻译 Pattern Draft（注入 stitch_dictionary）
export async function translatePatternDraft(draftId: number) {
  try {
    const draft = await prisma.patternDraft.findFirst({
      where: { id: draftId, deleted: 0 },
      select: {
        id: true,
        raw_content: true,
        revised_content: true,
        info: true,
      },
    });

    if (!draft) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern Draft 不存在' });
    }

    const translateTemplate = await getPromptTemplateByAlias('pattern_draft_translate');
    // stitch_dictionary 组装（兼容 abbrev / 误拼 abbbrev / 字符串 JSON）
    const rawInfo: any = (draft as any).info;
    let infoObj: any = rawInfo;
    if (typeof rawInfo === 'string') {
      try {
        infoObj = JSON.parse(rawInfo);
      } catch {
        infoObj = null;
      }
    }

    const abbrevList: any[] = Array.isArray(infoObj?.abbrev)
      ? infoObj.abbrev
      : Array.isArray(infoObj?.abbbrev)
        ? infoObj.abbbrev
        : [];

    const stitchDictionaryStr = abbrevList
      .map((it: any) => {
        const alias = String(it?.alias ?? '').trim();
        const enAlias = String(it?.en_alias ?? '').trim();
        const name = String(it?.name ?? '').trim();
        const nameZh = String(it?.name_zh ?? '').trim();

        const displayName = nameZh ? `${name}(${nameZh})` : name;
        const line = `${alias} - ${enAlias} - ${displayName}`.trim();
        return line === '- -' ? '' : line;
      })
      .filter(Boolean)
      .join('\n');

    const content = String(draft.revised_content ?? draft.raw_content ?? '');
    const prompt = String(translateTemplate.template ?? '')
      .replace(/\{\{content\}\}/g, content)
      .replace(/\{\{stitch_dictionary\}\}/g, stitchDictionaryStr);

    if (!prompt.trim()) {
      throw new BasicError('INVALID_PROMPT', { statusCode: 400, message: 'translate 模板为空' });
    }

    const text = await aiGenerateText({
      prompt,
      model: 'gemini-3-flash-preview',
    });

    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { status: 'translation_review', result_content: text, state: 6 },
    });
  } catch (error) {
    console.error('翻译 Pattern Draft 失败:', error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '翻译 Pattern Draft 失败' });
  }
}

// 生成 英文标题 和 内容  pattern_draft_ai_description
export async function genPatternDraftContent(draftId: number, title: string , description: string) {

  try {
    // 先将 title 和 description 保存到 patternDraft 表
    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { title, description },
    });
    // 调用 AI 生成英文标题和内容
    const translateTemplate = await getPromptTemplateByAlias('pattern_draft_ai_description');
    const prompt = String(translateTemplate.template ?? '')
      .replace(/\{\{title\}\}/g, title)
      .replace(/\{\{description\}\}/g, description);

    if (!prompt.trim()) {
      throw new BasicError('INVALID_PROMPT', { statusCode: 400, message: 'pattern_draft_ai_description 模板为空' });
    }

    const text = await aiGenerateText({
      prompt,
      model: 'gemini-3-flash-preview',
    });

    // text 格式：{ "title": "英文标题", "description": "英文描述" } 转换为 json 对象
    let infoObj: any = {};
    try {
      infoObj = JSON.parse(text);
    } catch {
      infoObj = {};
    }

    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { info: infoObj },
    });

    return infoObj;
  } catch (error) {
    console.error(`生成 Pattern 草稿 ${draftId} 内容失败:`, error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '生成 Pattern 草稿内容失败' });
  }
}


// 图解 supplies 信息ai规范化 pattern_draft_supplies
export async function normalizeSuppliesInfo(draftId: number, supplies: string) {
  try {
    
    // 调用 AI 生成标准化的 supplies 信息
    const translateTemplate = await getPromptTemplateByAlias('pattern_draft_supplies');
    const prompt = String(translateTemplate.template ?? '')
      .replace(/\{\{info\}\}/g, supplies);

    if (!prompt.trim()) {
      throw new BasicError('INVALID_PROMPT', { statusCode: 400, message: 'pattern_draft_supplies 模板为空' });
    }

    const text = await aiGenerateText({
      prompt,
      model: 'gemini-3-flash-preview',
    });
    
    // 保存标准化后的 supplies 信息到 patternDraft 表
    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { supplies: text },
    });

    return text;
  } catch (error) {
    console.error(`标准化 Pattern 草稿 ${draftId} supplies 信息失败:`, error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '标准化 Pattern 草稿 supplies 信息失败' });
  }
}

// 完成 组装最终结果
export async function assmblyPatternDraft(draftId: number) {

  // 查询 patternDraft 表
  const draft = await prisma.patternDraft.findFirst({
    where: { id: draftId, deleted: 0 },
    select: {
      id: true,
      title: true,
      description: true,
      raw_content: true,
      revised_content: true,
      result_content: true,
      meta: true,
      stitches: true,
      supplies: true,
      info: true,
    },
  });

  if (!draft) {
    throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern 草稿不存在' });
  }
  // 先解析 info 为英文标题和描述 markdown 格式 string
  const infoObj = draft.info ?? {}
  const title = isRecord(infoObj) ? String(infoObj.title ?? '').trim() : ''
  const description = isRecord(infoObj) ? String(infoObj.description ?? '').trim() : ''

  // 获取 supplies 信息
  const supplies = draft.supplies ?? ''

  // 获取 stitches 信息
  const stitchesInfo = draft.stitches ?? {}
  const items = isRecord(stitchesInfo) && Array.isArray(stitchesInfo.items) ? stitchesInfo.items : []
  const stitchesMarkdown = items.map(item => {

    console.log('item:', item)
    // item: unknown
    if (!isRecord(item)) return '';
    const enAlias = String(item.us_terms ?? '').trim()
    const name = String(item.title ?? '').trim()
    return `**${enAlias}**: ${name}`
  }).join('\n')

  
  // 组装最终结果
  const base = [
    `## ${title}`,
    description,
    '## 材料',
    String(supplies ?? ''),
    '## 针脚',
    stitchesMarkdown,
  ]
    .map((v) => String(v ?? '').trim())
    .filter(Boolean)
    .join('\n\n')

  const tail = String(draft.result_content ?? '').trim()
  const result = tail ? `${base}\n\n${tail}` : base

  return result;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

// 更新 pattern draft status
export async function updatePatternDraftState(draftId: number, state: number) {
  try {
    const exists = await prisma.patternDraft.findFirst({
      where: { id: draftId, deleted: 0 },
      select: { id: true },
    });
    if (!exists) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern 草稿不存在' });
    }
    // 2.更新 status
    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { state },
    });
  } catch (error) {
    console.error(`更新 Pattern 草稿 ${draftId} 状态失败:`, error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '更新 Pattern 草稿状态失败' });
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
        description: true,
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


// removePatternDraft
export async function removePatternDraft(draftId: number) {
  try {
    const exists = await prisma.patternDraft.findFirst({
      where: { id: draftId, deleted: 0 },
      select: { id: true },
    });
    if (!exists) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern 草稿不存在' });
    }
    // 2.更新 deleted
    await prisma.patternDraft.update({
      where: { id: draftId },
      data: { deleted: 1 },
    });
  } catch (error) {
    console.error(`删除 Pattern 草稿 ${draftId} 失败:`, error);
    if (error instanceof BasicError) throw error;
    throw new BasicError('UNKNOWN_ERROR', { statusCode: 500, message: '删除 Pattern 草稿失败' });
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
        description: true,
        status: true,
        version: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { id: 'desc' },
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
        description: true,
        meta: true,
        info: true,
        report: true,
        stitches: true,
        supplies: true,
        status: true,
        state: true
      },
    });
    if (!draft) {
      throw new BasicError('RESOURCE_NOT_FOUND', { statusCode: 404, message: 'Pattern 草稿不存在' });
    }
    console.log(`查询 Pattern 草稿 ${draftId} 详情成功`);
    // 需要把 info 格式化为 json 格式
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
    description?: string | null;
    raw_content?: string | null;
    revised_content?: string | null;
    result_content?: string | null;
    meta?: any | null;
    stitches?: any | null;
    info?: any | null;
  }
) {
  try {
    const data: any = {};

    const title = typeof draftData?.title === 'string' ? draftData.title.trim() : '';
    if (title) data.title = title;

    const description = typeof draftData?.description === 'string' ? draftData.description.trim() : '';
    if (description) data.description = description;

    const raw = typeof draftData?.raw_content === 'string' ? draftData.raw_content : null;
    if (raw != null && raw.trim()) data.raw_content = raw;

    const revised = typeof draftData?.revised_content === 'string' ? draftData.revised_content : null;
    if (revised != null && revised.trim()) data.revised_content = revised;

    const result = typeof draftData?.result_content === 'string' ? draftData.result_content : null;
    if (result != null && result.trim()) data.result_content = result;

    if (draftData?.info != null) data.info = draftData.info;

    if (draftData?.meta != null) data.meta = draftData.meta;

    if (draftData?.stitches != null) data.stitches = draftData.stitches;

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
        description: true,
        raw_content: true,
        revised_content: true,
        result_content: true,
        meta: true,
        info: true,
        stitches: true,
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