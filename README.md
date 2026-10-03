# Animated Characters Login UI

A responsive React login screen with four animated characters. The eyes follow the pointer, react when a field receives focus, blink, and respond when the password is revealed.

This source was extracted from HPC_CRM and is designed to be copied into an existing React application. It has no UI-framework dependency; the only runtime peer dependency is React 18 or newer.

## Use in another project

Clone the public repository or download its source:

```sh
git clone https://github.com/useroneoneone/animated-characters-login-ui.git
```

Copy these files into the target project:

- `AnimatedCharactersLogin.tsx`
- `animated-characters-login.css`
- `index.ts` (optional convenience export)

The component imports its stylesheet itself. No Tailwind, shadcn/ui, Lucide, or project theme provider is required.

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

The host application owns authentication, navigation, loading state, and error handling. `onSubmit` receives `{ username, password }`. To connect the top-right theme button to your theme system, pass both `colorMode` and `onColorModeChange`; the button is hidden when the callback is omitted.

## Customization

Text, brand name, placeholders, submit labels, helper text, footer links, and light/dark colors are available as component props. Layout and character colors can be adjusted in `animated-characters-login.css`.

## License

MIT. See [LICENSE](./LICENSE).
