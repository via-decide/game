import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Loader2, UserPlus, Check } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

const FollowListModal: React.FC<FollowListModalProps> = ({ isOpen, onClose, userId, type }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const field = type === 'followers' ? 'followingId' : 'followerId';
        const targetField = type === 'followers' ? 'followerId' : 'followingId';
        
        const q = query(
          collection(db, 'follows'),
          where(field, '==', userId),
          limit(50)
        );
        
        const snapshot = await getDocs(q);
        const userIds = snapshot.docs.map(doc => doc.data()[targetField]);
        
        if (userIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const userProfiles: UserProfile[] = [];
        for (const id of userIds) {
          const userDoc = await getDoc(doc(db, 'users', id));
          if (userDoc.exists()) {
            userProfiles.push(userDoc.data() as UserProfile);
          }
        }
        
        setUsers(userProfiles);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'follows');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-via-dark border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[70vh]"
          >
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-via-dark/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-via-accent" />
                <h2 className="font-syne font-bold text-xl capitalize">{type}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin text-via-accent" />
                  <p className="text-xs font-bold uppercase tracking-widest">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-20">
                  <Users className="w-12 h-12" />
                  <p className="text-sm font-bold uppercase tracking-widest text-center">
                    No {type} yet
                  </p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.uid} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                        {user.avatarEmoji || '👤'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{user.displayName}</h3>
                        <p className="text-white/40 text-[10px] font-mono">@{user.username}</p>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-via-accent uppercase tracking-widest">
                      Level {user.level}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FollowListModal;
