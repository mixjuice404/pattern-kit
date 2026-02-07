import { createRouter, useBase, readBody } from 'h3'
import { defineApiHandler } from '../../utils/defineApiHandler'
import { useApiResponse } from '../../utils/apiResponse'
import { addStitchLanguage, 
  deleteStitchLanguage, queryStitchLanguages, importStitchLocalizations,
  importStitches, getStitchList, getStitchDetail, createOrUpdateStitch, deleteStitch, 
  getSimpleStitchSections, getStitchesByLanguage,
  getStitchNamesAndAbbrevs} from '~~/server/services/stitch.service'

const router = createRouter()


/**
 * ======================================================================
 * Stitch Pattern Prompt 统一处理路由
 * ======================================================================
 */

/** 查询所有 StitchLanguage */
router.get('/stitch/language', defineApiHandler(async (event) => {
  const result = await queryStitchLanguages()
  return useApiResponse({ result })
}));

/** 移除 StitchLanguage */
router.delete('/stitch/language/:code', defineApiHandler(async (event) => {
  const { code } = getRouterParams(event)
  const result = await deleteStitchLanguage(code)
  return useApiResponse({ result })
}));

/** 添加 StitchLanguage */
router.post('/stitch/language', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const result = await addStitchLanguage(body.languageCode, body.flag, body.name)
  return useApiResponse({ result })
}));

/**
 * ======================================================================
 * Stitch Dictionary 统一处理路由
 * - 批量导入 stitch
 * - 删除 stitch
 * - 查询 stitch list
 * - 查询 stitch detail
 * - 添加 stitch
 * - 更新 stitch
 * - 删除 stitch
 * ======================================================================
 */

// 批量导入 stitch
router.post('/stitch/import', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const result = await importStitches(body)
  return useApiResponse({ result })
}));

// importStitchLocalizations
router.post('/stitch/localize/import', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const result = await importStitchLocalizations(body)
  return useApiResponse({ result })
}));


// 查询 stitch list
router.get('/stitch/list', defineApiHandler(async (event) => {
  const query = getQuery(event);
  const { page = 1, pageSize = 20 } = getQuery(event)
  const result = await getStitchList({
    page: Number(page),
    pageSize: Number(pageSize),
    defaultName: query.keyword as string | null,
    type: query.type as string || ''
  })
  return useApiResponse({ result })
}));

// 查询 stitch detail
router.get('/stitch/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  const result = await getStitchDetail(Number(id))
  return useApiResponse({ result })
}));

// 创建或编辑 stitch
router.post('/stitch', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const result = await createOrUpdateStitch(body.id, body)
  return useApiResponse({ result })
}));

// 删除 stitch
router.delete('/stitch/:id', defineApiHandler(async (event) => {
  const { id } = getRouterParams(event)
  const result = await deleteStitch(Number(id))
  return useApiResponse({ result })
}));

// 查询所有 simple stitch 
router.get('/stitch/sections', defineApiHandler(async (event) => {
  const query = getQuery(event);
  const languageCode = query.languageCode as string | null
  const result = await getSimpleStitchSections(languageCode || '')
  return useApiResponse({ result })
}));

// 查询所有 Stitch 对应的 name 和 abbrev
router.get('/stitch/names', defineApiHandler(async (event) => {
  const query = getQuery(event);
  const languageCode = query.languageCode as string | null
  const result = await getStitchNamesAndAbbrevs(languageCode || '')
  return useApiResponse({ data: result })
}));

// 查询所有 Stitch
router.get('/stitch/localize/list', defineApiHandler(async (event) => {
  const query = getQuery(event);
  const languageCode = query.languageCode as string | null
  const result = await getStitchesByLanguage(languageCode || '')
  return useApiResponse({ data: result })
}));

export default useBase('/api/dict', router.handler)