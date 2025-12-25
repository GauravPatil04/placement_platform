'use client';

import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="lg:hidden">
        <span className="text-lg font-bold text-foreground">
          Aivalytics
        </span>
      </div>
      
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold text-foreground">
          Welcome back, <span className="text-foreground/70">{user.name?.split(' ')[0]}</span>!
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          
          {/* User Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm">
            {user.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
          </div>
        </div>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => signOut()}
          className="hover:bg-muted rounded-lg transition-all duration-200 w-9 h-9 sm:w-10 sm:h-10"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </header>
  );
}
