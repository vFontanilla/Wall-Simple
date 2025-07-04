'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfile } from '@/lib/auth';

interface UserProfileProps {
  userId: string;
}

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  networks: string[] | null;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Profile not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        {/* Profile Section */}
        <div className="text-center mb-6">
          <Avatar className="w-32 h-32 mx-auto mb-4">
            <AvatarImage 
              src={profile.avatar_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'} 
              alt={profile.full_name || 'User'} 
            />
            <AvatarFallback className="text-2xl">
              {(profile.full_name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {profile.full_name || 'Anonymous User'}
          </h2>
          <p className="text-gray-600 text-sm">
            {profile.username || 'wall'}
          </p>
        </div>

        {/* Information Button */}
        <Button variant="secondary" className="w-full mb-6 text-sm">
          Information
        </Button>

        {/* Networks */}
        {profile.networks && profile.networks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Networks</h3>
            {profile.networks.map((network, index) => (
              <p key={index} className="text-sm text-blue-600">{network}</p>
            ))}
          </div>
        )}

        {/* Current City */}
        {profile.location && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current City</h3>
            <p className="text-sm text-gray-600">{profile.location}</p>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
            <p className="text-sm text-gray-600">{profile.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}