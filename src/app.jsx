import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import LegalFooter from './LegalText'; 
import { Send, Image as ImageIcon, Sparkles, User, Zap, LayoutDashboard, Target, Plus, LogOut, BrainCircuit, ChevronRight, Menu, X, Trash2, Palette, UploadCloud, Globe, MapPin, CheckCircle2, Gift, Crown, Copy, Check } from 'lucide-react'; // 新增了 Copy 和 Check
// 🔥 引入 Firebase
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from './firebaseConfig';

// ==============================================================================
// 🌟 通用话术复制按钮组件
// ==============================================================================
const CopyButton = ({ text, theme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    // 确保把后端的字面量 \n 转换为真实的换行符
    const formattedText = text.replace(/\\n/g, '\n');
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2秒后恢复原状
  };

  return (
    <button 
      onClick={handleCopy} 
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95 z-10 ${
        copied 
          ? 'bg-emerald-500 border-emerald-500 text-white' 
          : `bg-white ${theme.border} ${theme.textSub} hover:${theme.textMain} hover:bg-slate-50`
      }`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? '已复制' : '一键复制'}
    </button>
  );
};
// ==============================================================================
// 0. 🌍 国际化字典 (Translation Dictionary)
// ==============================================================================
const TRANSLATIONS = {
  cn: {
    appName: "回声 ECHO",
    slogan: "你的 AI 沟通军师",
    loginModeCn: "中国直连 (免VPN)",
    loginModeGlobal: "全球模式 (Google)",
    username: "账号 ID",
    password: "密码",
    loginBtn: "登录",
    registerBtn: "注册并登录",
    googleLogin: "Google 账号登录",
    switchRegister: "没有账号？去注册",
    switchLogin: "已有账号？去登录",
    thinking: "正在思考...",
    systemReady: "系统就绪",
    newSession: "新对话",
    archives: "历史记录",
    theme: "主题配色",
    logout: "退出登录",
    deleteAccount: "注销账号",
    deleteConfirm: "⚠️ 高危操作：确定要永久删除账号吗？此操作无法撤销，所有历史记录将丢失。",
    inputPlaceholder: "输入你的困惑，或者上传聊天截图...",
    modes: { quick: "嘴替模式", master: "军师模式", report: "深度复盘" },
    aiTitles: { quick: "神回复推荐", analysis: "局势分析", strategy: "战术建议", next: "下一步行动" }
  },
  en: {
    appName: "ECHO",
    slogan: "Your AI Communication Coach",
    loginModeCn: "Direct (China)",
    loginModeGlobal: "Global (Google)",
    username: "User ID",
    password: "Password",
    loginBtn: "Log In",
    registerBtn: "Sign Up & Login",
    googleLogin: "Continue with Google",
    switchRegister: "New here? Create Account",
    switchLogin: "Have an account? Log In",
    thinking: "THINKING...",
    systemReady: "SYSTEM READY",
    newSession: "New Session",
    archives: "ARCHIVES",
    theme: "Theme",
    logout: "Log Out",
    deleteAccount: "Delete Account",
    deleteConfirm: "⚠️ WARNING: Are you sure you want to permanently delete your account? All history will be lost.",
    inputPlaceholder: "Type your situation here... (or drag & drop screenshots)",
    modes: { quick: "Quick Reply", master: "Master Strategy", report: "Deep Report" },
    aiTitles: { quick: "Quick Responses", analysis: "Situation Analysis", strategy: "Strategic Advice", next: "Next Moves" }
  }
};

// ==============================================================================
// 1. 🎨 配色方案
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
// 2. 🔐 登录组件 (支持中英切换)
// ==============================================================================
const LoginScreen = ({ onLogin, initialLang = 'cn' }) => {
  const [activeTab, setActiveTab] = useState('china'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState(initialLang); 
  const t = TRANSLATIONS[lang];

  // Firebase 状态
  const [fbEmail, setFbEmail] = useState("");
  const [fbPass, setFbPass] = useState("");
  const [isFbRegister, setIsFbRegister] = useState(false);

  // Custom 状态
  const [cnUser, setCnUser] = useState("");
  const [cnPass, setCnPass] = useState("");
  const [isCnRegister, setIsCnRegister] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true); setError(null);
    try { await signInWithPopup(auth, googleProvider); } 
    catch (err) { setError("Google Connection Failed (VPN required)"); setLoading(false); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (isFbRegister) await createUserWithEmailAndPassword(auth, fbEmail, fbPass);
      else await signInWithEmailAndPassword(auth, fbEmail, fbPass);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const handleCustomAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);

    const API_URL = "https://echo-api-6d3i.onrender.com/api/auth"; 
    const endpoint = isCnRegister ? `${API_URL}/register` : `${API_URL}/login`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cnUser, password: cnPass })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request Failed");

      onLogin({
        uid: data.uid,
        displayName: data.username,
        email: null,
        photoURL: null,
        isCustomAuth: true,
        preferredLang: lang 
      });

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-6 right-6 z-20">
         <button 
           onClick={() => setLang(lang === 'cn' ? 'en' : 'cn')}
           className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm hover:text-blue-600 transition-colors"
         >
            {lang === 'cn' ? '🇺🇸 EN' : '🇨🇳 中文'}
         </button>
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#E07A5F]/5 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
      >
        <div className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-bold text-slate-800 font-serif tracking-tight">{t.appName}</h1>
          <p className="text-slate-500 text-xs tracking-widest uppercase mt-1">{t.slogan}</p>
        </div>

        <div className="flex border-b border-slate-100 mx-6">
          <button 
            onClick={() => { setActiveTab('china'); setError(null); }}
            className={`flex-1 pb-2 text-xs font-bold flex items-center justify-center gap-1 ${activeTab === 'china' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
          >
            <MapPin size={14}/> {t.loginModeCn}
          </button>
          <button 
            onClick={() => { setActiveTab('global'); setError(null); }}
            className={`flex-1 pb-2 text-xs font-bold flex items-center justify-center gap-1 ${activeTab === 'global' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
          >
            <Globe size={14}/> {t.loginModeGlobal}
          </button>
        </div>

        <div className="p-8 pt-6 min-h-[300px]">
          {activeTab === 'china' && (
            <form onSubmit={handleCustomAuth} className="space-y-4 animate-in fade-in duration-300">
               <div>
                 <label className="text-[10px] text-slate-400 uppercase font-bold pl-1">{t.username}</label>
                 <input 
                   type="text" 
                   placeholder="e.g. echo_user" 
                   value={cnUser}
                   onChange={(e) => setCnUser(e.target.value)}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                   required
                 />
               </div>
               <div>
                 <label className="text-[10px] text-slate-400 uppercase font-bold pl-1">{t.password}</label>
                 <input 
                   type="password" 
                   placeholder="******" 
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
                 {loading ? "Connecting..." : (isCnRegister ? t.registerBtn : t.loginBtn)}
               </button>

               <div className="text-center">
                 <button type="button" onClick={() => setIsCnRegister(!isCnRegister)} className="text-xs text-slate-500 underline hover:text-blue-600">
                   {isCnRegister ? t.switchLogin : t.switchRegister}
                 </button>
               </div>
            </form>
          )}

          {activeTab === 'global' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G"/>
                <span>{t.googleLogin}</span>
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

        <div className="pb-6 border-t border-slate-50 bg-slate-50/50">
           <LegalFooter />
        </div>

      </motion.div>
    </div>
  );
};

// ==============================================================================
// 3. 🧠 思考指示器
// ==============================================================================
const ThinkingIndicator = ({ theme, text }) => (
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
      <span className={`text-xs ${theme.accent} font-mono tracking-widest font-bold`}>{text}</span>
    </div>
  </motion.div>
);


// ==============================================================================
// 4. 🚀 智能消息渲染器 (✅ 升级为无界宽屏+大行距阅读模式)
// ==============================================================================
// ==============================================================================
// 4. 🚀 智能消息渲染器 (✅ 极致美学排版：H3大间距 + Blockquote引用块)
// ==============================================================================
const AIResponseRenderer = ({ content, theme, t }) => {
  if (!content) return null;

  const cleanContent = content
    .replace(/^```json\s*/, '')
    .replace(/^```\s*/, '')
    .replace(/```$/, '')
    .trim();

  // 1️⃣ Quick Mode JSON
  // 1️⃣ Quick Mode JSON
  if (cleanContent.startsWith('{') && cleanContent.includes('"replies"')) {
    try {
      const data = JSON.parse(cleanContent);
      if (data.replies && Array.isArray(data.replies)) {
        return (
          <div className="space-y-4 w-full">
            <h4 className={`${theme.accent} text-sm font-bold tracking-wider mb-3 uppercase flex items-center gap-2`}>
              <Zap size={16} /> {t.aiTitles.quick}
            </h4>
            <div className="grid gap-4">
              {data.replies.map((reply, idx) => (
                <div key={idx} className={`${theme.card} p-5 rounded-xl border ${theme.border} hover:shadow-md transition-shadow relative group`}>
                  
                  {/* 🌟 顶部栏：标签 + 一键复制按钮 */}
                  <div className="flex justify-between items-start mb-2">
                    <div className={`text-xs font-bold ${theme.accent} uppercase tracking-widest opacity-80 mt-1`}>
                      {reply.type}
                    </div>
                    {/* 调用复制组件 */}
                    {reply.copy_text && <CopyButton text={reply.copy_text} theme={theme} />}
                  </div>

                  <div className={`${theme.textMain} text-[15px] md:text-base font-medium leading-[1.8]`}>
                    {reply.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    } catch (e) {}
  }

  // 🌟 统一定义极致排版的 Markdown Tailwind 样式类
  // 重点加了 prose-h3 (大标题间距) 和 prose-blockquote (精美点评框)
  const premiumMarkdownStyles = `
    text-[15px] md:text-base leading-[1.8] tracking-wide prose prose-slate max-w-none 
    prose-p:mb-5 
    prose-h3:text-[17px] md:prose-h3:text-[18px] prose-h3:font-bold prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-slate-800 
    prose-blockquote:not-italic prose-blockquote:border-l-[4px] prose-blockquote:border-slate-300 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-600 prose-blockquote:mt-3 prose-blockquote:mb-8
    prose-strong:text-slate-900 prose-strong:font-bold
  `;

  // 2️⃣ Master Mode XML
  if (content.includes(':::')) {
    const extract = (tag) => {
      const startTag = `:::${tag}:::`;
      const endTag = `:::END_${tag}:::`;
      if (!content.includes(startTag)) return null;
      const startIndex = content.indexOf(startTag) + startTag.length;
      let endIndex = content.indexOf(endTag);
      if (endIndex === -1) return content.substring(startIndex).trim();
      return content.substring(startIndex, endIndex).trim();
    };

    const analysis = extract('ANALYSIS');
    const action = extract('ACTION');
    const next = extract('NEXT');

    if (analysis || action || next) {
        return (
          <div className="space-y-8 w-full"> 
            
            {analysis && (
              <div className={`border-l-[4px] ${theme.borderHighlight} pl-5 py-1`}>
                <h4 className={`${theme.accent} text-sm font-bold tracking-widest mb-4 flex items-center gap-2 uppercase opacity-80`}>
                  <LayoutDashboard size={16} /> {t.aiTitles.analysis}
                </h4>
                <div className={`${theme.textMain} ${premiumMarkdownStyles}`}>
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </div>
            )}

            {action && (
              <div className={`${theme.card} p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-sm`}>
                <h4 className={`${theme.textMain} text-sm font-bold tracking-widest mb-4 flex items-center gap-2 uppercase`}>
                  <Zap size={16} className={theme.accent} fill="currentColor" /> {t.aiTitles.strategy}
                </h4>
                
                <div className={`${theme.textMain} ${premiumMarkdownStyles}`}>
                  {/* 🌟 利用正则按 Option 切割，并提取一键复制的内容 */}
                  {action.split(/(?=### 👉 Option)/).map((part, index) => {
                    if (!part.trim()) return null;
                    
                    // 提取 📋 **一键复制：** 后面到 💡 点评之前的内容
                    const copyMatch = part.match(/📋 \*\*一键复制：\*\*\n*([\s\S]*?)(?=\n*> \*\*💡 点评|$)/);
                    const copyText = copyMatch ? copyMatch[1].trim() : null;

                    // 把原文本里的复制提示隐藏掉，用我们漂亮的 UI 按钮代替
                    const displayPart = part.replace(/📋 \*\*一键复制：\*\*\n*[\s\S]*?(?=\n*> \*\*💡 点评|$)/, '');

                    return (
                      <div key={index} className="relative mb-8 last:mb-0 pb-6 border-b last:border-0 border-slate-100">
                        {/* 如果提取到了复制文本，在右上角渲染复制按钮 */}
                        {copyText && (
                          <div className="absolute right-0 top-0 mt-2">
                            <CopyButton text={copyText} theme={theme} />
                          </div>
                        )}
                        <ReactMarkdown>{displayPart}</ReactMarkdown>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {next && (
              <div className={`flex items-start gap-4 p-6 rounded-2xl border border-dashed ${theme.border} bg-opacity-30`}>
                <Target size={20} className={`${theme.accent} shrink-0 mt-1`} />
                <div className="w-full">
                  <div className={`font-bold ${theme.accent} text-sm mb-2 uppercase tracking-widest`}>{t.aiTitles.next}</div>
                  <div className={`${theme.textMain} ${premiumMarkdownStyles}`}>
                    <ReactMarkdown>{next}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  }

  // 3️⃣ Markdown Fallback
  return (
    <div className={`${theme.textMain} ${premiumMarkdownStyles}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

// ==============================================================================
// 🌟 尊享版黑金付费墙 (PaywallModal 3.0 - Premium UI)
// ==============================================================================
const PaywallModal = ({ isOpen, onClose, user, theme, onNotify }) => {
  const [activeTab, setActiveTab] = useState('sub'); 
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState({ loading: false, type: '', text: '' });

  const SUB_PLANS = [
    { id: '1_week', name: '1周体验', price: 24.9, save: null },
    { id: '1_month', name: '1个月', price: 49.9, save: null, highlight: true },
    { id: '3_months', name: '3个月', price: 128, save: 21.7 },
    { id: '6_months', name: '半年', price: 238, save: 61.4 },
    { id: '1_year', name: '1年', price: 398, save: 200.8 }
  ];

  const PPU_PLANS = [
    { id: '20_times', name: '20次加油包', price: 10 },
    { id: '50_times', name: '50次加油包', price: 20, highlight: true }
  ];

  const [selectedSub, setSelectedSub] = useState(SUB_PLANS[1]);
  const [selectedPpu, setSelectedPpu] = useState(PPU_PLANS[1]);

  if (!isOpen) return null;
  const currentSelection = activeTab === 'sub' ? selectedSub : selectedPpu;

  const handleNotify = async () => {
    setIsNotifying(true);
    try {
      await onNotify(currentSelection.name); 
      setNotifySuccess(true);
    } catch (e) {
      alert("网络异常，请稍后再试");
    } finally {
      setIsNotifying(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    setRedeemStatus({ loading: true, type: '', text: '' });
    try {
      const res = await fetch('https://echo-api-6d3i.onrender.com/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, code: redeemCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setRedeemStatus({ loading: false, type: 'success', text: data.message });
        setTimeout(() => { onClose(); }, 2500); 
      } else {
        setRedeemStatus({ loading: false, type: 'error', text: data.error });
      }
    } catch (e) {
      setRedeemStatus({ loading: false, type: 'error', text: '网络异常，请检查连接' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0F172A] border border-slate-700/50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh] text-slate-200"
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors z-10 bg-slate-800 p-1.5 rounded-full">
          <X size={18} />
        </button>

        {/* 头部黑金区域 */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-slate-800 to-[#0F172A] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
           <div className="flex items-center gap-3 relative z-10">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
               <Crown size={20} className="text-white" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-wide">升级 PRO 军师</h2>
               <p className="text-xs text-amber-400/80 mt-0.5">解锁完整高阶局势推演体系</p>
             </div>
           </div>
        </div>

        {/* 胶囊状 Tab 切换 */}
        <div className="px-6 mb-2">
           <div className="flex bg-slate-800 p-1 rounded-xl">
             {[
               { id: 'sub', label: '👑 会员订阅' },
               { id: 'ppu', label: '⚡️ 能源包' },
               { id: 'redeem', label: '🎁 兑换码' }
             ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setNotifySuccess(false); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab.id ? `bg-slate-700 text-amber-400 shadow-sm` : `text-slate-400 hover:text-slate-200`}`}
                >
                  {tab.label}
                </button>
             ))}
           </div>
        </div>

        {/* 核心内容区 */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Tab 1: 会员订阅 */}
          {activeTab === 'sub' && (
             <div className="space-y-3 animate-in fade-in duration-300">
                {SUB_PLANS.map(plan => (
                   <div 
                     key={plan.id}
                     onClick={() => setSelectedSub(plan)}
                     className={`relative border rounded-2xl p-4 cursor-pointer transition-all ${selectedSub.id === plan.id ? `border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5` : `border-slate-700 bg-slate-800/50 hover:border-slate-600`}`}
                   >
                      {plan.save && (
                         <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                           省 ¥{plan.save}
                         </div>
                      )}
                      <div className="flex justify-between items-center">
                         <div>
                            <div className={`font-bold ${selectedSub.id === plan.id ? 'text-amber-400' : 'text-slate-200'}`}>{plan.name}</div>
                            {plan.id === '1_month' && <div className="text-[10px] text-slate-500 mt-0.5">基础周期推荐</div>}
                         </div>
                         <div className={`text-lg font-bold ${selectedSub.id === plan.id ? 'text-white' : 'text-slate-300'}`}>
                           ¥{plan.price}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {/* Tab 2: 加油包 */}
          {activeTab === 'ppu' && (
             <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                {PPU_PLANS.map(plan => (
                   <div 
                     key={plan.id}
                     onClick={() => setSelectedPpu(plan)}
                     className={`border rounded-2xl p-5 cursor-pointer flex flex-col items-center justify-center text-center transition-all ${selectedPpu.id === plan.id ? `border-amber-500/50 bg-amber-500/10` : `border-slate-700 bg-slate-800/50 hover:border-slate-600`}`}
                   >
                      <div className={`text-2xl font-bold mb-1 ${selectedPpu.id === plan.id ? 'text-amber-400' : 'text-slate-200'}`}>¥{plan.price}</div>
                      <div className="text-xs font-medium text-slate-400">{plan.name}</div>
                   </div>
                ))}
             </div>
          )}

          {/* Tab 3: 兑换中心 */}
          {activeTab === 'redeem' && (
             <div className="py-2 space-y-4 animate-in fade-in duration-300">
                <div className="text-center mb-6">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-700">
                      <Gift size={24} className="text-amber-400" />
                   </div>
                   <h3 className="font-bold text-slate-200 text-sm">输入专属兑换码</h3>
                </div>
                
                <input 
                  type="text" 
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="ECHO-XXXX-XXXX"
                  className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-center font-mono font-bold text-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all tracking-wider placeholder-slate-600"
                />

                {redeemStatus.text && (
                  <div className={`text-xs text-center font-bold p-3 rounded-xl ${redeemStatus.type === 'error' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'}`}>
                    {redeemStatus.text}
                  </div>
                )}

                <button
                  onClick={handleRedeem}
                  disabled={redeemStatus.loading || !redeemCode.trim()}
                  className="w-full py-4 bg-amber-500 text-slate-900 font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {redeemStatus.loading ? "正在核销..." : "立即兑换"}
                </button>
             </div>
          )}

          {/* 收款逻辑区 */}
          {(activeTab === 'sub' || activeTab === 'ppu') && (
            <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col items-center animate-in fade-in">
                <div className="bg-white p-2 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] inline-block mb-4 relative">
                  <img 
                    src="/paycode.jpg" 
                    alt="微信收款码" 
                    className="w-36 h-36 object-contain rounded-xl"
                  />
                </div>
                
                <div className="text-xs font-bold text-amber-200 mb-1 bg-amber-500/20 px-4 py-1.5 rounded-lg border border-amber-500/30">
                  付款备注：{user?.displayName || user?.email || "未知账号"} + {currentSelection.name}
                </div>
                <div className="text-[10px] text-slate-400 mb-6 text-center mt-2">
                  支付 <span className="text-rose-400 font-bold">¥{currentSelection.price}</span> 后点击下方按钮。
                </div>

                {!notifySuccess ? (
                  <button 
                    onClick={handleNotify}
                    disabled={isNotifying}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:from-blue-500 hover:to-blue-400 disabled:opacity-70 transition-all flex justify-center items-center gap-2"
                  >
                    {isNotifying ? "提交中..." : "我已付款，通知作者开通"}
                  </button>
                ) : (
                  <div className="w-full py-4 rounded-xl font-bold text-emerald-400 bg-emerald-500/10 flex justify-center items-center gap-2 border border-emerald-500/20">
                    <CheckCircle2 size={18} /> 军师已收到提醒，稍后为您开通
                  </div>
                )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ==============================================================================
// 5. 主程序 (Echo Main)
// ==============================================================================
export default function EchoCoach() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // 🎨 主题 & 语言
  const [currentThemeId, setCurrentThemeId] = useState('royal');
  const [language, setLanguage] = useState('cn'); // 默认中文
  const t = TRANSLATIONS[language];
  
  const theme = THEMES[currentThemeId];
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // 📝 状态
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [mode, setMode] = useState('master');
  
  // 💰 [新增] 付费墙状态
  const [showPaywall, setShowPaywall] = useState(false);
  
  // 🤏 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // 💾 历史记录
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null); 

  const scrollRef = useRef(null);

  useEffect(() => {
    // 监听 Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setLoadingAuth(false);
        loadLocalHistory(user.uid);
      } else {
        if (!currentUser?.isCustomAuth) {
           setLoadingAuth(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loadLocalHistory = (uid) => {
      const saved = localStorage.getItem(`echo_history_${uid}`);
      if (saved) setChatHistory(JSON.parse(saved));
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  // --- 🔥 核心：文件处理 ---
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

  const handleImageUpload = (e) => { processFiles(e.target.files); if (fileInputRef.current) fileInputRef.current.value = ''; };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); };
  const removeImage = (index) => { setImages(prev => prev.filter((_, i) => i !== index)); };

  // --- 💾 会话管理 ---
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
      localStorage.setItem(`echo_history_${currentUser.uid}`, JSON.stringify(updatedHistory));
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
    if(currentUser) localStorage.setItem(`echo_history_${currentUser.uid}`, JSON.stringify(updatedHistory));
    if (currentSessionId === id) { setMessages([]); setCurrentSessionId(null); }
  };

  // --- 🚪 退出与注销 ---
  const handleLogout = () => {
    if (currentUser?.isCustomAuth) {
        setCurrentUser(null);
    } else {
        signOut(auth);
        setCurrentUser(null);
    }
    setMessages([]); setCurrentSessionId(null);
  };

  // 🔥 删除账号功能
  const handleDeleteAccount = async () => {
    const confirmMsg = t.deleteConfirm;
    if (!window.confirm(confirmMsg)) return;

    if (!currentUser || !currentUser.uid) return;

    try {
        const response = await fetch('https://echo-api-6d3i.onrender.com/api/auth/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: currentUser.uid })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Account deleted successfully.");
            localStorage.removeItem(`echo_history_${currentUser.uid}`); 
            handleLogout();
        } else {
            alert("Failed to delete account: " + (data.error || "Unknown error"));
        }
    } catch (e) {
        alert("Network error: " + e.message);
    }
  };

  // 💰 [升级] 调用付款通知 API (附带选中的套餐名)
  const handlePaymentNotify = async (pkgName) => {
    const res = await fetch('https://echo-api-6d3i.onrender.com/api/payment-notify', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: currentUser?.uid, 
        username: currentUser?.displayName || currentUser?.email || 'Unknown',
        package: pkgName
      })
    });
    if (!res.ok) throw new Error('通知失败');
  };

  // --- 📡 发送消息 ---
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

              // 🔴 监听后端的 Paywall 触发指令
              if (data.type === 'paywall_trigger') {
                  setShowPaywall(true); // 弹出收款码
                  setMessages(prev => prev.slice(0, -1)); // 撤回那个空白的加载气泡
                  break;
              }

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

  if (loadingAuth) return <div className="h-screen bg-white flex items-center justify-center text-slate-400 font-mono animate-pulse">INITIALIZING ECHO...</div>;
  
  if (!currentUser) return <LoginScreen onLogin={(user) => { 
      setCurrentUser(user); 
      if(user.preferredLang) setLanguage(user.preferredLang); 
      loadLocalHistory(user.uid); 
  }} initialLang={language} />;

  return (
    <div className={`flex h-screen ${theme.bg} ${theme.textMain} font-sans transition-colors duration-500 overflow-hidden`}>
      
      {/* 📱 Mobile Header */}
      <div className={`md:hidden fixed top-0 w-full h-14 border-b ${theme.border} ${theme.sidebar} z-50 flex items-center justify-between px-4`}>
         <span className="font-bold font-serif tracking-wide">{t.appName}</span>
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
            <span className="font-bold text-lg tracking-wide font-serif">{t.appName}</span>
          </div>
          <button className="md:hidden" onClick={() => setShowHistoryMobile(false)}><X size={20}/></button>
        </div>

        <div className="p-4 space-y-4">
            <button 
              onClick={handleNewChat}
              className={`w-full flex items-center justify-center gap-2 py-3 ${theme.accentBg} ${theme.accentHover} text-white rounded-xl transition-all shadow-md active:scale-95`}
            >
              <Plus size={18} />
              <span className="font-bold text-sm">{t.newSession}</span>
            </button>
        </div>

        {/* 📜 历史记录 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            <div className={`text-[10px] font-bold ${theme.textSub} uppercase tracking-widest px-2 mb-2`}>{t.archives}</div>
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
        <div className={`p-4 border-t ${theme.border} space-y-3`}>
            
            {/* 🌟 新增：常驻充值升级按钮 */}
            <button 
                onClick={() => setShowPaywall(true)}
                className={`w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg transition-all active:scale-95`}
            >
                <div className="flex items-center gap-2 font-bold text-sm">
                    <Crown size={16} className="text-amber-100" />
                    <span>升级 Pro 军师</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">特惠</span>
            </button>

             {/* 语言切换 */}
             <button 
                onClick={() => setLanguage(language === 'cn' ? 'en' : 'cn')}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-all text-xs font-bold ${theme.textMain}`}
             >
                <Globe size={14} />
                <span>{language === 'cn' ? 'Language: 中文' : 'Language: English'}</span>
             </button>

             {/* 主题切换 */}
             <div className="relative">
                <button 
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 transition-all text-xs font-bold ${theme.textMain}`}
                >
                    <div className="flex items-center gap-2">
                        <Palette size={14} />
                        <span>{t.theme}: {theme.name.split(' ')[0]}</span>
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
                            {Object.values(THEMES).map(th => (
                                <button
                                    key={th.id}
                                    onClick={() => { setCurrentThemeId(th.id); setShowThemeMenu(false); }}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${currentThemeId === th.id ? theme.accentBg + ' text-white' : 'hover:bg-black/5 ' + theme.textMain}`}
                                >
                                    <div className={`w-3 h-3 rounded-full border border-black/10`} style={{ backgroundColor: th.id === 'royal' ? '#60A5FA' : (th.id === 'matcha' ? '#5C9E76' : '#F2CC8F') }} />
                                    {th.name}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 用户信息与注销 */}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${theme.card} border ${theme.border}`}>
                {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} className="w-8 h-8 rounded-full border border-slate-200" alt="avatar"/>
                ) : (
                    <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center`}>
                        <User size={14} className={theme.textSub}/>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{currentUser.displayName || currentUser.email || "Commander"}</div>
                    <div className={`text-[10px] ${theme.textSub} truncate cursor-pointer hover:text-red-500`} onClick={handleDeleteAccount}>
                         {t.deleteAccount}
                    </div>
                </div>
                <button onClick={handleLogout} className={`${theme.textSub} hover:text-red-400`} title={t.logout}><LogOut size={16} /></button>
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
                 {t.modes[m]}
               </button>
             ))}
          </div>
          <div className={`flex items-center gap-2 text-xs ${theme.textSub}`}>
             <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
             {isThinking ? 'NEURAL ENGINE ACTIVE' : t.systemReady}
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
                 initial={{ opacity: 0, y: 15 }} 
                 animate={{ opacity: 1, y: 0 }}
                 // 如果是用户，靠右显示；如果是 AI，直接铺满全宽 (w-full)
                 className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
               >
                 {/* AI 不再限制宽度，铺满父级。用户保留 max-w-[75%] 宽度限制 */}
                 <div className={`flex flex-col ${msg.role === 'user' ? 'max-w-[90%] md:max-w-[75%] items-end' : 'w-full items-start'}`}>
                    
                    <span className={`text-[10px] mb-2 font-bold tracking-widest uppercase opacity-60 ${theme.textSub} px-2`}>
                        {msg.role === 'user' ? 'You' : 'Echo'}
                    </span>
                    
                    {/* 气泡样式区分：用户保留漂亮的气泡，AI 彻底去掉气泡和背景色，纯透明铺开 */}
                    <div className={`relative transition-colors duration-500 ${
                        msg.role === 'user' 
                          ? `rounded-3xl p-5 shadow-sm overflow-hidden ${theme.userBubble} ${theme.userText} rounded-tr-sm inline-block` 
                          : `w-full py-2 bg-transparent` 
                    }`}>
                        
                        {msg.images && msg.images.length > 0 && (
                          <div className="flex gap-2 mb-4">
                             {msg.images.map((img, idx) => (
                               <img key={idx} src={img} className="h-40 rounded-xl border border-white/20 object-cover shadow-sm" alt="upload" />
                             ))}
                          </div>
                        )}

                        {msg.role === 'assistant' 
                           ? (
                             <div className="w-full"> {/* 保证子组件也能 100% 伸展 */}
                               <AIResponseRenderer content={msg.content} theme={theme} t={t} />
                               {i === messages.length - 1 && isThinking && (
                                 <span className={`inline-block w-2 h-5 ml-1 align-middle ${theme.accentBg} animate-pulse`}/>
                               )}
                             </div>
                           )
                           : <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        }
                    </div>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>

           {isThinking && <ThinkingIndicator theme={theme} text={t.thinking} />}
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
                placeholder={t.inputPlaceholder}
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
                Echo AI Coach Beta | Powered by SiliconFlow
              </p>
           </div>
        </div>

      </div>

      {/* 🌟 挂载极简付费墙 */}
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        user={currentUser}
        theme={theme}
        onNotify={(pkgName) => handlePaymentNotify(pkgName)}
      />
    </div>
  );
}