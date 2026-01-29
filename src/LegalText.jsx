// src/components/LegalText.jsx
import React, { useState } from 'react';
import { X, ShieldCheck, ScrollText } from 'lucide-react';

export default function LegalFooter() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-full text-center mt-4">
      <p className="text-[10px] text-slate-400 opacity-80">
        登录/注册即代表您同意 
        <button 
          onClick={() => setShowModal(true)} 
          className="ml-1 text-blue-500 hover:text-blue-600 underline font-medium"
        >
          《用户协议与隐私政策》
        </button>
      </p>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <ScrollText size={18} className="text-blue-600"/>
                <span>真我 (Zhenwo) AI 用户协议与隐私政策</span>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            {/* Content Scroll Area */}
            <div className="px-8 py-6 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-6">
              <div className="text-center pb-2 border-b border-dashed border-slate-200">
                <p className="font-bold text-slate-800 text-sm">版本更新日期：2026年01月29日</p>
                <p className="mt-1">提示：如你勾选并开始使用本应用，即视为你已接受本协议全部内容。</p>
              </div>

              <section>
                <h4 className="font-bold text-slate-900 mb-2 text-sm">一、 服务说明</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>产品属性：</strong>本应用是由个人开发者提供的 AI 情感咨询实验项目，目前处于 MVP（测试迭代）阶段。</li>
                  <li><strong>不稳定性声明：</strong>服务可能会随时出现中断、延迟或临时下线。开发者不对服务的持续性做绝对承诺。</li>
                  <li><strong>未成年人限制：</strong>本产品仅限 <strong>18 周岁及以上</strong> 的成年人使用。如你未成年，请立即退出。</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-slate-900 mb-2 text-sm">二、 免责声明（重要！）</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>非专业建议：</strong>AI 生成内容不代表医疗诊断或心理咨询意见。</li>
                  <li><strong>结果自担：</strong>你基于 AI 建议所做出的任何决定（如分手、表白、转账），后果由你本人承担。</li>
                  <li><strong>内容真实性：</strong>AI 可能会产生“幻觉”，请保持独立理性判断。</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-slate-900 mb-2 text-sm">三、 用户行为规范</h4>
                <p>不得输入或生成：煽动危害国家安全言论；色情暴力违法信息；侵犯他人隐私内容；恶意攻击/注入指令。</p>
                <p className="mt-1 text-red-500">一经发现违法行为，开发者有权封禁账号并保留移交司法机关的权利。</p>
              </section>

              <section>
                <h4 className="font-bold text-slate-900 mb-2 text-sm">四、 隐私与数据处理</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>收集范围：</strong>注册信息及聊天记录（用于记忆上下文）。</li>
                  <li><strong>去标识化：</strong>我们会对原始数据进行脱敏处理。</li>
                  <li><strong>提醒：</strong>请勿在对话中泄露真实姓名、身份证号、银行卡号等高敏感隐私。</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-slate-900 mb-2 text-sm">五、 知识产权</h4>
                <p>界面设计与代码归开发者所有。你授权开发者在匿名化前提下，使用相关语料用于模型优化。</p>
              </section>

              <section>
                <h4 className="font-bold text-slate-900 mb-2 text-sm">六、 联系方式</h4>
                <p>邮箱：liuyisen2024@163.com | 微信：Echo-20250129</p>
              </section>
            </div>

            {/* Footer Button */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-all shadow-lg"
              >
                我已阅读并接受
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}