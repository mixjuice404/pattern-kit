import { defineEventHandler, H3Event, H3Error, setResponseStatus } from 'h3'
import { useApiError } from '../utils/apiResponse' // 确保路径正确
import { BasicError } from '../utils/errors' // 导入 BasicError
import prisma from '../utils/prisma'

// 定义 API 权限配置接口
export interface ApiAuthOptions {
  roles?: string[];
  permissions?: string[];
}

// 定义我们期望的 API 处理器函数类型
type ApiHandlerLogic = (event: H3Event) => Promise<any>;

/**
 * 获取用户的角色和权限信息 (带缓存机制可后续优化)
 */
async function getUserAuthInfo(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId, deleted: 0 },
    select: { is_root: true }
  });

  if (!user) return null;
  if (user.is_root) return { isRoot: true, roles: [], permissions: [] };

  const userRoles = await prisma.userRoleRelation.findMany({
    where: { userId: userId, deleted: 0 },
    select: { roleId: true }
  });
  const roleIds = userRoles.map(r => r.roleId);

  let roles: string[] = [];
  let permissions: string[] = [];

  if (roleIds.length > 0) {
    const rolesData = await prisma.role.findMany({
      where: { id: { in: roleIds }, deleted: 0 },
      select: { name: true }
    });
    roles = rolesData.map(r => r.name);

    const rolePerms = await prisma.rolePermissionRelation.findMany({
      where: { roleId: { in: roleIds }, deleted: 0 },
      select: { permissionId: true }
    });
    const permIds = rolePerms.map(rp => rp.permissionId);

    if (permIds.length > 0) {
      const permsData = await prisma.permission.findMany({
        where: { id: { in: permIds }, deleted: 0 },
        select: { name: true }
      });
      permissions = permsData.map(p => p.name);
    }
  }

  return { isRoot: false, roles, permissions };
}

/**
 * 创建一个包裹了统一错误处理和鉴权的 H3 事件处理器。
 * @param handler 实际的 API 处理逻辑函数
 * @param options 权限配置选项
 * @returns 一个新的 H3 事件处理器
 */
export function defineApiHandler(handler: ApiHandlerLogic, options?: ApiAuthOptions) {
  return defineEventHandler(async (event: H3Event) => {
    try {
      // 1. 鉴权拦截逻辑 (如果配置了 roles 或 permissions)
      if (options && (options.roles?.length || options.permissions?.length)) {
        const userToken = event.context.user;
        if (!userToken || !userToken.id) {
          throw new BasicError('AUTH_INVALID_TOKEN', { statusCode: 401, message: '请先登录' });
        }

        // 动态查询数据库获取真实权限 (只有在需要鉴权的接口才查库)
        const authInfo = await getUserAuthInfo(userToken.id);
        
        if (!authInfo) {
          throw new BasicError('AUTH_ACCOUNT_INACTIVE', { statusCode: 401, message: '用户不存在或已被禁用' });
        }

        // ROOT 用户直接放行
        if (!authInfo.isRoot) {
          const needsRoleCheck = !!options.roles?.length;
          const needsPermCheck = !!options.permissions?.length;
          
          const rolePass = options.roles ? options.roles.some(r => authInfo.roles.includes(r)) : false;
          const permPass = options.permissions ? options.permissions.some(p => authInfo.permissions.includes(p)) : false;

          // 满足配置的任意一个条件即可 (角色匹配 OR 权限匹配)
          let passed = false;
          if (needsRoleCheck && rolePass) passed = true;
          if (needsPermCheck && permPass) passed = true;

          if (!passed) {
            throw new BasicError('AUTH_PERMISSION_DENIED', { statusCode: 403, message: '权限不足，拒绝访问' });
          }
        }
      }

      // 2. 执行传入的 API 处理逻辑
      const result = await handler(event);

      // 如果 handler 没有抛出错误并返回了结果，直接返回它
      // 可以在这里添加成功的统一响应格式，如果需要的话
      // 例如: return useApiResponse(result);
      return result;
    } catch (error: any) {

      let statusCode = 500; // 默认状态码为 200 (服务器内部错误)
      let errorCode = 9999; 
      let message = '服务器内部错误，请稍后重试';
      let errorData = undefined;

      if (error instanceof H3Error) {
        // 如果是 H3Error，使用其状态码和消息
        statusCode = error.statusCode;
        message = error.statusMessage || error.message || message;
        errorData = error.data;
        console.log(`Caught H3Error: ${statusCode} - ${message}`);
      } else if (error instanceof BasicError) {
        // 如果是 BasicError，使用其状态码和消息
        statusCode = error.statusCode;
        errorCode = error.errorCode;
        message = error.message || error.errorInfo;
        console.log(`Caught BasicError: ${statusCode} - ${message}`);
      } else if (error && typeof error === 'object' && 'statusCode' in error) {
        // 兼容其他带有 statusCode 的错误对象 (确保 error 不是 null 或 undefined)
        statusCode = error.statusCode;
        message = error.message || message;
        console.log(`Caught error with statusCode: ${statusCode} - ${message}`);
      } else if (error instanceof Error) {
         // 处理标准的 JavaScript Error，假定为系统异常
         statusCode = 500;
         message = error.message;
         console.log(`Caught standard Error (treated as business logic error): ${statusCode} - ${message}`);
      } else {
        // 处理其他未知错误类型
        console.log(`Caught unknown error type:`, error);
        // 保持 statusCode 为 500
      }

      // 设置响应的 HTTP 状态码
      setResponseStatus(event, statusCode);

      // 返回统一格式的错误响应体
      // 注意：即使 statusCode 是 200，响应体也表示一个“业务逻辑上的错误”
      return useApiError(message, errorCode, errorData);
    }
  });
}