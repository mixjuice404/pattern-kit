import { createRouter, useBase, readBody } from 'h3'
import { defineApiHandler } from '../../utils/defineApiHandler'
import { useApiResponse } from '../../utils/apiResponse'
import { queryMarketingNodes } from '../../services/marketing.service'



const router = createRouter()


/**
 * ======================================================================
 * 营销相关路由
 * ======================================================================
 */

/** 查询营销节点 */
router.get('/calendar/nodes', defineApiHandler(async (event) => {
  const result = await queryMarketingNodes()
  return useApiResponse({ result })
}));

export default useBase('/api/marketing', router.handler)
