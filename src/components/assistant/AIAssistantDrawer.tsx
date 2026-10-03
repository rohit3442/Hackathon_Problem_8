import React, { useState } from 'react';
import { Drawer } from '../common/Drawer';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Send, Bot, User, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: { label: string; href?: string; onClick?: () => void }[];
}

export const AIAssistantDrawer: React.FC = () => {
  const { isAiAssistantOpen, setIsAiAssistantOpen } = useApp();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your Eco Metrics ESG Copilot. I can help analyze BRSR readiness, flag validation anomalies, summarize Scope 1/2/3 greenhouse emissions, or draft indicator responses compliant with SEBI BRSR guidelines.`,
      timestamp: 'Just now',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    'Show validation anomalies & outliers',
    'Which projects require review right now?',
    'Summarize FY 2025-26 ESG performance',
    'Explain BRSR Principle 6 requirements',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let actions: ChatMessage['actions'] = [];

      const query = text.toLowerCase();
      if (query.includes('anomal') || query.includes('outlier') || query.includes('warning') || query.includes('error')) {
        reply = `I analyzed 4 active validation records in the Validation Center:\n\n1. **Effluent BOD Concentration (WWRP-02)**: Reported at 38.4 mg/L vs CPCB consent limit of 30 mg/L (Critical Error).\n2. **Scope 3 Supply Chain Logistics (SMP-500)**: Subcontractor logs used DEFRA 2024 instead of Indian CEA grid factors (Warning).\n3. **Labor Turnover Spike (GH2-01)**: Turnover jumped to 42.6% due to demobilization of specialized piping labor. Justification required.\n\nRecommendation: Review the BOD reading with plant EHS leads before finalizing the BRSR submission.`;
        actions = [{ label: 'Go to Validation Center', href: '/validation' }];
      } else if (query.includes('project') || query.includes('review') || query.includes('pending')) {
        reply = `There are currently **3 project submissions** awaiting review in the approval chain:\n\n• **Solar Mega-Park 500MW (SMP-500)**: Environmental data approved by BU & Subsidiary, currently under Group ESG Team validation.\n• **Green Hydrogen Pilot (GH2-01)**: Social data flagged for correction by BU Manager.\n• **Urban Metro Line 3 (METRO-L3)**: Governance disclosures validated and awaiting Group Executive final signoff.`;
        actions = [{ label: 'Open Approval Center', href: '/approvals' }];
      } else if (query.includes('performance') || query.includes('summary') || query.includes('fy 2025-26') || query.includes('emissions')) {
        reply = `**FY 2025-26 ESG Executive Highlights (Consolidated):**\n\n• **GHG Emissions**: Scope 1 fell by 8.33% to 14,850 tCO2e; Scope 2 decreased by 14.2% to 28,400 tCO2e.\n• **Clean Energy**: Renewable electricity captive share reached 46.8% (surpassing the 45% annual target).\n• **Water Stewardship**: Recycled/reused water ratio achieved 58.4% with Zero Liquid Discharge at key sites.\n• **Safety & Workforce**: LTIFR lowered to 0.12 with zero fatalities across 18.4 million man-hours.\n• **BRSR Readiness**: Overall reporting readiness stands at 87% across all 9 Principles.`;
        actions = [{ label: 'View ESG Analytics', href: '/analytics' }, { label: 'Generate BRSR Report', href: '/reports' }];
      } else if (query.includes('principle 6') || query.includes('p6') || query.includes('environment')) {
        reply = `**BRSR Principle 6 (Environment & Climate)** comprises 12 Essential and 8 Leadership indicators:\n\n• **Essential**: Energy consumption (P6-E1), Water withdrawal (P6-E3), Air emissions (P6-E4), and Scope 1 & 2 GHG emissions (P6-E5).\n• **Leadership**: Scope 3 value-chain breakdown (P6-L1), Biodiversity assessments, and Extended Producer Responsibility (EPR).\n• **Assurance Status**: DNV India has issued a reasonable assurance statement for BRSR Core P6 metrics.`;
        actions = [{ label: 'Open BRSR Section C', href: '/brsr/section-c' }];
      } else {
        reply = `Based on your request regarding "${text}", I have cross-referenced the current ESG repository and SEBI BRSR rulebook. All data points in this scope are aligned with ISO 14064 GHG verification protocols and GRI Universal Standards 2021. Would you like me to inspect specific indicators or compile an executive summary?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions,
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <Drawer
      isOpen={isAiAssistantOpen}
      onClose={() => setIsAiAssistantOpen(false)}
      title="AI ESG Assistant"
      subtitle="Context-aware Copilot for SEBI BRSR & ESG workflows"
      width="lg"
    >
      <div className="flex flex-col h-full -mx-6 -my-5">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-[#0c1411]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-[#141f1b] border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs rounded-tl-xs whitespace-pre-line'
                }`}
              >
                {msg.text}

                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2">
                    {msg.actions.map((act, i) => (
                      <a
                        key={i}
                        href={act.href || '#'}
                        onClick={() => setIsAiAssistantOpen(false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-semibold rounded-md transition-colors"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
                <span className={`text-[10px] block mt-1.5 opacity-60 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </span>
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-11">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] ml-1">Analyzing ESG rulebook...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="p-3 bg-white dark:bg-[#0f1714] border-t border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 text-[11px] font-medium rounded-lg border border-slate-200/80 dark:border-slate-700 transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-[#0f1714] border-t border-slate-100 dark:border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask ESG Copilot (e.g. 'Explain Scope 2 market vs location')..."
              className="flex-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Button type="submit" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </Drawer>
  );
};
