import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Sparkles, User, Zap, LayoutDashboard, Target, Plus, LogOut, BrainCircuit, ChevronRight, Menu, X, Trash2, Palette, UploadCloud, Globe, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import LegalFooter from './components/LegalText'; 

// 🔥 引入 Firebase
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from './firebaseConfig';

// ==============================================================================
// 1. 🎨 配色方案 (保持原样)
// ==============================================================================
const THEMES = {
  royal: { 
    id: 'royal',
    name: 'Royal Blue (皇家)', 
    bg: 'bg-[#F8FAFC]', 
    sidebar: 'bg-white border-r border-slate-200',
    card: 'bg-white border border-slate-100 shadow-sm',
    userBubble: 'bg-[#60A5FA]', 
    userText: 'text-white',      
    aiBubble: 'bg-white border border-slate-200 text-slate-800',
    textMain: 'text-[#0F172A]', 
    textSub: 'text-[#64748B]',  
    accent: 'text-[#3B82F6]',   
    accentBg: 'bg-[#3B82F6]',
    accentHover: 'hover:bg-[#2563EB]',
    border: 'border-slate-200',
    borderHighlight: 'border-[#3B82F6]',
    buttonText: 'text-white font-bold',
    placeholder: 'placeholder-slate-400'
  },
  matcha: { 
    id: 'matcha',
    name: 'Matcha Zen (抹茶)', 
    bg: 'bg-[#F2F7F5]', 
    sidebar: 'bg-[#EBF5EE] border-r border-[#A3C4BC]/30',
    card: 'bg-white border border-[#DCEBE6] shadow-sm',
    userBubble: 'bg-[#2F5D48]', 
    userText: 'text-white',      
    aiBubble: 'bg-white border border-[#8FB59E]/50 text-[#1A3C2F]',
    textMain: 'text-[#143326]', 
    textSub: 'text-[#5C8D77]',  
    accent: 'text-[#4A7C59]',   
    accentBg: 'bg-[#5C9E76]',   
    accentHover: 'hover:bg-[#468B64]',
    border: 'border-[#A3C4BC]/40',
    borderHighlight: 'border-[#5C9E76]',
    buttonText: 'text-white font-medium tracking-wide',
    placeholder: 'placeholder-[#8FB59E]/60'
  },
  lucid: { 
    id: 'lucid',
    name: 'Lucid Paper (暖阳)', 
    bg: 'bg-[#FFFCF5]', 
    sidebar: 'bg-[#FDFBF7] border-r border-[#E07A5F]/20',
    card: 'bg-white shadow-sm border border-[#E07A5F]/10',
    userBubble: 'bg-[#F2CC8F]', 
    userText: 'text-[#3D405B]', 
    aiBubble: 'bg-white border border-[#E07A5F]/30',
    textMain: 'text-[#3D405B]', 
    textSub: 'text-[#8D99AE]',
    accent: 'text-[#E07A5F]',   
    accentBg: 'bg-[#E07A5F]',
    accentHover: 'hover:bg-[#D0694F]',
    border: 'border-[#E07A5F]/20',
    borderHighlight: 'border-[#3D405B]',
    buttonText: 'text-white font-medium',
    placeholder: 'placeholder-[#3D405B]/30'
  }
};

// ==============================================================================
// 2. 🔐 登录组件 (双轨制：海外 vs 国内)
// ==============================================================================
const LoginScreen = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('china'); // 默认展示国内版
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Firebase 状态
  const [fbEmail, setFbEmail] = useState("");
  const [fbPass, setFbPass] = useState("");
  const [isFbRegister, setIsFbRegister] = useState(false);

  // Custom 状态
  const [cnUser, setCnUser] = useState("");
  const [cnPass, setCnPass] = useState("");
  const [isCnRegister, setIsCnRegister] = useState(false);

  // 1. Google 登录
  const handleGoogleLogin = async () => {
    setLoading(true); setError(null);
    try { await signInWithPopup(auth, googleProvider); } 
    catch (err) { setError("Google连接失败 (需VPN)"); setLoading(false); }
  };

  // 2. 邮箱登录 (Firebase)
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (isFbRegister) await createUserWithEmailAndPassword(auth, fbEmail, fbPass);
      else await signInWithEmailAndPassword(auth, fbEmail, fbPass);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  // 3. 🔥 中国特供：自定义账号登录 (连接 Render 后端)
  const handleCustomAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);

    // ⚠️ 替换为真实的 Render 后端地址
    const API_URL = "https://echo-api-6d3i.onrender.com/api/auth"; 
    const endpoint = isCnRegister ? `${API_URL}/register` : `${API_URL}/login`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cnUser, password: cnPass })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "请求失败");

      // 伪造一个 User 对象传给 App
      onLogin({
        uid: data.uid,
        displayName: data.username,
        email: null,
        photoURL: null,
        isCustomAuth: true // 标记为自定义登录
      });

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
      {/* 背景特效 */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#E07A5F]/5 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
      >
        <div className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-bold text-slate-800 font-serif tracking-tight">DECODR</h1>
          <p className="text-slate-500 text-xs tracking-widest uppercase">Beta 1.0</p>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-slate-100 mx-6">
          <button 
            onClick={() => { setActiveTab('china'); setError(null); }}
            className={`flex-1 pb-2 text-xs font-bold flex items-center justify-center gap-1 ${activeTab === 'china' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
          >
            <MapPin size={14}/> 中国直连 (免VPN)
          </button>
          <button 
            onClick={() => { setActiveTab('global'); setError(null); }}
            className={`flex-1 pb-2 text-xs font-bold flex items-center justify-center gap-1 ${activeTab === 'global' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
          >
            <Globe size={14}/> Global (Google)
          </button>
        </div>

        <div className="p-8 pt-6 min-h-[300px]">
          {/* 🇨🇳 中国模式表单 */}
          {activeTab === 'china' && (
            <form onSubmit={handleCustomAuth} className="space-y-4 animate-in fade-in duration-300">
               <div>
                 <label className="text-[10px] text-slate-400 uppercase font-bold pl-1">自定义账号</label>
                 <input 
                   type="text" 
                   placeholder="输入你的 ID (如: eason001)" 
                   value={cnUser}
                   onChange={(e) => setCnUser(e.target.value)}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                   required
                 />
               </div>
               <div>
                 <label className="text-[10px] text-slate-400 uppercase font-bold pl-1">密码</label>
                 <input 
                   type="password" 
                   placeholder="设置/输入密码" 
                   value={cnPass}
                   onChange={(e) => setCnPass(e.target.value)}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                   required
                 />
               </div>
               
               {error && <p className="text-red-500 text-xs text-center">{error}</p>}

               <button
                 type="submit"
                 disabled={loading}
                 className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
               >
                 {loading ? "Connecting..." : (isCnRegister ? "立即注册并登录" : "登录")}
               </button>

               <div className="text-center">
                 <button type="button" onClick={() => setIsCnRegister(!isCnRegister)} className="text-xs text-slate-500 underline hover:text-blue-600">
                   {isCnRegister ? "已有账号？去登录" : "第一次来？创建新账号"}
                 </button>
               </div>
            </form>
          )}

          {/* 🌍 国际模式表单 */}
          {activeTab === 'global' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G"/>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or Email</span></div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                 <input 
                   type="email" 
                   placeholder="Email" 
                   value={fbEmail} onChange={e => setFbEmail(e.target.value)}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                 />
                 <input 
                   type="password" 
                   placeholder="Password" 
                   value={fbPass} onChange={e => setFbPass(e.target.value)}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                 />
                 {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                 <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
                   {loading ? "..." : (isFbRegister ? "Sign Up" : "Log In")}
                 </button>
              </form>
              <div className="text-center">
                 <button onClick={() => setIsFbRegister(!isFbRegister)} className="text-xs text-slate-500 underline">
                   {isFbRegister ? "Back to Login" : "Create Account"}
                 </button>
               </div>
            </div>
          )}
        </div>

        {/* 协议组件 */}
        <div className="pb-6 border-t border-slate-50 bg-slate-50/50">
           <LegalFooter />
        </div>

      </motion.div>
    </div>
  );
};

// ==============================================================================
// 3. 🧠 思考指示器 (保持原样)
// ==============================================================================
const ThinkingIndicator = ({ theme }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start w-full">
    <div className={`${theme.aiBubble} rounded-2xl p-4 flex items-center gap-3 shadow-sm`}>
      <div className="relative flex items-center justify-center w-6 h-6">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute w-full h-full rounded-full ${theme.accentBg} opacity-20`}
        />
        <BrainCircuit size={16} className={theme.accent} />
      </div>
      <span className={`text-xs ${theme.accent} font-mono tracking-widest font-bold`}>THINKING...</span>
    </div>
  </motion.div>
);

// ==============================================================================
// 4. 🚀 智能消息渲染器 (保持原样)
// ==============================================================================
const AIResponseRenderer = ({ content, theme }) => {
  if (!content) return null;

  // 1️⃣ Quick Mode JSON
  try {
    if (content.trim().startsWith('{') && content.includes('"replies"')) {
      const data = JSON.parse(content);
      if (data.replies && Array.isArray(data.replies)) {
        return (
          <div className="space-y-3 w-full">
            <h4 className={`${theme.accent} text-xs font-bold tracking-wider mb-2 uppercase flex items-center gap-2`}>
              <Zap size={14} /> Quick Responses
            </h4>
            <div className="grid gap-3">
              {data.replies.map((reply, idx) => (
                <div key={idx} className={`${theme.card} p-3 rounded-lg border ${theme.border} hover:shadow-md transition-shadow`}>
                  <div className={`text-[10px] font-bold ${theme.accent} mb-1 uppercase tracking-wide opacity-80`}>
                    {reply.type}
                  </div>
                  <div className={`${theme.textMain} text-sm font-medium leading-relaxed`}>
                    "{reply.content}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
  } catch (e) {}

  // 2️⃣ Master Mode XML
  if (content.includes(':::')) {
    const extract = (tag) => {
      const regex = new RegExp(`:::${tag}:::([\\s\\S]*?):::END_${tag}:::`);
      const match = content.match(regex);
      return match ? match[1].trim() : null;
    };

    const analysis = extract('ANALYSIS');
    const action = extract('ACTION');
    const next = extract('NEXT');

    return (
      <div className="space-y-4 w-full">
        {analysis && (
          <div className={`border-l-4 ${theme.borderHighlight} pl-4 py-1`}>
            <h4 className={`${theme.accent} text-xs font-bold tracking-wider mb-2 flex items-center gap-2 uppercase opacity-80`}>
              <LayoutDashboard size={14} /> Situation Diagnosis
            </h4>
            <div className={`${theme.textMain} text-sm leading-6 prose prose-slate max-w-none`}><ReactMarkdown>{analysis}</ReactMarkdown></div>
          </div>
        )}

        {action && (
          <div className={`${theme.card} p-5 rounded-xl relative overflow-hidden`}>
            <h4 className={`${theme.textMain} text-xs font-bold tracking-wider mb-3 flex items-center gap-2 uppercase`}>
              <Zap size={14} className={theme.accent} fill="currentColor" /> Strategic Action
            </h4>
            <div className={`${theme.textMain} text-sm leading-7 prose prose-slate max-w-none font-medium`}><ReactMarkdown>{action}</ReactMarkdown></div>
          </div>
        )}

        {next && (
          <div className={`flex items-start gap-3 p-4 rounded-lg border border-dashed ${theme.border} bg-opacity-50`}>
            <Target size={16} className={`${theme.accent} shrink-0 mt-1`} />
            <div className="w-full">
              <div className={`font-bold ${theme.accent} text-xs mb-1 uppercase tracking-wider`}>Next Moves:</div>
              <div className={`${theme.textSub} text-sm leading-6 prose prose-slate max-w-none`}><ReactMarkdown>{next}</ReactMarkdown></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3️⃣ Markdown Fallback
  return (
    <div className={`leading-relaxed text-sm ${theme.textMain} prose prose-slate max-w-none`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

// ==============================================================================
// 5. 主程序 (包含完整侧边栏和UI逻辑)
// ==============================================================================
export default function TrueSelfCoach() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // 🎨 主题
  const [currentThemeId, setCurrentThemeId] = useState('royal');
  const theme = THEMES[currentThemeId];
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // 📝 状态
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [mode, setMode] = useState('master');
  
  // 🤏 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // 💾 历史记录
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null); 

  const scrollRef = useRef(null);

  useEffect(() => {
    // 监听 Firebase Auth 变化
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 如果 Firebase 登录了，覆盖当前用户
      if (user) {
        setCurrentUser(user);
        setLoadingAuth(false);
        loadLocalHistory(user.uid);
      } else {
        // 如果 Firebase 没登录，但我们可能有 Custom 用户
        if (!currentUser?.isCustomAuth) {
           setLoadingAuth(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loadLocalHistory = (uid) => {
      const saved = localStorage.getItem(`zhenwo_history_${uid}`);
      if (saved) setChatHistory(JSON.parse(saved));
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  // --- 🔥 核心：文件处理逻辑 ---
  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, { base64: reader.result.split(',')[1], mime: file.type, preview: reader.result }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleImageUpload = (e) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); };
  const removeImage = (index) => { setImages(prev => prev.filter((_, i) => i !== index)); };

  const handleNewChat = () => {
    if (!currentSessionId && messages.length > 0 && currentUser) {
      const title = messages[0].content.substring(0, 12) + (messages[0].content.length > 12 ? '...' : '');
      const newHistoryItem = {
        id: Date.now(),
        title: title || 'New Strategy',
        date: new Date().toLocaleDateString(),
        messages: [...messages]
      };
      const updatedHistory = [newHistoryItem, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem(`zhenwo_history_${currentUser.uid}`, JSON.stringify(updatedHistory));
    }
    setMessages([]); setImages([]); setInput(''); setCurrentSessionId(null); setShowHistoryMobile(false);
  };

  const loadHistorySession = (session) => {
    if (!currentSessionId && messages.length > 0) handleNewChat(); 
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setShowHistoryMobile(false);
  };

  const deleteHistorySession = (e, id) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter(item => item.id !== id);
    setChatHistory(updatedHistory);
    if(currentUser) localStorage.setItem(`zhenwo_history_${currentUser.uid}`, JSON.stringify(updatedHistory));
    if (currentSessionId === id) { setMessages([]); setCurrentSessionId(null); }
  };

  const handleLogout = () => {
    if (currentUser?.isCustomAuth) {
        setCurrentUser(null);
    } else {
        signOut(auth);
        setCurrentUser(null);
    }
    setMessages([]); setCurrentSessionId(null);
  };

  const handleSend = async () => {
    if (mode === 'report') {
        setMessages(prev => [...prev, { role: 'assistant', content: "🚧 Report Mode Under Construction" }]);
        return;
    }

    if (!input.trim() && images.length === 0) return;

    const userContent = input.trim() || (images.length > 0 ? "[User sent an image]" : "");
    const userMsg = { role: 'user', content: userContent, images: images.map(i => i.preview) };
    
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setImages([]); setIsThinking(true);

    try {
      const response = await fetch('https://echo-api-6d3i.onrender.com/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userContent, 
          images: images.map(img => ({ base64: img.base64, mime: img.mime })),
          mode, 
          userId: currentUser?.uid || "guest",
          history: messages.map(m => ({ role: m.role, content: m.content })) 
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;
            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'analysis') {
                aiContent += data.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = aiContent;
                  return newMsgs;
                });
              }
            } catch (e) { }
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Uplink Failed. Check server connection." }]);
    } finally {
      setIsThinking(false);
    }
  };

  if (loadingAuth) return <div className="h-screen bg-white flex items-center justify-center text-slate-400 font-mono animate-pulse">INITIALIZING DECODR...</div>;
  
  // 传递 onLogin 回调，处理用户对象
  if (!currentUser) return <LoginScreen onLogin={(user) => { setCurrentUser(user); loadLocalHistory(user.uid); }} />;

  return (
    <div className={`flex h-screen ${theme.bg} ${theme.textMain} font-sans transition-colors duration-500 overflow-hidden`}>
      
      {/* 📱 Mobile Header */}
      <div className={`md:hidden fixed top-0 w-full h-14 border-b ${theme.border} ${theme.sidebar} z-50 flex items-center justify-between px-4`}>
         <span className="font-bold font-serif tracking-wide">ZHENWO</span>
         <button onClick={() => setShowHistoryMobile(!showHistoryMobile)}><Menu size={24}/></button>
      </div>

      {/* 🔴 左侧栏 */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${theme.sidebar} flex flex-col
        ${showHistoryMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className={`p-6 border-b ${theme.border} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${theme.accentBg} flex items-center justify-center shadow-lg`}>
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide font-serif">ZHENWO</span>
          </div>
          <button className="md:hidden" onClick={() => setShowHistoryMobile(false)}><X size={20}/></button>
        </div>

        <div className="p-4 space-y-4">
            <button 
              onClick={handleNewChat}
              className={`w-full flex items-center justify-center gap-2 py-3 ${theme.accentBg} ${theme.accentHover} text-white rounded-xl transition-all shadow-md active:scale-95`}
            >
              <Plus size={18} />
              <span className="font-bold text-sm">New Session</span>
            </button>
        </div>

        {/* 📜 历史记录 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            <div className={`text-[10px] font-bold ${theme.textSub} uppercase tracking-widest px-2 mb-2`}>Archives</div>
            {chatHistory.length === 0 && (
                <div className={`text-xs ${theme.textSub} text-center py-4 italic`}>No past sessions.</div>
            )}
            {chatHistory.map(session => (
                <div 
                    key={session.id}
                    onClick={() => loadHistorySession(session)}
                    className={`group relative p-3 rounded-lg border cursor-pointer transition-all ${currentSessionId === session.id ? theme.accentBg + ' text-white border-transparent' : 'border-transparent hover:bg-black/5 ' + theme.textMain}`}
                >
                    <div className="text-sm font-medium truncate pr-6">{session.title}</div>
                    <div className={`text-[10px] mt-1 ${currentSessionId === session.id ? 'text-white/80' : theme.textSub}`}>{session.date}</div>
                    <button 
                        onClick={(e) => deleteHistorySession(e, session.id)}
                        className={`absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${currentSessionId === session.id ? 'hover:bg-white/20' : 'hover:bg-red-100 text-red-400'}`}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
        </div>

        {/* 🎨 底部菜单 */}
        <div className={`p-4 border-t ${theme.border} space-y-4`}>
             <div className="relative">
                <button 
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border ${theme.border} hover:bg-black/5 transition-all text-xs font-bold ${theme.textMain}`}
                >
                    <div className="flex items-center gap-2">
                        <Palette size={14} />
                        <span>Theme: {theme.name.split(' ')[0]}</span>
                    </div>
                    <ChevronRight size={14} className={`transform transition-transform ${showThemeMenu ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                    {showThemeMenu && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`absolute bottom-full left-0 w-full mb-2 p-2 rounded-xl border ${theme.border} ${theme.card} shadow-xl z-50 flex flex-col gap-1`}
                        >
                            {Object.values(THEMES).map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setCurrentThemeId(t.id); setShowThemeMenu(false); }}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${currentThemeId === t.id ? theme.accentBg + ' text-white' : 'hover:bg-black/5 ' + theme.textMain}`}
                                >
                                    <div className={`w-3 h-3 rounded-full border border-black/10`} style={{ backgroundColor: t.id === 'royal' ? '#60A5FA' : (t.id === 'matcha' ? '#5C9E76' : '#F2CC8F') }} />
                                    {t.name}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl ${theme.card} border ${theme.border}`}>
                {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} className="w-8 h-8 rounded-full border border-slate-200" alt="avatar"/>
                ) : (
                    <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center`}>
                        <User size={14} className={theme.textSub}/>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{currentUser.displayName || "Commander"}</div>
                    <div className={`text-[10px] ${theme.textSub} truncate`}>Log Out</div>
                </div>
                <button onClick={handleLogout} className={`${theme.textSub} hover:text-red-400`}><LogOut size={16} /></button>
            </div>
        </div>
      </div>

      {/* 🔵 右侧主界面 */}
      <div className="flex-1 flex flex-col relative pt-14 md:pt-0">
        
        {/* 顶部状态栏 */}
        <div className={`h-16 border-b ${theme.border} flex items-center justify-between px-6 backdrop-blur-md z-10 transition-colors duration-500`}>
          <div className={`flex ${theme.card} p-1 rounded-lg border ${theme.border}`}>
             {['quick', 'master', 'report'].map((m) => (
               <button
                 key={m}
                 onClick={() => setMode(m)}
                 className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                   mode === m 
                     ? `${theme.accentBg} text-white shadow-sm` 
                     : `${theme.textSub} hover:${theme.textMain}`
                 }`}
               >
                 {m}
               </button>
             ))}
          </div>
          <div className={`flex items-center gap-2 text-xs ${theme.textSub}`}>
             <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
             {isThinking ? 'NEURAL ENGINE ACTIVE' : 'SYSTEM READY'}
          </div>
        </div>

        {/* 消息区域 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
           {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center opacity-40 select-none">
                <BrainCircuit size={64} className={`mb-6 ${theme.accent}`} />
                <p className={`tracking-[0.3em] text-xs font-bold uppercase ${theme.textSub}`}>Awaiting Input</p>
             </div>
           )}

           <AnimatePresence>
             {messages.map((msg, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }}
                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
               >
                 <div className={`max-w-[90%] md:max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className={`text-[10px] mb-1 font-bold tracking-widest uppercase opacity-60 ${theme.textSub} px-1`}>
                        {msg.role === 'user' ? 'You' : 'Zhenwo'}
                    </span>
                    
                    <div className={`rounded-2xl p-5 shadow-sm relative overflow-hidden transition-colors duration-500 ${
                        msg.role === 'user' 
                          ? `${theme.userBubble} ${theme.userText} rounded-tr-sm` 
                          : `${theme.aiBubble} rounded-tl-sm`
                    }`}>
                        {msg.images && msg.images.length > 0 && (
                          <div className="flex gap-2 mb-3">
                             {msg.images.map((img, idx) => (
                               <img key={idx} src={img} className="h-32 rounded-lg border border-white/20 object-cover" alt="upload" />
                             ))}
                          </div>
                        )}

                        {msg.role === 'assistant' 
                           ? (
                             <>
                               <AIResponseRenderer content={msg.content} theme={theme} />
                               {i === messages.length - 1 && isThinking && (
                                 <span className={`inline-block w-1.5 h-4 ml-1 align-middle ${theme.accentBg} animate-pulse`}/>
                               )}
                             </>
                           )
                           : <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        }
                    </div>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>

           {isThinking && <ThinkingIndicator theme={theme} />}
        </div>

        {/* 输入框区域 */}
        <div className={`p-4 md:p-6 border-t ${theme.border} ${theme.bg} transition-colors duration-500`}>
           <div 
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             className={`max-w-4xl mx-auto relative flex gap-3 items-end ${theme.card} p-2 rounded-2xl border ${isDragging ? `border-dashed ${theme.borderHighlight} ring-2 ring-blue-500/20 bg-blue-50/50` : theme.border} transition-all shadow-sm`}
           >
              {isDragging && (
                 <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-2xl backdrop-blur-sm">
                    <div className="text-sm font-bold text-blue-500 flex items-center gap-2">
                      <UploadCloud size={20} /> Drop image to analyze
                    </div>
                 </div>
              )}

              {images.length > 0 && (
                <div className="absolute bottom-full left-0 mb-4 flex gap-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                       <img src={img.preview} className="h-16 w-16 rounded-lg object-cover" />
                       <button 
                         onClick={() => removeImage(idx)}
                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                       >
                         <X size={12} />
                       </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button className={`p-3 ${theme.textSub} hover:${theme.accent} transition-colors relative group`}>
                <ImageIcon size={20} />
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </button>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your strategy here... (or drag & drop images)"
                className={`flex-1 bg-transparent border-none ${theme.textMain} ${theme.placeholder} focus:ring-0 resize-none h-12 py-3 max-h-32 text-sm font-medium`}
              />
              
              <button 
                onClick={handleSend}
                disabled={isThinking || (!input.trim() && images.length === 0)}
                className={`p-3 ${theme.accentBg} ${theme.buttonText} rounded-xl ${theme.accentHover} disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-95`}
              >
                <Send size={18} fill="currentColor" />
              </button>
           </div>
           
           {/* 🔥 页脚声明 */}
           <div className="text-center mt-3">
              <p className="text-[10px] text-slate-400 opacity-60 scale-90">
                回声为 AI 实验项目，内容由模型生成，不代表医学或专业咨询建议，请谨慎参考。
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}