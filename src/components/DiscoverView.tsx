import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, Check, Loader2, TrendingUp, Users } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { Sparkles } from 'lucide-react';

interface DiscoverViewProps {
  currentUser: UserProfile;
}

const DiscoverView: React.FC<DiscoverViewProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingUsers, setTrendingUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Fetch some initial "trending" users
    const fetchTrending = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        const users = snapshot.docs
          .map(doc => doc.data() as UserProfile)
          .filter(u => u.uid !== currentUser.uid);
        setTrendingUsers(users);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'users');
      }
    };
    fetchTrending();
  }, [currentUser.uid]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '>=', searchQuery.toLowerCase()),
        where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.uid !== currentUser.uid);
      setSearchResults(results);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-24">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="font-syne font-bold text-4xl tracking-tight">Discover</h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Connect with Bharat's finest</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-via-accent transition-colors"
          />
          {isSearching && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-via-accent" size={20} />
            </div>
          )}
        </div>

        {/* Results or Trending */}
        <div className="space-y-8">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-via-accent">
                <Search size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Search Results</span>
              </div>
              <div className="space-y-3">
                {searchResults.map(user => (
                  <UserCard key={user.uid} user={user} currentUserUid={currentUser.uid} />
                ))}
              </div>
            </div>
          ) : searchQuery.trim() && !isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-20">
              <Users size={48} />
              <p className="text-sm font-bold uppercase tracking-widest">No users found</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-via-gold">
                <TrendingUp size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Trending Now</span>
              </div>
              <div className="space-y-3">
                {trendingUsers.map(user => (
                  <UserCard key={user.uid} user={user} currentUserUid={currentUser.uid} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserCard = ({ user, currentUserUid }: { user: UserProfile, currentUserUid: string }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkFollow = async () => {
      const followId = `${currentUserUid}_${user.uid}`;
      const followRef = doc(db, 'follows', followId);
      const snapshot = await getDocs(query(collection(db, 'follows'), where('followerId', '==', currentUserUid), where('followingId', '==', user.uid)));
      setIsFollowing(!snapshot.empty);
    };
    checkFollow();
  }, [currentUserUid, user.uid]);

  const handleFollow = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    const followId = `${currentUserUid}_${user.uid}`;
    const followRef = doc(db, 'follows', followId);
    const currentUserRef = doc(db, 'users', currentUserUid);
    const targetUserRef = doc(db, 'users', user.uid);

    try {
      if (isFollowing) {
        // Unfollow
        await deleteDoc(followRef);
        await updateDoc(currentUserRef, { following: increment(-1) });
        await updateDoc(targetUserRef, { followers: increment(-1) });
        setIsFollowing(false);
      } else {
        // Follow
        await setDoc(followRef, {
          followerId: currentUserUid,
          followingId: user.uid,
          createdAt: new Date().toISOString()
        });
        await updateDoc(currentUserRef, { following: increment(1) });
        await updateDoc(targetUserRef, { followers: increment(1) });
        setIsFollowing(true);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'follows');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl shadow-inner">
          {user.avatarEmoji || '🇮🇳'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">{user.displayName}</h3>
            {user.xp > 1000 && <Sparkles className="w-3 h-3 text-via-gold" />}
          </div>
          <p className="text-white/40 text-xs font-mono">@{user.username}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">
              {user.followers} Followers
            </span>
            <span className="text-[10px] text-via-accent font-bold uppercase tracking-tighter">
              Level {user.level}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={handleFollow}
        disabled={isUpdating}
        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
          isFollowing 
            ? 'bg-white/10 text-white/60' 
            : 'bg-via-accent text-white hover:bg-via-accent/80 shadow-lg shadow-via-accent/20'
        } disabled:opacity-50`}
      >
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isFollowing ? (
          <span className="flex items-center gap-1">
            <Check size={12} /> Following
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <UserPlus size={12} /> Follow
          </span>
        )}
      </button>
    </motion.div>
  );
};

export default DiscoverView;
