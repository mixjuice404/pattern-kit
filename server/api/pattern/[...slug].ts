import { createRouter, useBase, readBody } from 'h3'
import { defineApiHandler } from '../../utils/defineApiHandler'
import { useApiResponse } from '../../utils/apiResponse'
import { createOrUpdateCrochetPattern, 
  getCrochetPatternList, getCrochetPattern, deleteCrochetPattern, 
  createOrUpdatePromptTemplate, getPromptTemplateByAlias, buildPatternPrompt,
  createPatternDraft, getPatternDraftList, getPatternDraftDetail, updatePatternDraft } from '../../services/pattern.service'

const router = createRouter()

/**
 * ======================================================================
 * Crochet Pattern 统一处理路由
 * 1. 创建Crochet Pattern
 * 2. 获取Crochet Pattern(list/single)
 * 3. 更新Crochet Pattern
 * 4. 删除Crochet Pattern
 * ======================================================================
 */

// 创建Crochet Pattern
router.post('/edit', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id, ...data } = body
  const patternId = await createOrUpdateCrochetPattern(id, data)
  return useApiResponse({  id: patternId })
}));

// 获取Crochet Pattern列表
router.get('/list', defineApiHandler(async (event) => {
  const { page = 1, pageSize = 10 } = getQuery(event)
  const result = await getCrochetPatternList(Number(page), Number(pageSize))
  return useApiResponse(result)
}));

// 获取Crochet Pattern
router.get('/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  const pattern = await getCrochetPattern(Number(id))
  return useApiResponse({ pattern })
}));

// 删除 Crochet Pattern
router.post('/remove/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  await deleteCrochetPattern(Number(id))
  return useApiResponse({ status: 'ok', data: {} })
}));


/**
 * ======================================================================
 * Crochet Pattern Prompt 统一处理路由
 * 1. 创建或更新提示词模板
 * 3. 获取提示词模板详情(默认1 个)
 * ======================================================================
 */

// 创建或更新提示词模板
router.post('/prompt/edit', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id, ...data } = body
  const templateId = await createOrUpdatePromptTemplate(id, data)
  return useApiResponse({  id: templateId })
}));

// 获取提示词模板详情(默认获取第一个)
router.get('/prompt/:alias', defineApiHandler(async (event) => {
  const { alias } = getRouterParams(event)
  const template = await getPromptTemplateByAlias(alias) 
  return useApiResponse({ template })
}));

router.post('/prompt/build', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const prompt = await buildPatternPrompt(body?.content ?? body)
  return useApiResponse({ prompt })
}));

/**
 * ======================================================================
 * Crochet Pattern Draft 统一处理路由
 * ======================================================================
 */

// 创建Crochet Pattern Draft
router.post('/draft/create', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { data } = body
  const draftId = await createPatternDraft(data)
  return useApiResponse({  id: draftId })
}));

// 获取Crochet Pattern Draft list
router.get('/draft/list', defineApiHandler(async (event) => {
  const { page = 1, pageSize = 10 } = getQuery(event)
  const result = await getPatternDraftList(Number(page), Number(pageSize))
  return useApiResponse(result)
}));

// 获取Crochet Pattern Draft detail
router.get('/draft/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  const draft = await getPatternDraftDetail(Number(id))
  return useApiResponse({ draft })
}));

// 更新Crochet Pattern Draft
router.post('/draft/update', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id, ...data } = body
  const draftId = await updatePatternDraft(Number(id), data)
  return useApiResponse({  id: draftId })
}));


/**
 * ======================================================================
 * Crochet Pattern Testing
 * ======================================================================
 */

router.get('/testing', defineApiHandler(async () => {
  // 查询所有 Patterns
  const patterns = await prisma.crochetPattern.findMany({
    where: { deleted: 0 },
    select: { id: true, pattern_json: true },
    orderBy: { created_at: 'desc' }
  });

  // 解析 pattern_json 为 JSON 格式，并且将 JSON 结构中的 terms[].alias 全部取出来，放到一个 list 中, 并统计出现了几次
  const counter = new Map<string, number>();
  for (const p of patterns) {
    let data: any = p.pattern_json;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { continue; }
    }
    const terms = Array.isArray(data?.terms) ? data.terms : [];
    for (const t of terms) {
      const alias = typeof t?.alias === 'string' ? t.alias.trim() : '';
      if (alias) counter.set(alias, (counter.get(alias) ?? 0) + 1);
    }
  }
  const list = Array.from(counter, ([alias, count]) => ({ alias, count }));

  return useApiResponse(list)
}));




export default useBase('/api/pattern', router.handler)