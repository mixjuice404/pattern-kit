// server/plugins/init.ts
import type { NitroApp } from 'nitropack'
// 导入 Prisma Client 和初始化用户函数
import prisma from '../utils/prisma'
import { initUserInfo } from '../services/auth.service' // 确保路径正确
import crypto from 'crypto' // 用于生成随机密码

// Nitro 插件导出默认函数
export default async function (nitroApp: NitroApp) {
    console.log('Nitro plugin: Running initialization tasks...');

    try {
      // 执行初始化数据函数
      await initData();
      console.log('Nitro plugin: Initialization tasks completed.');

    } catch (error) {
      console.error('Nitro plugin: Initialization failed:', error);
      throw error; // 抛出错误以阻止服务器启动（如果需要）
    }
}

// 初始化数据函数
async function initData(): Promise<void> {
    try {
        // 1. 检查是否存在 is_root = true 的用户
        const rootUserExists = await prisma.user.findFirst({
            where: {
                is_root: true,
            },
        });
        // 2. 如果 root 用户已存在，则跳过
        if (rootUserExists) {
            return;
        }
        // 3. 如果 root 用户不存在，则初始化
        const rootEmail = 'mixjuice404@gmail.com';
        // 生成一个随机密码 (示例：12位随机字符串)
        const generatedPassword = crypto.randomBytes(9).toString('base64'); // 生成12个字符长度的Base64密码

        // 调用初始化用户服务函数
        await initUserInfo({
            email: rootEmail,
            password: generatedPassword,
            name: 'Root Admin', // 可以给一个默认名字
            is_root: true,
            status: 1, // 假设 1 代表激活状态
        });

        // 4. 在控制台打印重要提示和生成的密码
        console.log('============================================================');
        console.log('IMPORTANT: Root user initialized!');
        console.log(`Email: ${rootEmail}`);
        console.log(`Generated Password: ${generatedPassword}`);
        console.log('Please change this password immediately after first login.');
        console.log('============================================================');

    } catch (error) {
        console.error('Error during data initialization:', error);
        throw new Error('Failed to initialize data.');
    }
}


