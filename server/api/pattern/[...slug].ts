import { createRouter, useBase, readBody, createError, setHeader } from 'h3'
import { defineApiHandler } from '../../utils/defineApiHandler'
import { useApiResponse } from '../../utils/apiResponse'
import { flattenForTranslation, applyTranslations } from '../../utils/json.flatten'
import { createOrUpdateCrochetPattern, patternLocalization, instructionsLocalization,
  getCrochetPatternList, getCrochetPattern, deleteCrochetPattern, 
  createOrUpdatePromptTemplate, getPromptTemplateByAlias, buildPatternPrompt,
  getPatternDraftList, getPatternDraftDetail, updatePatternDraft, 
  getPromptTemplateList, getPromptTemplateById, preprocessPatternDraft, 
  normalizeContent,
  confirmReviewed,
  translatePatternDraft,
  removePatternDraft,
  updateRawContent,
  updatePatternDraftState,
  getStitchMeta,
  analyzePatternDraft,
  genPatternDraftContent,
  normalizeSuppliesInfo,
  assmblyPatternDraft} from '../../services/pattern.service'

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
  const { lang } = getQuery(event)
  const pattern = await getCrochetPattern(Number(id), lang as string)
  return useApiResponse({ pattern })
}));

// 删除 Crochet Pattern
router.post('/remove/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  await deleteCrochetPattern(Number(id))
  return useApiResponse({ status: 'ok', data: {} })
}));

// Crochet Pattern 国际化
router.post('/localize/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { lang } = getQuery(event)
  await patternLocalization(Number(id), lang as string)
  return useApiResponse({ status: 'ok', data: {} })
}));



router.post('/localize/instructions/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { lang } = getQuery(event)
  const result = await instructionsLocalization(Number(id), lang as string)
  return useApiResponse({ status: 'ok', data: result })
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

// 获取提示词模板详情 id
router.get('/prompt/id/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  const template = await getPromptTemplateById(Number(id)) 
  return useApiResponse({ template })
}));

router.post('/prompt/build', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const prompt = await buildPatternPrompt(body?.content ?? body)
  return useApiResponse({ prompt })
}));

// 获取提示词模板列表(分页)
router.get('/prompt/list', defineApiHandler(async (event) => {
  const { page = 1, pageSize = 10 } = getQuery(event)
  const result = await getPromptTemplateList(Number(page), Number(pageSize))
  return useApiResponse(result)
}));

/**
 * ======================================================================
 * Crochet Pattern Draft 统一处理路由
 * ======================================================================
 */

// 创建Crochet Pattern Draft
router.post('/draft/create', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { title, description } = body
  const draftId = await preprocessPatternDraft(title, description)
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

// 删除Crochet Pattern Draft
router.post('/draft/remove/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  await removePatternDraft(Number(id))
  return useApiResponse({ status: 'ok', data: {} })
}));

// 上传 Crochet Pattern Draft raw_content
router.post('/draft/init/upload', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id, content } = body
  const normalized = await updateRawContent(Number(id), content)
  return useApiResponse({ normalized })
}));

// 标准化Crochet Pattern Draft 内容
router.post('/draft/normalize', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body
  const normalized = await normalizeContent(Number(id))
  return useApiResponse({ normalized })
}));

// 审核Crochet Pattern Draft
router.post('/draft/analyze', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body
  await analyzePatternDraft(Number(id))
  return useApiResponse({  id: Number(id) })
}));

// getStitchMeta
router.post('/draft/stitches/meta/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  const info = await getStitchMeta(Number(id))
  return useApiResponse({ info })
}));

// 更新Crochet Pattern Draft Status - 确认人工审核
router.post('/draft/review/confirm', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id, content } = body
  await confirmReviewed(Number(id), content)
  return useApiResponse({  id: Number(id) })
}));

// 翻译Crochet Pattern Draft
router.post('/draft/translate', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body
  const prompt = await translatePatternDraft(Number(id))
  return useApiResponse({ prompt })
}));


// 生成Crochet Pattern Draft 内容
router.post('/draft/gen/text', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id, title, description } = body
  const info = await genPatternDraftContent(Number(id), title, description)
  return useApiResponse({ info })
}));

// 标准化Crochet Pattern Draft Supplies 信息
router.post('/draft/normalize/supplies', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id, supplies } = body
  const normalized = await normalizeSuppliesInfo(Number(id), supplies)
  return useApiResponse({ normalized })
}));


// assmblyPatternDraftContent
router.post('/draft/assmbly/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  const content = await assmblyPatternDraft(Number(id))
  return useApiResponse({ content })
}));


// 更新Crochet Pattern Draft State
router.post('/draft/state/update', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const { id, state } = body
  await updatePatternDraftState(Number(id), Number(state))
  return useApiResponse({  id: Number(id) })
}));

/**
 * ======================================================================
 * Crochet Pattern Testing
 * ======================================================================
 */

router.get('/testing/terms', defineApiHandler(async () => {
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


router.get('/testing/translate/:id', defineApiHandler(async (event) => {
  // 根据 ID 查询 Pattern
  const { id } = getRouterParams(event)
  const pattern = await prisma.crochetPattern.findFirst({
    where: { deleted: 0, id: Number(id) },
    select: { id: true, pattern_json: true }
  });

  // 扁平化 pattern_json 为 JSON 格式
  const json = pattern?.pattern_json

  let data: any = json;
  if (typeof data === 'string') {
    try { data = JSON.parse(data) } catch { data = null }
  }

  const includePaths = ['title','finishingTips','bonus_tips','materialsDesc']
  const items = data ? flattenForTranslation(data, { includePaths }) : []

  const titleItem = items.find((it) => it.path === 'title')
  if (titleItem) titleItem.text = 'testing title'

  const merged = data ? applyTranslations(data, items) : null
  return useApiResponse({ json: merged })
}));


export default useBase('/api/pattern', router.handler)