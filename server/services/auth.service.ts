import { BasicError } from '../utils/errors';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt.util';
// 注意：现在可以不再直接导入 createError，除非在 BasicError 无法覆盖的场景下仍需使用

/**
 * 用户登录验证
 * @param email 用户邮箱
 * @param password 用户密码
 * @returns 登录成功返回包含用户对象 (不含密码) 和 token 的对象，失败则抛出错误
 * @throws BasicError 如果发生认证失败或已知错误
 */
export async function loginUser(email: string, password: string) {
  try {
    // 1. 根据邮箱查找用户
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // 2. 如果找不到用户
    if (!user) {
      // 使用错误名称抛出 BasicError，默认 statusCode 为 200
      throw new BasicError('AUTH_LOGIN_FAILED');
    }

    // 3. 检查密码是否存在 (数据完整性)
    if (!user.password) {
        // 可以指定 statusCode 为 500
        throw new BasicError('AUTH_USER_DATA_INCOMPLETE');
    }

    // 4. 比较密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // 可以指定 statusCode 为 401 (认证失败)
      throw new BasicError('AUTH_LOGIN_FAILED');
    }

    // 5. 登录成功，准备用户信息 (排除密码)

    // 6. 生成 JWT
    let token: string;
    try {
      const payload = { id: user.id, userId: user.user_id, email: user.email, name: user.name };
      token = signToken(payload);
    } catch (jwtError) {
        console.error("JWT Token generation failed:", jwtError);
        throw new BasicError('AUTH_TOKEN_GENERATION_FAILED', { statusCode: 500 });
    }

    // 7. 返回用户信息和 token
    return {
      user: { 
        id: user.id, 
        userId: user.user_id,
        email: user.email,
        name: user.name, 
        avatarUrl: user.avatar_url
      },
      token: token,
      refreshToken: user.refresh_token
    };

  } catch (error) {
    // 如果错误已经是 BasicError，直接重新抛出，让 defineApiHandler 处理
    if (error instanceof BasicError) {
        throw error;
    }

    // 处理其他意外错误 (例如数据库连接问题等)
    console.error(`用户 ${email} 登录过程中发生意外错误:`, error);
    // 将未知错误包装成 BasicError
    throw new BasicError('INTERNAL_SERVER_ERROR', { statusCode: 500 });
  }
}


/**
 * 初始化用户信息 (创建新用户)
 * @param userData 包含 email, password, name 等用户信息
 * @returns 创建成功返回用户对象 (不含密码)，失败则抛出错误
 * @throws BasicError 如果邮箱已存在或发生数据库错误
 */
export async function initUserInfo(userData: { email: string; password: string; name?: string; is_root?: boolean; status?: number }) {
  const { email, password, name, is_root = false, status = 1 } = userData;

  // 1. 检查邮箱是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    // 使用错误名称，并指定 statusCode 409 (Conflict)
    throw new BasicError('AUTH_EMAIL_REGISTERED', { statusCode: 409 });
  }

  // 2. 对密码进行哈希处理
  const saltRounds = 10;
  let hashedPassword;
  try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
  } catch (hashError) {
      console.error("Password hashing failed:", hashError);
      throw new BasicError('INTERNAL_SERVER_ERROR', { message: '密码处理失败', statusCode: 500 });
  }


  try {
    // 3. 创建新用户
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
        is_root: is_root,
        status: status,
        mobile: null,
      },
    });

    // 4. 返回新创建的用户信息 (排除密码)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    console.log(`新用户 ${email} 初始化成功`);
    return userWithoutPassword;

  } catch (error) {
    console.error(`初始化用户 ${email} 时发生错误:`, error);
    // 可以根据 Prisma 错误代码进行更细致的判断，但这里统一处理
    // 例如： if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') ...
    throw new BasicError('RESOURCE_CREATION_FAILED', { statusCode: 500 });
  }
}
 

