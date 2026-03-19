import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Loader2, Send } from 'lucide-react';
import { UserProfile } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (content: string, imageUrl?: string) => Promise<void>;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write something first');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave(content, imageUrl || undefined);
      setContent('');
      setImageUrl('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-via-dark/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative w-full max-w-lg bg-via-dark border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                  {user.avatarEmoji || '🇮🇳'}
                </div>
                <div>
                  <h2 className="font-bold text-sm">Create Post</h2>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">Sharing with Bharat</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <textarea
                autoFocus
                placeholder="What's happening in your part of Bharat?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-lg text-white placeholder:text-white/20 focus:outline-none resize-none"
              />

              {showImageInput && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-via-accent transition-colors"
                  />
                </motion.div>
              )}

              {error && <p className="text-red-400 text-xs ml-2">{error}</p>}

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button 
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${showImageInput ? 'bg-via-accent text-white' : 'text-white/40 hover:bg-white/5'}`}
                >
                  <ImageIcon size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add Image</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving || !content.trim()}
                  className="px-8 py-3 rounded-xl bg-via-accent text-white font-bold flex items-center justify-center gap-2 hover:bg-via-accent/80 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <Send size={18} />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
