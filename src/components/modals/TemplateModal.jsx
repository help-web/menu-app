import { useState } from 'react';
import { X, Layout } from 'lucide-react';
import {
  DEFAULT_RESERVATION_TEMPLATE,
  DEFAULT_ORDER_TEMPLATE,
  DEFAULT_GLOBAL_NOTICE,
  DEFAULT_ASSIGN_TITLE,
  DEFAULT_ASSIGN_DESC,
} from '../../data/initialData.js';

export default function TemplateModal({ resT, orderT, noticeT, assignT, assignD, onSave, onClose }) {
  const [rt, setRt] = useState(resT || DEFAULT_RESERVATION_TEMPLATE);
  const [ot, setOt] = useState(orderT || DEFAULT_ORDER_TEMPLATE);
  const [nt, setNt] = useState(noticeT || DEFAULT_GLOBAL_NOTICE);
  const [at, setAt] = useState(assignT || DEFAULT_ASSIGN_TITLE);
  const [ad, setAd] = useState(assignD || DEFAULT_ASSIGN_DESC);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-10 grid grid-cols-1 md:grid-cols-2 gap-8 border border-white/20 animate-in zoom-in-95 shadow-stone-900/40 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="md:col-span-2 flex justify-between items-center mb-2"><h3 className="text-2xl font-black text-stone-800 flex items-center gap-2"><Layout className="text-emerald-600"/> 문구 및 전역 공지 설정</h3><button onClick={onClose} className="p-2 text-stone-300 hover:bg-stone-50 rounded-full transition"><X/></button></div>

        <div className="space-y-3 md:col-span-2">
           <label className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">전역 공지 사항 (예약 신청 페이지 상단 노출)</label><textarea className="w-full h-24 bg-emerald-50/30 border-2 border-emerald-100 rounded-3xl p-6 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold resize-none leading-relaxed shadow-inner" value={nt} onChange={e => setNt(e.target.value)} placeholder="모든 고객에게 공통으로 보여질 안내 문구" />
        </div>

        <div className="space-y-3">
           <label className="text-xs font-black text-blue-600 uppercase tracking-widest">1단계: 예약 가이드 양식</label><textarea className="w-full h-40 bg-stone-50 border-2 border-stone-100 rounded-3xl p-6 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 font-bold resize-none leading-relaxed shadow-inner" value={rt} onChange={e => setRt(e.target.value)} />
        </div>

        <div className="space-y-3">
           <label className="text-xs font-black text-emerald-600 uppercase tracking-widest">2단계: 메뉴 취합 가이드 양식</label><textarea className="w-full h-40 bg-stone-50 border-2 border-stone-100 rounded-3xl p-6 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold resize-none leading-relaxed shadow-inner" value={ot} onChange={e => setOt(e.target.value)} />
        </div>

        <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-black text-purple-600 uppercase tracking-widest">사용자 주문 페이지 상단 문구 설정</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><span className="text-[10px] text-stone-400 font-bold">제목 (예: 지점 배정 완료!)</span><input className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 text-sm font-bold" value={at} onChange={e => setAt(e.target.value)} /></div>
                <div className="space-y-1"><span className="text-[10px] text-stone-400 font-bold">설명 (예: 확정된 지점에 맞춰...)</span><input className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 text-sm font-bold" value={ad} onChange={e => setAd(e.target.value)} /></div>
            </div>
        </div>

        <div className="md:col-span-2 flex gap-4 mt-4"><button onClick={onClose} className="flex-1 bg-stone-100 py-5 rounded-[1.5rem] font-black text-stone-400">취소</button><button onClick={() => onSave(rt, ot, nt, at, ad)} className="flex-[2] bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black active:scale-95 transition shadow-lg">설정 내용 전체 저장</button></div>
      </div>
    </div>
  );
}
