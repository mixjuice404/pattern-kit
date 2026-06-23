# 权限与角色管理 (Auth & RBAC) 实施路径

## 核心架构原则
- **奥卡姆剃刀**：最少代码，不引入沉重的第三方鉴权库（如 Casl 等），依靠自身轻量逻辑完成。
- **ROOT 角色特权**：通过 `is_root` 字段绕过一切校验，拥有绝对控制权。
- **配置化驱动**：API 与页面均采用“注解式”配置。

---

## 实施步骤 (Task List)

### [x] Step 1: 数据与底层核心逻辑改造
- [x] 修改 `schema.prisma`：增加 `RolePermissionRelation` 关联表。
- [x] 修改 `auth.service.ts`：登录时同步查出该用户的 `roles` 和 `permissions`，并在前端需要的 `user` 信息中返回。
- [x] 运行 `npx prisma db push` 或 `npx prisma migrate dev` 同步数据库。

### [x] Step 2: 服务端 API “注解式”鉴权拦截
- [x] 改造 `server/utils/defineApiHandler.ts`：支持接收 `{ roles?: string[], permissions?: string[] }` 参数。
- [x] 在 `defineApiHandler` 内部实现拦截逻辑（放行 ROOT，校验角色与权限）。
- [x] 编写一个测试路由以验证鉴权拦截。

### [x] Step 3: 前端页面级与组件级权限控制
- [x] 封装 `composables/useAuth.ts`，提供 `hasRole` 和 `hasPermission` 方法。
- [x] 配置 `middleware/auth.global.ts`：读取路由 `definePageMeta` 中的权限要求并拦截。
- [x] 登录后的全局状态（Pinia/Store）中妥善保存返回的 `isRoot`, `roles`, `permissions`。

### [ ] Step 4: ROOT 配置面板开发 (当前进行中)
- [ ] 建立 `/app/pages/admin` 或 `/app/pages/root` 目录。
- [ ] 开发用户列表页面：支持查看用户、封禁/解封、分配角色（API 和 UI 联动）。