import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  increment 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Post, UserProfile } from '../types';

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  currentUser: UserProfile;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, post, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'posts', post.id, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment));
      setComments(commentsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `posts/${post.id}/comments`);
    });

    return () => unsubscribe();
  }, [isOpen, post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        userId: currentUser.uid,
        authorName: currentUser.displayName,
        authorAvatar: currentUser.avatarEmoji || '👤',
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'posts', post.id, 'comments'), commentData);
      await updateDoc(doc(db, 'posts', post.id), {
        comments: increment(1)
      });

      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${post.id}/comments`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-via-dark border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-via-dark/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-via-accent" />
                <h2 className="font-syne font-bold text-xl">Comments</h2>
                <span className="text-white/40 text-sm font-mono">{comments.length}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin text-via-accent" />
                  <p className="text-xs font-bold uppercase tracking-widest">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20 py-12">
                  <MessageCircle className="w-12 h-12" />
                  <p className="text-sm font-bold uppercase tracking-widest">No comments yet</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shrink-0">
                      {comment.authorAvatar}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-via-accent">{comment.authorName}</span>
                        <span className="text-[10px] text-white/20 font-mono">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-via-accent transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="w-12 h-12 rounded-2xl bg-via-accent text-white flex items-center justify-center hover:bg-via-accent/80 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommentsModal;
