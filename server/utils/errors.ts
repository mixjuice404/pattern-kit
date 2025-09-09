import { ERROR_DEFINITIONS } from '../constants/errorDefinitions'; // 导入值
import type { ErrorCodeName } from '../constants/errorDefinitions'; // 使用 'import type' 导入类型

/**
 * 自定义基础错误类，用于表示业务逻辑或可预期的错误。
 * 基于预定义的错误代码和信息创建。
 */
export class BasicError extends Error {
  public readonly statusCode: number; // HTTP 状态码或业务状态码
  public readonly errorCode: number;  // 内部数字错误代码
  public readonly errorInfo: string;  // 错误的默认描述信息

  /**
   * 创建 BasicError 实例。
   * @param errorCodeName - 错误的名称 (从 ERROR_DEFINITIONS 的键中选择)。
   * @param override - 可选对象，用于覆盖默认的 message 或 statusCode。
   *                   - message: 自定义的用户可读错误信息，如果未提供，则使用 errorInfo。
   *                   - statusCode: 自定义的 HTTP 状态码或业务状态码，如果未提供，默认为 200。
   */
  constructor(errorCodeName: ErrorCodeName, override?: { message?: string, statusCode?: number }) {
    const definition = ERROR_DEFINITIONS[errorCodeName];
    if (!definition) {
      // 处理未找到错误定义的情况，虽然类型系统应该能防止这种情况
      console.error(`Error definition not found for key: ${errorCodeName}`);
      const fallbackDefinition = ERROR_DEFINITIONS.UNKNOWN_ERROR;
      super(fallbackDefinition.info);
      this.name = 'BasicError';
      this.statusCode = 500;
      this.errorCode = fallbackDefinition.code;
      this.errorInfo = fallbackDefinition.info;
    } else {
      const message = override?.message || definition.info;
      // 默认 statusCode 为 200，除非在 override 中指定
      const statusCode = override?.statusCode !== undefined ? override.statusCode : 200;

      super(message); // 设置 Error 的 message
      this.name = 'BasicError'; // 错误名称
      this.statusCode = statusCode; // 存储状态码
      this.errorCode = definition.code; // 存储数字错误代码
      this.errorInfo = definition.info; // 存储默认描述信息
    }

    // 确保 instanceof 操作符能正确识别此类的实例
    Object.setPrototypeOf(this, BasicError.prototype);
  }
}

// --- 使用示例 ---

// function someFunction(input: any) {
//   if (!input) {
//     // 抛出一个业务逻辑错误，使用默认的 statusCode 200
//     throw new BasicError('输入不能为空', 'INPUT_REQUIRED');
//   }
//   if (input.value > 100) {
//     // 抛出一个带有特定业务状态码（例如 400 Bad Request）的错误
//     throw new BasicError('输入值不能超过100', 'INPUT_VALUE_TOO_HIGH', 400);
//   }
//   // ... 其他逻辑
// }

// --- 在你的服务中使用 ---
/*
import { BasicError } from '~/server/utils/errors'; // 导入自定义错误

export async function loginUser(email: string, password: string) {
  try {
    // ...
    if (!user) {
      // 使用 BasicError 替代 createError
      throw new BasicError('邮箱或密码错误', 'AUTH_LOGIN_FAILED'); // statusCode 默认为 200
    }
    // ...
    if (!isPasswordValid) {
      // 可以根据需要指定不同的 statusCode
      throw new BasicError('邮箱或密码错误', 'AUTH_LOGIN_FAILED', 401); // 使用 401 表示认证失败
    }
    // ...
  } catch (error) {
    if (error instanceof BasicError || error instanceof H3Error) { // 捕获自定义错误和 H3Error
        throw error; // 重新抛出，让 defineApiHandler 处理
    }
    // ... 处理其他未知错误 ...
    console.error(`用户 ${email} 登录过程中发生意外错误:`, error);
    throw new BasicError('登录过程中发生服务器错误', 'INTERNAL_SERVER_ERROR', 500); // 使用 BasicError 包装未知错误
  }
}
*/