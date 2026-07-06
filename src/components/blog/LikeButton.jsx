import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPostLikeCount, hasUserLikedPost, toggleLike } from '../../lib/api';

export default function LikeButton({ postId, onCountChange }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!postId) return;
    getPostLikeCount(postId).then((c) => {
      setCount(c);
      onCountChange?.(c);
    });
    if (user) {
      hasUserLikedPost(postId, user.id).then(setLiked);
    }
  }, [postId, user]);

  const handleToggle = async () => {
    if (!user) return;
    setAnimating(true);
    try {
      const nowLiked = await toggleLike(postId, user.id);
      setLiked(nowLiked);
      const newCount = count + (nowLiked ? 1 : -1);
      setCount(newCount);
      onCountChange?.(newCount);
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={!user}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        liked
          ? 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 hover:text-pink-500'
      } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={!user ? 'Sign in to like this post' : liked ? 'Unlike' : 'Like'}
    >
      <Heart
        size={18}
        className={`transition-transform duration-300 ${animating ? 'scale-125' : 'scale-100'} ${liked ? 'fill-pink-500 text-pink-500' : ''}`}
      />
      <span>{count}</span>
    </button>
  );
}
