import { createRouter, useBase, readBody } from 'h3'
import { defineApiHandler } from '../../utils/defineApiHandler'
import { useApiResponse } from '../../utils/apiResponse'
import { createOrUpdateCrochetPattern, 
  getCrochetPatternList, getCrochetPattern, deleteCrochetPattern, 
  createOrUpdatePromptTemplate, getPromptTemplateByAlias } from '../../services/pattern.service'

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
  console.log(`收到请求:`, body)
  const { id, ...data } = body
  const patternId = await createOrUpdateCrochetPattern(id, data)
  return useApiResponse({  id: patternId })
}));

// 获取Crochet Pattern列表
router.get('/list', defineApiHandler(async (event) => {
  const patterns = await getCrochetPatternList()
  return useApiResponse(patterns)
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
  console.log(`收到请求:`, body)
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



export default useBase('/api/pattern', router.handler)