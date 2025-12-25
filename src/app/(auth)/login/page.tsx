'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Suspense } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials');
      } else {
        // Check role and redirect accordingly
        const session = await getSession();
        if (session?.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(from === '/dashboard' ? '/dashboard' : from);
        }
        router.refresh();
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card w-full max-w-[420px] rounded-3xl p-10 shadow-2xl animate-in fade-in-50 duration-500">
      {/* Logo/Icon - Centered at top */}
      <div className="flex justify-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
          <LogIn className="w-7 h-7 text-foreground/80" />
        </div>
      </div>

      {/* Header - Centered */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-3">Sign in with email</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Make a new doc to bring your words, data,<br />and teams together. For free
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60">
            <Mail className="w-[18px] h-[18px]" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 h-[50px] bg-secondary/40 border-0 rounded-xl placeholder:text-muted-foreground/50 text-sm focus:bg-secondary/60 transition-all"
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60">
            <Lock className="w-[18px] h-[18px]" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11 pr-11 h-[50px] bg-secondary/40 border-0 rounded-xl placeholder:text-muted-foreground/50 text-sm focus:bg-secondary/60 transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        </div>

        {/* Forgot Password - Right aligned */}
        <div className="flex justify-end pt-1">
          <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Forgot password?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mt-4">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all mt-6" 
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Get Started'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-transparent px-3 text-muted-foreground/60">Or sign in with</span>
        </div>
      </div>

      {/* Social Login Buttons - Centered, equal spacing */}
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          className="w-[52px] h-[52px] rounded-xl bg-white/60 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
        <button
          type="button"
          className="w-[52px] h-[52px] rounded-xl bg-white/60 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105 shadow-sm"
        >
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>
        <button
          type="button"
          className="w-[52px] h-[52px] rounded-xl bg-white/60 hover:bg-white/80 flex items-center justify-center transition-all hover:scale-105 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-foreground font-medium hover:underline transition-all">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="gradient-bg flex items-center justify-center min-h-screen p-4">
      <Suspense fallback={<div className="text-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
