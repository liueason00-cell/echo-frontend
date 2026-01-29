import React, { useState, useEffect, useRef } from 'react';
  
// --- 图标组件 ---
const ClipboardIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM5 11a1 1 0 100 2h4a1 1 0 100-2H5z" />
  </svg>
);
  
const ImageIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <path d="m21 15-5-5L5 21"></path>
  </svg>
);
  
const ButtonSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
  
// --- 全新的、高级感的加载指示器 ---
const AdvancedLoadingIndicator = ({ message }) => {
  const loadingMessages = [
    "正在分析当前对话上下文...", 
    "评估当前关系温度...", 
    "匹配"大师宪法"核心框架...",
    "构建即时回复策略...", 
    "规划长期战略部署...",
  ];
  const currentIndex = loadingMessages.indexOf(message);
  
  return (
    <div className="flex flex-col items-center justify-center text-center h-full gap-8 animate-fade-in-up">
      <div className="flex items-center justify-center gap-2">
        {loadingMessages.map((msg, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${index <= currentIndex ? 'bg-[#4299e1] scale-125' : 'bg-gray-300'}`}
          ></div>
        ))}
      </div>
      <p className="text-base text-[#718096] transition-opacity duration-300">{message}</p>
    </div>
  );
};
  
  
// --- 主应用组件 ---
export default function App() {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [aiResponse, setAiResponse] = useState({ immediateReply: [], coachInsight: { content: '' } });
  const [showInsight, setShowInsight] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  
  const loadingIntervalRef = useRef(null);
  const outputRef = useRef(null);
  
  // 滚动到底部
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTo({
        top: outputRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [aiResponse.coachInsight.content, aiResponse.immediateReply.length > 0 ? aiResponse.immediateReply[aiResponse.immediateReply.length - 1] : null, isLoading, error, showInsight]);
  
  // --- 核心修复：采用Claude建议的健壮的流式处理逻辑 ---
  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setError(null);
    setAiResponse({ immediateReply: [], coachInsight: { content: '' } });
    setShowInsight(false);
    const loadingMessages = [
      "正在分析当前对话上下文...", 
      "评估当前关系温度...", 
      "匹配"大师宪法"核心框架...",
      "构建即时回复策略...", 
      "规划长期战略部署...",
    ];
    let msgIndex = 0;
    setLoadingMessage(loadingMessages[msgIndex]);
    loadingIntervalRef.current = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 2500);
    
    try {
      const response = await fetch('http://localhost:3000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      // ✅ 使用局部变量跟踪最新的回复状态，通过引用更新而非闭包
      let replyState = {
        immediateReply: [],
        coachInsight: { content: '' }
      };
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf('\n\n');
        
        while (boundary !== -1) {
          const chunkStr = buffer.substring(0, boundary);
          buffer = buffer.substring(boundary + 2);
          
          if (chunkStr.startsWith('data: ')) {
            try {
              const dataStr = chunkStr.substring(6);
              if (dataStr.trim() === '[DONE]') {
                setAiResponse(replyState);
                return;
              }
              
              const chunk = JSON.parse(dataStr);
              
              switch (chunk.type) {
                case 'newImmediateReply':
                  // ✅ 直接在本地状态中添加新回复
                  replyState.immediateReply.push('');
                  setAiResponse({ ...replyState });
                  break;
                case 'immediateReply':
                  // ✅ 总是追加到最后一条回复
                  if (replyState.immediateReply.length > 0) {
                    const lastIndex = replyState.immediateReply.length - 1;
                    replyState.immediateReply[lastIndex] += chunk.content;
                    setAiResponse({ ...replyState });
                  }
                  break;
                case 'coachInsight':
                  // ✅ 累加教练洞察
                  replyState.coachInsight.content += chunk.content;
                  setAiResponse({ ...replyState });
                  break;
                case 'done':
                  setAiResponse(replyState);
                  return;
              }
            } catch (e) {
              console.warn("Parse error:", e.message);
              // Ignore parse errors, wait for more data
            }
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "抱歉，教练暂时无法连接，请检查您的网络和后端服务后重试。");
    } finally {
      setIsLoading(false);
      clearInterval(loadingIntervalRef.current);
    }
  };
  
  const handleCopy = (text, index) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
  };
  
  const renderOutput = () => {
    if (isLoading) {
      return <AdvancedLoadingIndicator message={loadingMessage} />;
    }
    
    if (error) {
      return (
        <div className="text-center text-[#e53e3e] p-6 rounded-lg bg-[#fff5f5] animate-fade-in-up">
          {error}
        </div>
      );
    }
    
    const hasResponse = aiResponse.immediateReply.length > 0 || aiResponse.coachInsight.content;
    
    if (!hasResponse) {
      return (
        <div className="text-center text-[#718096] p-4">
          <h2 className="text-2xl font-semibold text-[#1a202c]">你好，我是你的AI情感教练。</h2>
          <p className="mt-2">遇到了什么沟通难题？</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* 即刻回复部分 */}
        {aiResponse.immediateReply.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in-up">
            <h3 className="text-lg font-bold text-[#1a202c] mb-6 tracking-wide">
              即刻回复
            </h3>
            <div className="space-y-4">
              {aiResponse.immediateReply.map((reply, index) => (
                <div key={index} className="flex items-start gap-4">
                  <span className="text-[#4299e1] font-bold shrink-0 mt-1">•</span>
                  <div className="flex-1 flex items-start justify-between gap-4">
                    <p className="text-[#1a202c] leading-relaxed flex-grow">
                      {reply}
                    </p>
                    <button
                      onClick={() => handleCopy(reply, index)}
                      className="text-gray-400 hover:text-[#4299e1] transition-colors shrink-0 p-1"
                      title="复制建议"
                    >
                      {copiedIndex === index ? (
                        <span className="text-xs font-semibold text-[#4299e1]">已复制</span>
                      ) : (
                        <ClipboardIcon />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 长期战略与洞察部分 */}
        {aiResponse.coachInsight.content && (
          <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in-up transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1a202c] tracking-wide">
                长期战略与洞察
              </h3>
              {!showInsight && (
                <button
                  onClick={() => setShowInsight(true)}
                  className="text-sm text-[#4299e1] hover:text-[#2b6cb0] font-semibold transition"
                >
                  展开
                </button>
              )}
            </div>
            
            {showInsight && (
              <>
                <div className="text-[#1a202c] leading-relaxed space-y-4 mb-8">
                  {aiResponse.coachInsight.content.split('\n\n').map((paragraph, idx) => (
                    paragraph.trim() && (
                      <p key={idx} className="text-[#1a202c] leading-relaxed">
                        {paragraph.trim()}
                      </p>
                    )
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#4299e1] rounded-lg shadow hover:bg-[#2b6cb0] transition">
                    保存为卡片
                  </button>
                  <button className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#2b6cb0] bg-blue-100 rounded-lg hover:bg-blue-200 transition">
                    继续提问
                  </button>
                  <button
                    onClick={() => setShowInsight(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    收起
                  </button>
                </div>
              </>
            )}
            
            {!showInsight && (
              <div className="text-sm text-[#718096] italic">
                点击展开查看完整的战略建议...
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="描述你的情况..."
            className="w-full p-4 rounded-lg border focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? <ButtonSpinner /> : '提交'}
          </button>
        </div>
        
        <div ref={outputRef} className="overflow-auto">
          {renderOutput()}
        </div>
      </div>
    </div>
  );
}