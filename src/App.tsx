import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  Compass, 
  Plus, 
  ShoppingBag, 
  User, 
  Search, 
  Bell, 
  TrendingUp, 
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowRight,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Music2,
  BookOpen,
  Clock,
  Users,
  Settings,
  LogOut,
  Grid,
  Bookmark,
  MapPin,
  Link as LinkIcon,
  Calendar
} from 'lucide-react';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logout, 
  handleFirestoreError,
  OperationType,
  setupRecaptcha,
  signInWithPhone
} from './firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  increment,
  writeBatch,
  getDoc,
  limit,
  orderBy
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser, ConfirmationResult } from 'firebase/auth';
import { UserProfile, Post, DeepDive, AppState } from './types';
import { INITIAL_POSTS, INITIAL_DEEP_DIVES } from './constants';

// Sub-components
import FeedPost from './components/FeedPost';
import DeepDiveCard from './components/DeepDiveCard';
import Navigation from './components/Navigation';
import ProfileView from './components/ProfileView';
import DiscoverView from './components/DiscoverView';
import CreatePostModal from './components/CreatePostModal';
import CommentsModal from './components/CommentsModal';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, errorInfo: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-via-dark p-6 text-center">
          <div className="glass-panel p-8 rounded-3xl max-w-md space-y-4 border-red-500/20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="font-syne font-bold text-2xl text-white">Something went wrong</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              {this.state.errorInfo.includes('{') ? 'A secure operation failed. Please check your permissions.' : this.state.errorInfo}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-via-accent text-white font-bold uppercase tracking-widest hover:bg-via-accent/80 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'dives' | 'discover' | 'profile'>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [dives, setDives] = useState<DeepDive[]>(INITIAL_DEEP_DIVES);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
    console.log(`[VIA] ${msg}`);
  };

  // Auth Listener
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          addLog(`User authenticated: ${firebaseUser.email || firebaseUser.phoneNumber}`);
          
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            addLog('Initializing new user profile...');
            const identifier = firebaseUser.email || firebaseUser.phoneNumber || 'user';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              username: identifier.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000),
              displayName: firebaseUser.displayName || (firebaseUser.phoneNumber ? `User ${firebaseUser.phoneNumber.slice(-4)}` : 'Bharat Explorer'),
              email: firebaseUser.email || undefined,
              phoneNumber: firebaseUser.phoneNumber || undefined,
              city: 'New Delhi',
              avatarEmoji: '🇮🇳',
              bio: "Digital explorer navigating Bharat's social landscape. 🇮🇳",
              credits: 1000,
              xp: 0,
              level: 1,
              followers: 0,
              following: 0,
              posts: 0,
              createdAt: new Date().toISOString()
            };
            
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(userSnap.data() as UserProfile);
          }

          // Real-time profile updates
          if (profileUnsub) profileUnsub();
          profileUnsub = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              setProfile(doc.data() as UserProfile);
            }
          }, (err) => {
            console.error('Profile snapshot error:', err);
            handleFirestoreError(err, OperationType.GET, 'users');
          });
        } else {
          setProfile(null);
          if (profileUnsub) {
            profileUnsub();
            profileUnsub = null;
          }
        }
      } catch (err) {
        console.error('Auth state change error:', err);
      } finally {
        setLoading(false);
      }
    });

    // Setup Recaptcha for Phone Auth
    setupRecaptcha('recaptcha-container');

    // Timeout for loading state
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
      clearTimeout(timeout);
    };
  }, []);

  // Fetch Posts & Dives
  useEffect(() => {
    if (!user) return;

    // Fetch Posts with a query to ensure we get the latest ones
    const postsQuery = query(
      collection(db, 'posts'), 
      limit(50)
    );

    const postsUnsub = onSnapshot(postsQuery, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Post));
      
      // Sort by date descending client-side to avoid needing a composite index immediately
      const sortedPosts = fetchedPosts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (sortedPosts.length > 0) {
        setPosts(sortedPosts);
      }
    }, (err) => {
      console.error('Posts snapshot error:', err);
      handleFirestoreError(err, OperationType.LIST, 'posts');
    });

    const divesUnsub = onSnapshot(collection(db, 'deep_dives'), (snapshot) => {
      const fetchedDives = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeepDive));
      if (fetchedDives.length > 0) setDives(fetchedDives);
    }, (err) => {
      console.error('Dives snapshot error:', err);
      handleFirestoreError(err, OperationType.LIST, 'deep_dives');
    });

    return () => {
      postsUnsub();
      divesUnsub();
    };
  }, [user]);

  const handleSendCode = async () => {
    // Clean phone number: remove spaces, dashes, etc.
    const cleanedPhone = phoneNumber.replace(/\s|-|\(|\)/g, '');
    
    if (!cleanedPhone) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    // Basic validation for E.164 format
    if (!/^\+[1-9]\d{1,14}$/.test(cleanedPhone)) {
      setPhoneError('Please use international format (e.g., +919876543210)');
      return;
    }

    setPhoneError('');
    setIsSendingCode(true);
    try {
      // Ensure recaptcha is ready
      setupRecaptcha('recaptcha-container');
      const result = await signInWithPhone(cleanedPhone);
      setConfirmationResult(result);
      addLog('Verification code sent');
    } catch (error: any) {
      console.error('Phone Auth Error:', error);
      setPhoneError(error.message || 'Failed to send code');
      // Reset recaptcha if it fails
      setupRecaptcha('recaptcha-container');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !confirmationResult) return;
    setIsVerifyingCode(true);
    setPhoneError('');
    try {
      await confirmationResult.confirm(verificationCode);
      addLog('Phone verification successful');
    } catch (error: any) {
      setPhoneError(error.message || 'Invalid verification code');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activePostIndex) {
      setActivePostIndex(index);
    }
  };

  const handleUpdateProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, updatedProfile);
      addLog('Profile updated successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const handleCreatePost = async (content: string, imageUrl?: string) => {
    if (!profile) return;
    try {
      const newPost: Omit<Post, 'id'> = {
        userId: profile.uid,
        authorName: profile.displayName,
        authorAvatar: profile.avatarEmoji || '🇮🇳',
        content,
        imageUrl,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'posts'), newPost);
      addLog('Post created successfully');
      
      // Increment user's post count
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        posts: increment(1),
        xp: increment(50) // Reward for posting
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'posts');
    }
  };

  const handleLikePost = async (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    try {
      await updateDoc(postRef, {
        likes: increment(1)
      });
      if (profile) {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          xp: increment(5) // Small reward for engagement
        });
      }
      addLog('Post liked');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'posts');
    }
  };

  const handleCommentPost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForComments(post);
      setIsCommentsModalOpen(true);
      if (profile) {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          xp: increment(10) // Reward for commenting
        });
      }
    }
  };

  const handleSharePost = async (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    try {
      await updateDoc(postRef, {
        shares: increment(1)
      });
      addLog('Post shared');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'posts');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-via-dark">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-via-accent" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-via-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-via-accent/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-via-gold/10 blur-[120px] rounded-full" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 relative z-10 max-w-md"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-via-accent rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-via-accent/40"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="font-syne font-extrabold text-5xl tracking-tighter text-white">VIA</h1>
            <p className="font-syne font-bold text-xl text-via-gold uppercase tracking-[0.2em]">Bharat's Social Platform</p>
          </div>

          <p className="text-white/60 text-sm leading-relaxed font-medium">
            Discover, create, and deep dive into the stories that matter. 
            Join the next generation of Bharat's digital landscape.
          </p>

          <div className="space-y-4">
            {!showPhoneInput ? (
              <>
                <button 
                  onClick={signInWithGoogle}
                  className="w-full py-4 rounded-2xl bg-white text-via-dark font-bold text-lg flex items-center justify-center gap-3 hover:bg-via-accent hover:text-white transition-all shadow-xl"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
                <button 
                  onClick={() => setShowPhoneInput(true)}
                  className="w-full py-4 rounded-2xl glass-panel text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                >
                  <User className="w-5 h-5" />
                  Continue with Phone
                </button>
              </>
            ) : (
              <div className="space-y-4 text-left">
                {!confirmationResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="+91 98765 43210"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (phoneError) setPhoneError('');
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-via-accent transition-colors"
                      />
                    </div>
                    {phoneError && <p className="text-red-400 text-xs ml-2">{phoneError}</p>}
                    <button 
                      onClick={handleSendCode}
                      disabled={isSendingCode}
                      className="w-full py-4 rounded-2xl bg-via-accent text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-via-accent/80 transition-all disabled:opacity-50"
                    >
                      {isSendingCode ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send Verification Code'}
                    </button>
                    <button 
                      onClick={() => setShowPhoneInput(false)}
                      className="w-full py-2 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Back to options
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Verification Code</label>
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-via-accent transition-colors text-center tracking-[0.5em] text-2xl font-bold"
                        maxLength={6}
                      />
                    </div>
                    {phoneError && <p className="text-red-400 text-xs ml-2">{phoneError}</p>}
                    <button 
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode}
                      className="w-full py-4 rounded-2xl bg-via-gold text-via-dark font-bold text-lg flex items-center justify-center gap-3 hover:bg-via-gold/80 transition-all disabled:opacity-50"
                    >
                      {isVerifyingCode ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Continue'}
                    </button>
                    <button 
                      onClick={() => setConfirmationResult(null)}
                      className="w-full py-2 text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Resend code
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div id="recaptcha-container"></div>

          <div className="pt-8 flex justify-center gap-8 text-[10px] font-bold text-white/20 uppercase tracking-widest">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-via-dark text-white font-sans selection:bg-via-accent selection:text-white">
        
        {/* Main Content Area */}
        <main className="relative h-screen overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'feed' && (
              <motion.div 
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                onScroll={handleScroll}
              >
                {posts.map((post, index) => (
                  <div key={post.id} className="h-screen snap-start">
                    <FeedPost 
                      post={post} 
                      isActive={index === activePostIndex} 
                      onLike={handleLikePost}
                      onComment={handleCommentPost}
                      onShare={handleSharePost}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'dives' && (
              <motion.div 
                key="dives"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto px-6 pt-24 pb-32 space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="font-syne font-bold text-4xl tracking-tight">Deep Dives</h2>
                  <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Curated knowledge for you</p>
                </div>

                <div className="grid gap-6">
                  {dives.map((dive) => (
                    <DeepDiveCard 
                      key={dive.id} 
                      dive={dive} 
                      onClick={() => addLog(`Opening dive: ${dive.title}`)} 
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'discover' && profile && (
              <motion.div 
                key="discover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto"
              >
                <DiscoverView currentUser={profile} />
              </motion.div>
            )}

            {activeTab === 'profile' && profile && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto"
              >
                <ProfileView 
              user={profile} 
              onLogout={logout} 
              onUpdateProfile={handleUpdateProfile}
            />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Global Navigation */}
        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onCreatePost={() => setIsCreatePostModalOpen(true)}
        />

        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          user={profile!}
          onSave={handleCreatePost}
        />

        {profile && selectedPostForComments && (
          <CommentsModal
            isOpen={isCommentsModalOpen}
            onClose={() => {
              setIsCommentsModalOpen(false);
              setSelectedPostForComments(null);
            }}
            post={selectedPostForComments}
            currentUser={profile}
          />
        )}

        {/* Top Bar (Conditional) */}
        {activeTab !== 'feed' && (
          <div className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
              <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-via-accent">
                <TrendingUp size={20} />
              </div>
              <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2">
                <span className="text-via-gold">✨</span>
                <span className="text-xs font-bold tracking-widest">{profile?.credits || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pointer-events-auto">
              <button className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-white/10 transition-colors">
                <Search size={20} />
              </button>
              <button className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-white/10 transition-colors relative">
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-via-accent rounded-full border-2 border-via-dark" />
              </button>
            </div>
          </div>
        )}

        {/* Logs Overlay (Dev Only) */}
        {process.env.NODE_ENV !== 'production' && logs.length > 0 && (
          <div className="fixed top-20 left-6 z-50 pointer-events-none space-y-2">
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="glass-panel px-3 py-1 rounded-lg text-[10px] font-mono text-white/40"
              >
                {log}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
