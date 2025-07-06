'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { createPost } from '@/lib/posts';
import { supabase } from '@/lib/supabase';

interface PostComposerProps {
  onPostCreated: () => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [charactersRemaining, setCharactersRemaining] = useState(280);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleContentChange = (value: string) => {
    if (value.length <= 280) {
      setContent(value);
      setCharactersRemaining(280 - value.length);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !imageFile) || isLoading) 
      return;
    setIsLoading(true);

    try {
      console.log("Pumasok sa try block");
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        console.log("Pumasok sa if block:", fileExt, fileName);
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile);
        console.log("Pumasok ERROR:", uploadError);

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
        console.log("Image URL:", imageUrl);
      }

      await createPost(content.trim(), imageUrl); // ✅ Send image URL with post
      setContent('');
      setCharactersRemaining(280);
      setImageFile(null);
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white mb-6">
      <CardContent className="p-6">
        <div className="mb-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-20 text-base resize-none border-2 border-dashed border-gray-300 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-2">
            {charactersRemaining} characters remaining
          </p>
        </div>

        {/* Photo Upload Section */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 bg-gray-50 cursor-pointer"
          onClick={handleImageClick}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
          />
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            {imageFile ? imageFile.name : 'Click to add photo (optional)'}
          </p>
          <p className="text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
        </div>

        <Button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={( !content.trim() && !imageFile ) || isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post
        </Button>
      </CardContent>
    </Card>
  );
}
