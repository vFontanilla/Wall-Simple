'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Heart } from 'lucide-react';
import { getPosts, type Post } from '@/lib/posts';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface PostFeedProps {
  refreshTrigger: number;
}

export function PostFeed({ refreshTrigger }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [refreshTrigger]);

  useEffect(() => {
    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={post.profiles.avatar_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'} 
                  alt={post.profiles.full_name || 'User'} 
                />
                <AvatarFallback>
                  {(post.profiles.full_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {post.profiles.full_name || 'Anonymous User'}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(post.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                
                {post.image_url && (
                  <div className="mt-3">
                    <img 
                      src={post.image_url} 
                      alt="Post image" 
                      className="rounded-lg max-w-full h-auto"
                    />
                  </div>
                )}
                
                {/* Post Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {posts.length === 0 && (
        <Card className="bg-white">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}