import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import './animated-characters-login.css';

export type LoginFooterLink = {
  label: string;
  href: string;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export interface AnimatedCharactersLoginProps {
  /** Called after client-side required-field validation succeeds. */
  onSubmit: (credentials: LoginCredentials) => Promise<void> | void;
  /** Lets the host application own the request state. */
  isLoading?: boolean;
  /** Error text returned by the host application. */
  error?: string;
  brand?: string;
  title?: string;
  subtitle?: string;
  usernameLabel?: string;
  usernamePlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  submitLabel?: string;
  loadingLabel?: string;
  helperText?: string;
  footerLinks?: LoginFooterLink[];
  /** The component stays self-contained; the host can connect this to its own theme store. */
  colorMode?: 'light' | 'dark';
  onColorModeChange?: (colorMode: 'light' | 'dark') => void;
}

type Point = { x: number; y: number };
type CharacterPosition = { faceX: number; faceY: number; bodySkew: number };

function useBlink() {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let blinkTimer: number | undefined;
    let openTimer: number | undefined;
    let disposed = false;

    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        if (disposed) return;
        setIsBlinking(true);
        openTimer = window.setTimeout(() => {
          if (disposed) return;
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, 3000 + Math.random() * 4000);
    };

    scheduleBlink();
    return () => {
      disposed = true;
      if (blinkTimer) window.clearTimeout(blinkTimer);
      if (openTimer) window.clearTimeout(openTimer);
    };
  }, []);

  return isBlinking;
}

function SparkleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9L12 3Z" />
      <path d="m19 16-.7 1.8L16.5 18.5l1.8.7L19 21l.7-1.8 1.8-.7-1.8-.7L19 16Z" />
    </svg>
  );
}

function EyeIcon({ closed }: { closed: boolean }) {
  return closed ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m3 3 18 18" />
      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
      <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9.3 5.1 9.8 5.9a.2.2 0 0 1 0 .2 18.6 18.6 0 0 1-3 3.5" />
      <path d="M6.2 6.2A18.5 18.5 0 0 0 2.2 10a.2.2 0 0 0 0 .2C2.7 11 6.5 16 12 16c.8 0 1.6-.1 2.3-.3" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.2 12s3.6-6 9.8-6 9.8 6 9.8 6-3.6 6-9.8 6-9.8-6-9.8-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function ThemeIcon({ mode }: { mode: 'light' | 'dark' }) {
  return mode === 'dark' ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A8.4 8.4 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z" />
    </svg>
  );
}

function CharacterEye({ size, pupilSize, maxDistance, blink, pointer, forceLookX, forceLookY }: {
  size: number;
  pupilSize: number;
  maxDistance: number;
  blink: boolean;
  pointer: Point;
  forceLookX?: number;
  forceLookY?: number;
}) {
  const eyeRef = useRef<HTMLSpanElement>(null);
  let lookX = forceLookX;
  let lookY = forceLookY;

  if (lookX === undefined || lookY === undefined) {
    const rect = eyeRef.current?.getBoundingClientRect();
    if (rect) {
      const deltaX = pointer.x - (rect.left + rect.width / 2);
      const deltaY = pointer.y - (rect.top + rect.height / 2);
      const distance = Math.min(Math.hypot(deltaX, deltaY), maxDistance);
      const angle = Math.atan2(deltaY, deltaX);
      lookX = Math.cos(angle) * distance;
      lookY = Math.sin(angle) * distance;
    } else {
      lookX = 0;
      lookY = 0;
    }
  }

  return (
    <span ref={eyeRef} className={blink ? 'acl-eye acl-eye--blink' : 'acl-eye'} style={{ width: size, height: blink ? 2 : size }}>
      {!blink && <span className="acl-pupil" style={{ width: pupilSize, height: pupilSize, transform: `translate(${lookX}px, ${lookY}px)` }} />}
    </span>
  );
}

function CharacterEyes({ size, pupilSize, maxDistance, blink, pointer, forceLookX, forceLookY }: {
  size: number;
  pupilSize: number;
  maxDistance: number;
  blink: boolean;
  pointer: Point;
  forceLookX?: number;
  forceLookY?: number;
}) {
  return (
    <div className="acl-eyes" aria-hidden="true">
      {[0, 1].map((eye) => (
        <CharacterEye
          key={eye}
          size={size}
          pupilSize={pupilSize}
          maxDistance={maxDistance}
          blink={blink}
          pointer={pointer}
          forceLookX={forceLookX}
          forceLookY={forceLookY}
        />
      ))}
    </div>
  );
}

function CharacterScene({ isTyping, hasPassword, showPassword }: { isTyping: boolean; hasPassword: boolean; showPassword: boolean }) {
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const purpleBlink = useBlink();
  const blackBlink = useBlink();
  const [pointer, setPointer] = useState<Point>({ x: 0, y: 0 });
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPointer({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isTyping) {
      setIsLookingAtEachOther(false);
      return;
    }

    setIsLookingAtEachOther(true);
    const timer = window.setTimeout(() => setIsLookingAtEachOther(false), 800);
    return () => window.clearTimeout(timer);
  }, [isTyping]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement>): CharacterPosition => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const deltaX = pointer.x - (rect.left + rect.width / 2);
    const deltaY = pointer.y - (rect.top + rect.height / 3);
    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
    };
  };

  const purple = calculatePosition(purpleRef);
  const black = calculatePosition(blackRef);
  const orange = calculatePosition(orangeRef);
  const yellow = calculatePosition(yellowRef);
  const isLookingAtCharacters = isLookingAtEachOther;
  const isPasswordHidden = hasPassword && !showPassword;
  const isPasswordVisible = hasPassword && showPassword;

  useEffect(() => {
    if (!isPasswordVisible) {
      setIsPeeking(false);
      return;
    }

    let peekTimer: number | undefined;
    let closeTimer: number | undefined;
    let disposed = false;
    const schedulePeek = () => {
      peekTimer = window.setTimeout(() => {
        if (disposed) return;
        setIsPeeking(true);
        closeTimer = window.setTimeout(() => {
          if (disposed) return;
          setIsPeeking(false);
          schedulePeek();
        }, 800);
      }, 2000 + Math.random() * 3000);
    };
    schedulePeek();
    return () => {
      disposed = true;
      if (peekTimer) window.clearTimeout(peekTimer);
      if (closeTimer) window.clearTimeout(closeTimer);
    };
  }, [isPasswordVisible]);

  return (
    <div className="acl-character-stage" aria-hidden="true">
      <div className="acl-character-canvas">
        <div
          ref={purpleRef}
          className="acl-character acl-character--purple"
          style={{
            height: isTyping || isPasswordHidden ? 440 : 400,
            transform: isPasswordVisible ? 'skewX(0deg)' : isTyping || isPasswordHidden ? `skewX(${purple.bodySkew - 12}deg) translateX(40px)` : `skewX(${purple.bodySkew}deg)`,
          }}
        >
          <div className="acl-face acl-face--purple" style={{ left: isPasswordVisible ? 20 : isLookingAtCharacters ? 55 : 45 + purple.faceX, top: isPasswordVisible ? 35 : isLookingAtCharacters ? 65 : 40 + purple.faceY }}>
            <CharacterEyes
              size={18}
              pupilSize={7}
              maxDistance={5}
              blink={purpleBlink}
              pointer={pointer}
              forceLookX={isPasswordVisible ? isPeeking ? 4 : -4 : isLookingAtCharacters ? 3 : undefined}
              forceLookY={isPasswordVisible ? isPeeking ? 5 : -4 : isLookingAtCharacters ? 4 : undefined}
            />
          </div>
        </div>

        <div
          ref={blackRef}
          className="acl-character acl-character--black"
          style={{
            transform: isPasswordVisible ? 'skewX(0deg)' : isLookingAtCharacters ? `skewX(${black.bodySkew * 1.5 + 10}deg) translateX(20px)` : isTyping || isPasswordHidden ? `skewX(${black.bodySkew * 1.5}deg)` : `skewX(${black.bodySkew}deg)`,
          }}
        >
          <div className="acl-face acl-face--black" style={{ left: isPasswordVisible ? 10 : isLookingAtCharacters ? 32 : 26 + black.faceX, top: isPasswordVisible ? 28 : isLookingAtCharacters ? 12 : 32 + black.faceY }}>
            <CharacterEyes
              size={16}
              pupilSize={6}
              maxDistance={4}
              blink={blackBlink}
              pointer={pointer}
              forceLookX={isPasswordVisible ? -4 : isLookingAtCharacters ? 0 : undefined}
              forceLookY={isPasswordVisible ? -4 : isLookingAtCharacters ? -4 : undefined}
            />
          </div>
        </div>

        <div ref={orangeRef} className="acl-character acl-character--orange" style={{ transform: isPasswordVisible ? 'skewX(0deg)' : `skewX(${orange.bodySkew}deg)` }}>
          <div className="acl-face acl-face--orange" style={{ left: isPasswordVisible ? 50 : 82 + orange.faceX, top: isPasswordVisible ? 85 : 90 + orange.faceY }}>
            <CharacterEyes size={12} pupilSize={12} maxDistance={5} blink={false} pointer={pointer} forceLookX={isPasswordVisible ? -5 : undefined} forceLookY={isPasswordVisible ? -4 : undefined} />
          </div>
        </div>

        <div ref={yellowRef} className="acl-character acl-character--yellow" style={{ transform: isPasswordVisible ? 'skewX(0deg)' : `skewX(${yellow.bodySkew}deg)` }}>
          <div className="acl-face acl-face--yellow" style={{ left: isPasswordVisible ? 20 : 52 + yellow.faceX, top: isPasswordVisible ? 35 : 40 + yellow.faceY }}>
            <CharacterEyes size={12} pupilSize={12} maxDistance={5} blink={false} pointer={pointer} forceLookX={isPasswordVisible ? -5 : undefined} forceLookY={isPasswordVisible ? -4 : undefined} />
          </div>
          <span className="acl-mouth" style={{ left: isPasswordVisible ? 10 : 40 + yellow.faceX, top: isPasswordVisible ? 88 : 88 + yellow.faceY }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Portable, dependency-free (apart from React) version of this project's login UI.
 * Copy this file and animated-characters-login.css together into another React project.
 */
export function AnimatedCharactersLogin({
  onSubmit,
  isLoading = false,
  error,
  brand = 'HPC_CRM',
  title = '欢迎回来!',
  subtitle = '请输入您的账户密码登录系统',
  usernameLabel = '账号',
  usernamePlaceholder = 'admin',
  passwordLabel = '密码',
  passwordPlaceholder = '••••••••',
  submitLabel = '登 录',
  loadingLabel = '登录中...',
  helperText,
  footerLinks = [],
  colorMode = 'dark',
  onColorModeChange,
}: AnimatedCharactersLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [localError, setLocalError] = useState('');

  const resolvedError = error || localError;
  const nextColorMode = colorMode === 'dark' ? 'light' : 'dark';
  const rootClassName = useMemo(() => `acl-login acl-login--${colorMode}`, [colorMode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError('');
    try {
      await onSubmit({ username, password });
    } catch {
      setLocalError('登录请求未完成，请稍后重试。');
    }
  };

  return (
    <main className={rootClassName}>
      {onColorModeChange && (
        <button className="acl-theme-toggle" type="button" onClick={() => onColorModeChange(nextColorMode)} aria-label={`切换到${nextColorMode === 'dark' ? '深色' : '浅色'}模式`} title="切换颜色模式">
          <ThemeIcon mode={colorMode} />
        </button>
      )}

      <aside className="acl-visual-panel">
        <div className="acl-brand acl-brand--light">
          <span className="acl-brand-mark"><SparkleIcon /></span>
          <span>{brand}</span>
        </div>
        <CharacterScene isTyping={focusedField !== null} hasPassword={password.length > 0} showPassword={showPassword} />
        {footerLinks.length > 0 && (
          <nav className="acl-footer-links" aria-label="登录页链接">
            {footerLinks.map((link) => <a href={link.href} key={`${link.label}-${link.href}`}>{link.label}</a>)}
          </nav>
        )}
      </aside>

      <section className="acl-form-panel" aria-label="登录">
        <div className="acl-form-shell">
          <div className="acl-brand acl-brand--mobile">
            <span className="acl-brand-mark"><SparkleIcon /></span>
            <span>{brand}</span>
          </div>

          <header className="acl-form-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>

          <form className="acl-form" onSubmit={handleSubmit}>
            <label className="acl-field">
              <span>{usernameLabel}</span>
              <input
                type="text"
                value={username}
                placeholder={usernamePlaceholder}
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </label>

            <label className="acl-field">
              <span>{passwordLabel}</span>
              <span className="acl-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder={passwordPlaceholder}
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button type="button" className="acl-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? '隐藏密码' : '显示密码'}>
                  <EyeIcon closed={showPassword} />
                </button>
              </span>
            </label>

            {resolvedError && <p className="acl-error" role="alert">{resolvedError}</p>}

            <button className="acl-submit" type="submit" disabled={isLoading}>
              {isLoading ? loadingLabel : submitLabel}
            </button>
          </form>

          {helperText && <p className="acl-helper-text">{helperText}</p>}
        </div>
      </section>
    </main>
  );
}
