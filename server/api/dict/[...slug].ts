import { createRouter, useBase, readBody } from 'h3'
import { defineApiHandler } from '../../utils/defineApiHandler'
import { useApiResponse } from '../../utils/apiResponse'
import { addStitchLanguage, deleteStitchLanguage, queryStitchLanguages, importStitches } from '~~/server/services/stitch.service'

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
router.get('/stitch/language/:code', defineApiHandler(async (event) => {
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


// 批量导入 stitch
router.post('/stitch/import', defineApiHandler(async (event) => {
  const body = await readBody(event)
  const result = await importStitches(body)
  return useApiResponse({ result })
}));





export default useBase('/api/dict', router.handler)