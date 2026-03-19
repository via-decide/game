import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, LogOut, Grid, Bookmark, Heart, MapPin, Link as LinkIcon, Calendar, Users } from 'lucide-react';
import { UserProfile } from '../types';
import EditProfileModal from './EditProfileModal';
import FollowListModal from './FollowListModal';

interface ProfileViewProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateProfile: (updatedProfile: Partial<UserProfile>) => Promise<void>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-br from-via-accent/40 to-via-gold/20">
        <div className="absolute top-6 right-6 flex gap-3">
          <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-colors">
            <Settings size={20} />
          </button>
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="flex items-end justify-between mb-6">
          <div className="w-24 h-24 rounded-3xl glass-panel flex items-center justify-center text-5xl border-4 border-via-dark shadow-2xl">
            {user.avatarEmoji}
          </div>
          <div className="flex gap-3 mb-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-6 py-2 rounded-xl bg-via-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-via-accent/80 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <h1 className="font-syne font-bold text-3xl tracking-tight">{user.displayName}</h1>
          <p className="text-white/40 text-sm font-medium">@{user.username}</p>
          <p className="text-sm text-white/80 leading-relaxed max-w-md">
            {user.bio}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-8">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{user.city || 'Bharat'}</span>
          </div>
          <div className="flex items-center gap-1">
            <LinkIcon size={12} />
            <span className="text-via-accent">via.decide.com</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="glass-panel p-4 rounded-2xl text-center">
            <div className="text-xl font-syne font-bold mb-1">{(user.credits / 1000).toFixed(1)}K</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Credits</div>
          </div>
          <button 
            onClick={() => setFollowModalType('followers')}
            className="glass-panel p-4 rounded-2xl text-center hover:bg-white/5 transition-colors"
          >
            <div className="text-xl font-syne font-bold mb-1">{user.followers}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Followers</div>
          </button>
          <button 
            onClick={() => setFollowModalType('following')}
            className="glass-panel p-4 rounded-2xl text-center hover:bg-white/5 transition-colors"
          >
            <div className="text-xl font-syne font-bold mb-1">{user.following}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Following</div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 mb-6">
          <button className="flex-1 py-4 flex flex-col items-center gap-2 border-b-2 border-via-accent text-via-accent">
            <Grid size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Posts</span>
          </button>
          <button className="flex-1 py-4 flex flex-col items-center gap-2 text-white/40 hover:text-white/60">
            <Heart size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Liked</span>
          </button>
          <button className="flex-1 py-4 flex flex-col items-center gap-2 text-white/40 hover:text-white/60">
            <Bookmark size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Saved</span>
          </button>
        </div>

        {/* Grid Placeholder */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={onUpdateProfile}
      />

      <FollowListModal
        isOpen={!!followModalType}
        onClose={() => setFollowModalType(null)}
        userId={user.uid}
        type={followModalType || 'followers'}
      />
    </div>
  );
};

export default ProfileView;
