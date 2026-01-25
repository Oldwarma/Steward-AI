# BetterAuth 配置说明

## 数据库配置

项目已配置为使用 MySQL 数据库。

### 数据库连接信息
- **Host**: localhost
- **Port**: 3306
- **User**: user
- **Password**: 123456789
- **Database**: steward_ai

### 环境变量配置

创建 `.env` 文件（在 `steward-ai` 目录下），添加以下内容：

```env
# Database
DATABASE_URL="mysql://root:123456789@localhost:3306/steward_ai"

# BetterAuth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-key-here-change-this-in-production"

# GitHub OAuth
GITHUB_CLIENT_ID="Ov23limQ7DSlKouk6WBi"
GITHUB_CLIENT_SECRET="85c1ccac0ff6153b1bb2ab5221854a0651a363eb"
```

## GitHub OAuth 配置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息：
   - **Application name**: Steward AI
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. 创建后，复制 **Client ID** 和 **Client Secret** 到 `.env` 文件

## 初始化数据库

运行以下命令创建数据库表：

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma db push

# 或者使用迁移（推荐生产环境）
npx prisma migrate dev --name init
```

## 使用说明

1. 确保 MySQL 数据库已启动
2. 确保数据库 `steward_ai` 已创建
3. 配置 `.env` 文件
4. 运行数据库迁移
5. 启动开发服务器：`npm run dev`
6. 访问 http://localhost:3000/login 进行登录

## 登录流程

1. 用户访问受保护的路由时，会被重定向到 `/login`
2. 点击 "Sign in with GitHub" 按钮
3. 跳转到 GitHub 授权页面
4. 授权后返回应用，完成登录

## 客户端使用

在组件中使用认证状态：

```typescript
import { useSession, signOut } from "@/lib/auth-client";

export function MyComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session?.user) return <div>Not logged in</div>;
  
  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## 环境变量说明

- `DATABASE_URL`: MySQL 数据库连接字符串
- `BETTER_AUTH_URL`: BetterAuth 基础 URL（开发环境通常是 http://localhost:3000）
- `BETTER_AUTH_SECRET`: BetterAuth 加密密钥（用于签名 session token，生产环境请使用强随机字符串）
- `GITHUB_CLIENT_ID`: GitHub OAuth App 的 Client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App 的 Client Secret

**注意**: 生产环境请确保 `BETTER_AUTH_SECRET` 是足够长的随机字符串，可以使用以下命令生成：

```bash
openssl rand -base64 32
```
