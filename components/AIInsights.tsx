
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FuelRecord, Statistics } from '../types';

interface Props {
  records: FuelRecord[];
  stats: Statistics;
}

const AIInsights: React.FC<Props> = ({ records, stats }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAIAdvice = async () => {
    if (records.length === 0) return;
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `بناءً على سجل استهلاك السيارة:
      - متوسط التكلفة اليومية: ${stats.averageDailyPrice.toFixed(2)} جنيه مصري
      - إجمالي المسافة المقطوعة: ${stats.totalDistance} كم
      - عدد المشاوير المسجلة: ${stats.tripsCount}
      
      من فضلك قدم لي 3 نصائح عملية باللغة العربية لتقليل استهلاك الوقود بناءً على هذه الأرقام، مع توضيح كيف تؤثر المسافات الطويلة على "سعر اليوم" إذا كان البنزين يُحسب بمعادلة (المسافة / 12).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setInsight(response.text || "عذراً، لم أتمكن من استخلاص نصائح حالياً.");
    } catch (err) {
      console.error(err);
      setInsight("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl shadow-xl text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-400/30">
          <i className="fas fa-lightbulb text-emerald-400 text-xl"></i>
        </div>
        <h3 className="font-bold text-lg">تحليل ذكي لمصاريفك</h3>
      </div>
      
      {insight ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/10">
            {insight}
          </div>
          <button 
            onClick={() => setInsight(null)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <i className="fas fa-redo text-[10px]"></i>
            تحديث النصائح
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            الذكاء الاصطناعي يحلل بيانات مشاويرك ويقترح عليك طرقاً للتوفير.
          </p>
          <button 
            disabled={loading || records.length === 0}
            onClick={getAIAdvice}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              records.length === 0 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
            }`}
          >
            {loading ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              <i className="fas fa-robot"></i>
            )}
            {records.length === 0 ? 'سجل أول مشوار لتفعيل الميزة' : 'حلل بياناتي الآن'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
