import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken'; // 导入类型
import ms from 'ms'; // 引入 ms 库

// 从环境变量读取 JWT 配置
const JWT_SECRET = process.env.NUXT_JWT_SECRET as string;
const JWT_EXPIRES_IN_STRING = process.env.NUXT_JWT_EXPIRES_IN as string;

// 默认过期时间（秒）
const DEFAULT_JWT_EXPIRES_IN_STRING = '15d'; // 15 days

// 启动时检查 JWT_SECRET 是否已设置
if (!JWT_SECRET) {
  const errorMessage = "错误：NUXT_JWT_SECRET 环境变量未设置，或未在 runtimeConfig 中正确配置。请在 .env 文件中定义 NUXT_JWT_SECRET 并确保 Nuxt 可以访问它。";
  console.error(errorMessage);
  // 在服务器启动关键配置缺失时抛出错误是合理的
  throw new Error(errorMessage);
}

// 解析过期时间
let expiresIn: string = JWT_EXPIRES_IN_STRING || DEFAULT_JWT_EXPIRES_IN_STRING;

/**
 * 生成 JWT Token
 * @param payload 要包含在 token 中的数据对象
 * @returns 生成的 JWT 字符串
 * @throws Error 如果 JWT 签名失败
 */
export function signToken(payload: object): string {
  try {
    // 显式声明 secretKey 类型为 string
    const secretKey: string = JWT_SECRET!;
    return jwt.sign(payload, secretKey, { expiresIn: timeStringToSeconds(expiresIn) });
  } catch (error) {
    console.error("JWT 签名失败:", error);
    // 可以抛出更具体的错误或包装原始错误
    throw new Error("无法生成 Token");
  }
}

/**
 * 验证 JWT Token 并解码
 * @param token 要验证的 JWT 字符串
 * @returns 解码后的 payload 对象 (JwtPayload & T) 或 null (如果验证失败)
 */
export function verifyToken<T extends object = object>(token: string): (JwtPayload & T) | null {
  try {
    // 显式声明 secretKey 类型为 string
    const secretKey: string = JWT_SECRET!;
    // 验证 token 并指定返回类型
    const decoded = jwt.verify(token, secretKey) as JwtPayload & T;
    return decoded;
  } catch (error) {
    // 处理常见的验证错误（例如过期、签名无效）
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Token 已过期:", error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log("无效的 Token:", error.message);
    } else {
      console.error("Token 验证时发生未知错误:", error);
    }
    return null; // 验证失败返回 null
  }
}


// --- 时间字符串转秒数函数 ---
/**
 * 将时间字符串（如 '1h', '7d', '3600'）转换为秒数
 * @param timeStr 时间字符串
 * @returns 对应的秒数 (number)，如果无法解析则返回 undefined
 */
export function timeStringToSeconds(timeStr: string): number | undefined {
  if (!timeStr) {
    return undefined;
  }

  // 1. 尝试直接解析为数字（表示秒数）
  const secondsAsNumber = parseInt(timeStr, 10);
  if (!isNaN(secondsAsNumber) && String(secondsAsNumber) === timeStr) {
    return secondsAsNumber;
  }

  // 2. 尝试使用 ms 库解析带单位的字符串
  try {
    const milliseconds = ms(timeStr as any);
    if (typeof milliseconds === 'number') { // ms 返回 number 或 undefined
      return Math.floor(milliseconds / 1000); // 转换为秒
    }
  } catch (error) {
    // ms 库解析失败，忽略错误，继续返回 undefined
    console.warn(`无法使用 ms 解析时间字符串: ${timeStr}`, error);
  }

  // 3. 如果都无法解析，返回 undefined
  console.warn(`无法将时间字符串 '${timeStr}' 转换为秒数`);
  return undefined;
}
