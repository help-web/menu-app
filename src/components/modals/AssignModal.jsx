import { useState, useRef } from 'react';
import { X, Calendar, Store, Camera, MessageSquareText, Users, Clock, CreditCard, Tag } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getFormattedDateWithDay, formatEventDateDisplay } from '../../utils/helpers.js';


export default function AssignModal({ event, restaurants, onAssign, onAssignPerRow, onClose, onCopy, showToast }) {
  const captureRef = useRef(null);
  const dataList = event.resData || [];
  const [perRowMode, setPerRowMode] = useState(false);
  const [perRowAssignments, setPerRowAssignments] = useState(() => dataList.map(r => r.assignedRestaurantId || ''));

  const handleImageCopy = async () => {
    if (!captureRef.current) return;
    try {
      showToast('이미지 생성 중...');
      const el = captureRef.current;
      const clone = el.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.zIndex = '-1';
      clone.style.width = `${el.offsetWidth}px`;
      const scrollables = clone.querySelectorAll('[class*="max-h-"], [class*="overflow-y-auto"], [class*="overflow-auto"]');
      scrollables.forEach(node => {
        node.style.maxHeight = 'none';
        node.style.overflow = 'visible';
      });
      document.body.appendChild(clone);
      const canvas = await html2canvas(clone, { backgroundColor: '#ffffff', scale: 2, logging: false, useCORS: true });
      document.body.removeChild(clone);
      canvas.toBlob(async (blob) => {
        try { const data = [new ClipboardItem({ 'image/png': blob })]; await navigator.clipboard.write(data); showToast('복사되었습니다.'); }
        catch (err) { /* Fallback */ }
      }, 'image/png');
    } catch (error) { showToast('이미지 생성 실패'); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in font-black">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-10 overflow-hidden animate-in zoom-in-95 border border-white/20 shadow-stone-900/40">
        <div className="flex justify-between items-start mb-8"><div><h3 className="text-2xl font-black text-stone-800">예약 신청 내역</h3><p className="text-sm text-stone-400 font-bold mt-1">상세 정보를 확인하고 배정하세요.</p></div><button onClick={onClose} className="p-2 text-stone-300 hover:bg-stone-50 rounded-full transition"><X/></button></div>
        <div ref={captureRef} className="bg-stone-100 p-6 rounded-2xl mb-8 min-w-[720px]">
          <header className="mb-6">
            <h4 className="text-xl font-black text-stone-900 tracking-tight mb-1">예약 신청 내역</h4>
            <h5 className="text-2xl font-black text-stone-900 tracking-tight mb-4">{event.orgName}</h5>
            <p className="text-sm text-stone-600 font-bold">
              담당: {event.manager} | {event.contact} | 일정: {event.date && event.date.includes(',') ? formatEventDateDisplay(event.date) : getFormattedDateWithDay(event.date)}
            </p>
          </header>
          <div className="space-y-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {dataList.map((item, idx) => {
              const selectedRest = restaurants.find(r => r.id === item.restaurantId);
              return (
              <div key={item.id || idx} className="bg-white rounded-xl p-5 shadow-md shadow-stone-200/60 border border-stone-100 relative">
                <span className="absolute top-4 right-4 bg-teal-500 text-white text-xs font-black px-3 py-1.5 rounded-full">확인 대기</span>
                <div className="flex items-center gap-2 mb-4 pr-24">
                  <Calendar size={20} className="text-stone-500 shrink-0" />
                  <span className="text-base font-black text-stone-900">{getFormattedDateWithDay(item.date)}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">인원 / 시간</p>
                    <div className="space-y-1 text-sm font-bold text-stone-800">
                      <div className="flex items-center gap-1.5"><Users size={16} className="text-stone-500 shrink-0" />{item.headcount}명</div>
                      <div className="flex items-center gap-1.5"><Clock size={16} className="text-stone-500 shrink-0" />{item.arrivalTime}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">종류 / 결제</p>
                    <div className="space-y-1 text-sm font-bold text-stone-800">
                      <div className="flex items-center gap-1.5"><CreditCard size={16} className="text-stone-500 shrink-0" />종류: {item.menuType}</div>
                      <div className="flex items-center gap-1.5"><CreditCard size={16} className="text-stone-500 shrink-0" />결제: {item.paymentMethod.split(' ')[0]}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 pt-4 mt-4 border-t border-stone-100">
                  <div className="flex items-start gap-2">
                    <Tag size={18} className="text-stone-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-0.5">희망 식당:</p>
                      <p className="text-sm font-black text-teal-600">{selectedRest?.name || '미지정'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquareText size={18} className="text-stone-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-0.5">요청 사항:</p>
                      <p className="text-sm text-stone-700 font-bold leading-relaxed">{item.note || '없음'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
        <div className="space-y-4">
           <button onClick={handleImageCopy} className="w-full bg-stone-900 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-lg"><Camera size={14}/> 이미지 복사</button>
           <div className="h-px bg-stone-100"></div>
           {!perRowMode ? (
             <div className="space-y-3">
               <p className="text-xs font-black text-stone-400 uppercase tracking-widest px-1 flex items-center gap-2 font-bold"><Store size={14}/> 단일 식당 배정</p>
               <p className="text-[10px] text-stone-500 font-bold">모든 일정에 동일한 식당을 배정합니다.</p>
               <div className="grid grid-cols-2 gap-2">
                 {restaurants.map(rest => (<button key={rest.id} onClick={() => onAssign(event.id, rest.id)} className="bg-stone-50 border border-stone-100 p-3 rounded-2xl text-center group hover:border-emerald-500 hover:bg-white transition-all shadow-sm font-bold"><span className="text-stone-700 text-xs">{rest.name}</span></button>))}
               </div>
               {dataList.length > 1 && (
                 <button onClick={() => { setPerRowMode(true); setPerRowAssignments(dataList.map(r => r.assignedRestaurantId || '')); }} className="w-full py-3 mt-2 text-emerald-600 font-black text-xs hover:bg-emerald-50 rounded-2xl flex items-center justify-center gap-1 transition border border-dashed border-emerald-200"><Calendar size={14}/> 일자별로 식당 다르게 배정하기</button>
               )}
             </div>
           ) : onAssignPerRow ? (
             <div className="space-y-3 animate-in slide-in-from-right-4">
               <div className="flex justify-between items-center"><p className="text-xs font-black text-emerald-600 uppercase tracking-widest px-1 flex items-center gap-2 font-bold"><Calendar size={14}/> 일자별 식당 배정</p><button onClick={() => setPerRowMode(false)} className="text-[10px] text-stone-400 underline">돌아가기</button></div>
               <p className="text-[10px] text-stone-500 font-bold">신청 건별로 배정하면 주문서도 각각 발송됩니다.</p>
               <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                 {dataList.map((item, idx) => {
                   const selectedRest = restaurants.find(r => r.id === perRowAssignments[idx]);
                   return (
                     <div key={item.id || idx} className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex flex-wrap items-center gap-2">
                       <span className="text-xs font-black text-stone-600 shrink-0">일정 {idx + 1}</span>
                       <span className="text-[10px] text-stone-400 font-bold shrink-0">{getFormattedDateWithDay(item.date)} · {item.headcount}명</span>
                       <select className="flex-1 min-w-[120px] bg-white border border-stone-200 rounded-lg p-2 text-xs font-bold" value={perRowAssignments[idx] || ''} onChange={e => setPerRowAssignments(prev => prev.map((v, i) => i === idx ? e.target.value : v))}>
                         <option value="">식당 선택</option>
                         {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                       </select>
                       {selectedRest && <span className="text-[10px] text-emerald-600 font-bold">{selectedRest.name}</span>}
                     </div>
                   );
                 })}
               </div>
               <button onClick={() => { const resDataWithAssignments = dataList.map((r, i) => ({ ...r, assignedRestaurantId: perRowAssignments[i] || null })); onAssignPerRow(event.id, resDataWithAssignments); }} className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-black text-xs shadow-lg">일자별 배정 완료</button>
             </div>
           ) : null}
        </div>
      </div>
    </div>
  );
}
