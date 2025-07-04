'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';
import { AuthModal } from '@/components/auth-modal';
import { PostComposer } from '@/components/post-composer';
import { PostFeed } from '@/components/post-feed';
import { UserProfile } from '@/components/user-profile';
import { LogOut } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check initial auth state
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAuthSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-600 text-white px-4 py-3">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-lg font-semibold">Wall</h1>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </Button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4 text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Wall
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Connect with friends and share what's on your mind.
          </p>
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAuthModal(true)}
          >
            Get Started
          </Button>
        </div>

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold">wall</h1>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex gap-6 p-4">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0">
          <UserProfile userId={user.id} />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Post Composer */}
          <PostComposer onPostCreated={handlePostCreated} />

          {/* Posts Feed */}
          <PostFeed refreshTrigger={refreshTrigger} />
        </main>
      </div>
    </div>
  );
}