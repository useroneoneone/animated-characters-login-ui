# Animated Characters Login UI

[English](./README.md)

一个可嵌入 React 项目的响应式登录界面。页面包含四个动画角色：眼睛会跟随鼠标移动，输入框聚焦时会短暂互看，角色会眨眼，也会对密码显隐做出反应。

本组件从 HPC_CRM 项目中提取。除 React 18 或更高版本外，不依赖 Tailwind、shadcn/ui、Lucide 等 UI 库，也不依赖项目自己的主题系统。

## 在其他项目中使用

克隆公开仓库：

```sh
git clone https://github.com/useroneoneone/animated-characters-login-ui.git
```

将以下文件复制到目标 React 项目：

- `AnimatedCharactersLogin.tsx`
- `animated-characters-login.css`
- `index.ts`（可选，提供统一导出入口）

组件会自行导入样式文件。将它作为登录页使用即可；如果目标项目使用 Next.js App Router，请在导入组件的页面或父组件顶部添加 `"use client"`。

## React 示例

```tsx
import { useState } from 'react';
import { AnimatedCharactersLogin, type LoginCredentials } from './components/animated-characters-login';

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin({ username, password }: LoginCredentials) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Login failed');
    } catch {
      setError('登录失败，请检查账号密码。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatedCharactersLogin
      brand="ACME CRM"
      title="欢迎回来!"
      subtitle="请输入您的账户密码登录系统"
      isLoading={loading}
      error={error}
      colorMode="dark"
      onSubmit={handleLogin}
      footerLinks={[
        { label: '隐私政策', href: '/privacy' },
        { label: '服务条款', href: '/terms' },
        { label: '联系我们', href: '/contact' },
      ]}
    />
  );
}
```

## 常用属性

| 属性 | 用途 |
| --- | --- |
| `onSubmit` | 接收 `{ username, password }`，由宿主项目连接登录接口 |
| `isLoading`、`error` | 显示登录加载状态和错误信息 |
| `brand`、`title`、`subtitle` | 设置品牌名、标题和说明文字 |
| `usernameLabel`、`usernamePlaceholder` | 设置账号字段文案 |
| `passwordLabel`、`passwordPlaceholder` | 设置密码字段文案 |
| `submitLabel`、`loadingLabel` | 设置提交按钮和加载时文案 |
| `helperText` | 在表单下方显示可选说明文字 |
| `footerLinks` | 设置左侧面板的链接，格式为 `{ label, href }[]` |
| `colorMode`、`onColorModeChange` | 连接宿主项目的浅色/深色主题；不传回调时隐藏右上角切换按钮 |

认证请求、令牌保存、错误处理和登录成功后的跳转都由宿主项目负责。桌面布局显示角色面板；较窄屏幕会收起该面板，为表单留出空间。可在 `animated-characters-login.css` 中调整布局和角色颜色。

## 许可

[MIT](./LICENSE)
