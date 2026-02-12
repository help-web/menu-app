import { useState } from 'react';
import { Plus, Trash2, X, Calendar, Users, Store, Bell, Link as LinkIcon, Send, ClipboardList, RefreshCcw, Layout } from 'lucide-react';
import { getFormattedDateWithDay, formatEventDateDisplay, serializeDateEntries } from '../utils/helpers.js';

const defaultDateEntries = () => [{ id: Date.now(), type: 'range', start: '', end: '' }];

export default function EventSection({ events, restaurants, onAdd, onDelete, onReset, onOpenLinkModal, onOpenAssign, onOpenOrder, onOpenTemplate, generateLink }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ orgName: '', manager: '', contact: '', dateEntries: defaultDateEntries() });

  const addDateRange = () => setForm(f => ({ ...f, dateEntries: [...f.dateEntries, { id: Date.now(), type: 'range', start: '', end: '' }] }));
  const addSingleDate = () => setForm(f => ({ ...f, dateEntries: [...f.dateEntries, { id: Date.now(), type: 'single', date: '' }] }));
  const removeDateEntry = (id) => setForm(f => ({ ...f, dateEntries: f.dateEntries.length > 1 ? f.dateEntries.filter(e => e.id !== id) : f.dateEntries }));
  const updateDateEntry = (id, field, value) => setForm(f => ({
    ...f,
    dateEntries: f.dateEntries.map(e => e.id === id ? { ...e, [field]: value } : e),
  }));

  const handleSubmit = () => {
    if (!form.orgName) return;
    const date = serializeDateEntries(form.dateEntries);
    if (!date) return;
    onAdd({ orgName: form.orgName, manager: form.manager, contact: form.contact, date });
    setShowAdd(false);
    setForm({ orgName: '', manager: '', contact: '', dateEntries: defaultDateEntries() });
  };

  const displayDate = (dateStr) => (dateStr && dateStr.includes(',')) ? formatEventDateDisplay(dateStr) : getFormattedDateWithDay(dateStr);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in font-black w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="min-w-0"><h2 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight break-words">행사 예약 리스트</h2><p className="text-xs sm:text-sm text-stone-400 font-bold mt-1 uppercase tracking-widest opacity-60">Status Tracking Console</p></div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"><button type="button" onClick={onOpenTemplate} className="w-full sm:w-auto bg-white text-stone-600 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 transition shadow-sm min-w-0"><Layout size={16} className="sm:w-[18px] sm:h-[18px] text-emerald-600 shrink-0"/> <span className="truncate">문구 및 공지 관리</span></button><button type="button" onClick={() => setShowAdd(!showAdd)} className="w-full sm:w-auto bg-stone-900 text-white px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg min-w-0">{showAdd ? <X size={18}/> : <Plus size={18}/>} 새 행사 등록</button></div>
      </div>
      {showAdd && (
        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-stone-100 grid grid-cols-1 gap-4 sm:gap-6 animate-in slide-in-from-top-4 font-black w-full min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-1 min-w-0"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">기관명</label><input className="w-full min-w-0 bg-stone-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 transition shadow-inner font-bold" value={form.orgName} onChange={e => setForm({...form, orgName: e.target.value})} /></div>
            <div className="space-y-1 min-w-0"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">담당자</label><input className="w-full min-w-0 bg-stone-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 transition shadow-inner font-bold" value={form.manager} onChange={e => setForm({...form, manager: e.target.value})} /></div>
            <div className="space-y-1 min-w-0 sm:col-span-2 md:col-span-1"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">연락처</label><input className="w-full min-w-0 bg-stone-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 transition shadow-inner font-bold" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} /></div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1 block">날짜 (범위 + 단일 날짜)</label>
            {form.dateEntries.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center gap-2 p-3 sm:p-4 bg-stone-50 rounded-xl border border-stone-100 min-w-0">
                {entry.type === 'range' ? (
                  <>
                    <input type="date" className="w-full min-w-0 sm:w-auto bg-white border-none rounded-lg p-2 sm:p-2.5 text-sm font-bold shadow-inner focus:ring-2 focus:ring-emerald-500 flex-1 sm:flex-none" value={entry.start} onChange={e => updateDateEntry(entry.id, 'start', e.target.value)} />
                    <span className="text-stone-400 font-black shrink-0">~</span>
                    <input type="date" className="w-full min-w-0 sm:w-auto bg-white border-none rounded-lg p-2 sm:p-2.5 text-sm font-bold shadow-inner focus:ring-2 focus:ring-emerald-500 flex-1 sm:flex-none" value={entry.end} onChange={e => updateDateEntry(entry.id, 'end', e.target.value)} />
                    <span className="text-[10px] text-stone-500 font-bold shrink-0">범위</span>
                  </>
                ) : (
                  <>
                    <input type="date" className="w-full min-w-0 sm:w-auto bg-white border-none rounded-lg p-2 sm:p-2.5 text-sm font-bold shadow-inner focus:ring-2 focus:ring-emerald-500 flex-1" value={entry.date} onChange={e => updateDateEntry(entry.id, 'date', e.target.value)} />
                    <span className="text-[10px] text-stone-500 font-bold shrink-0">1일</span>
                  </>
                )}
                <button type="button" onClick={() => removeDateEntry(entry.id)} className="p-2 text-stone-300 hover:text-red-500 rounded-lg transition-colors ml-auto shrink-0" title="삭제"><Trash2 size={16}/></button>
              </div>
            ))}
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={addDateRange} className="py-2.5 px-4 rounded-xl border-2 border-dashed border-stone-200 text-stone-500 text-xs font-black hover:border-emerald-300 hover:text-emerald-600 transition">+ 범위 추가</button>
              <button type="button" onClick={addSingleDate} className="py-2.5 px-4 rounded-xl border-2 border-dashed border-stone-200 text-stone-500 text-xs font-black hover:border-emerald-300 hover:text-emerald-600 transition">+ 날짜 추가</button>
            </div>
          </div>
          <button className="w-full md:col-span-4 bg-emerald-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-emerald-700 transition" onClick={handleSubmit}>등록 완료</button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 pb-20 font-black">{events.map(event => {
        const assignedRest = restaurants.find(r => r.id === event.assignedRestaurantId);
        const needsResCheck = event.unreadRes;
        const needsOrderCheck = event.unreadOrder;
        const hasReorderNeedingCheck = event.orders?.some(o => o.needsAdminCheck);
        const hasGroups = event.assignedGroups?.length > 0;

        const MainButtons = () => (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 font-black flex-wrap w-full sm:w-auto min-w-0">
            <button type="button" onClick={() => onOpenLinkModal(event, 'res')} className={`w-full sm:w-auto min-w-0 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border shadow-sm truncate ${needsResCheck ? 'bg-amber-500 text-white border-amber-600 animate-[pulse_1.5s_infinite] shadow-amber-100' : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'}`}><LinkIcon size={16} className="sm:w-[18px] sm:h-[18px] shrink-0"/> <span className="truncate">예약 링크 생성</span></button>
            {event.status === 'res_submitted' && <button type="button" onClick={() => onOpenAssign(event)} className="w-full sm:w-auto min-w-0 bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg animate-bounce shadow-blue-100"><Store size={16} className="sm:w-[18px] sm:h-[18px] shrink-0"/> <span className="truncate">확인 및 배정</span></button>}
            {!hasGroups && (event.status === 'assigned' || event.status === 'ordered') && <button type="button" onClick={() => onOpenLinkModal(event, 'order')} className="w-full sm:w-auto min-w-0 px-4 sm:px-6 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"><Send size={16} className="sm:w-[18px] sm:h-[18px] shrink-0"/> <span className="truncate">주문 링크 생성</span></button>}
            {!hasGroups && event.latestOrder && <button type="button" onClick={() => onOpenOrder(event)} className={`w-full sm:w-auto min-w-0 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg truncate ${needsOrderCheck || hasReorderNeedingCheck ? 'bg-amber-500 text-white animate-[pulse_2s_infinite] sm:scale-105 shadow-amber-100' : 'bg-stone-900 text-white hover:bg-emerald-600 shadow-stone-200'}`}><ClipboardList size={16} className="sm:w-[18px] sm:h-[18px] shrink-0"/> {hasReorderNeedingCheck ? '재주문 확인 필요' : '최종 주문 확인'}</button>}
            <div className="flex gap-1 sm:ml-0">
              <button type="button" onClick={() => onReset(event.id)} className="p-2 sm:p-3 text-stone-300 hover:text-blue-500 transition-colors opacity-100 group-hover:opacity-100 shrink-0" title="상태 초기화 (테스트용)"><RefreshCcw size={18} className="sm:w-5 sm:h-5"/></button>
              <button type="button" onClick={() => onDelete(event.id)} className="p-2 sm:p-3 text-stone-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"><Trash2 size={18} className="sm:w-5 sm:h-5"/></button>
            </div>
          </div>
        );

        return (
          <div key={event.id} className="space-y-4 w-full min-w-0">
            <div className={`bg-white rounded-2xl sm:rounded-[2.5rem] border p-4 sm:p-8 group transition-all hover:shadow-2xl min-w-0 overflow-hidden ${needsResCheck || needsOrderCheck ? 'border-amber-300 ring-4 ring-amber-50 shadow-md' : 'border-stone-100 shadow-sm'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4 sm:gap-8">
                <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black bg-stone-100 text-stone-400 px-2 py-1 rounded uppercase tracking-tighter shrink-0">{event.id.slice(-6)}</span>
                    {event.status === 'res_pending' && <span className="bg-stone-50 text-stone-400 text-[10px] font-black px-2 py-1 rounded shrink-0">1. 예약 대기</span>}
                    {needsResCheck && <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded animate-pulse flex items-center gap-1 shadow-sm shrink-0"><Bell size={10}/> 예약 확인 요망</span>}
                    {event.status === 'assigned' && <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded shrink-0">2. 식당 배정됨</span>}
                    {!hasGroups && needsOrderCheck && <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded animate-pulse flex items-center gap-1 shadow-sm shrink-0"><Bell size={10}/> 최종 주문 도착</span>}
                    {!hasGroups && hasReorderNeedingCheck && <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-1 rounded animate-pulse flex items-center gap-1 shadow-sm shrink-0">재주문 확인 필요</span>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-black text-stone-800 tracking-tight break-words">{event.orgName}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-stone-400 font-bold mt-2 min-w-0">
                    <span className="flex items-center gap-1.5 font-black shrink-0"><Calendar size={14} className="sm:w-4 sm:h-4 text-emerald-600"/> <span className="break-words">{displayDate(event.date)}</span></span>
                    <span className="flex items-center gap-1.5 font-black min-w-0"><Users size={14} className="sm:w-4 sm:h-4 shrink-0"/> <span className="truncate">{event.manager}</span> <span className="opacity-40 font-medium shrink-0">|</span> <span className="truncate">{event.contact}</span></span>
                    {(assignedRest || event.assignedGroups) && <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg font-black italic shadow-sm truncate max-w-full"><Store size={14} className="shrink-0"/> {event.assignedGroups ? `${event.assignedGroups.length}개 그룹 분할` : assignedRest?.name}</span>}
                  </div>
                </div>
                <MainButtons />
              </div>
              {hasGroups && (
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-stone-100 space-y-3 sm:space-y-4">
                  {event.assignedGroups.map(g => {
                    const groupRest = restaurants.find(r => r.id === g.restaurantId);
                    const groupOrder = event.orders?.find(o => o.groupId === g.id);
                    const groupNeedsCheck = groupOrder?.needsAdminCheck;
                    const groupHasOrder = !!groupOrder;
                    return (
                      <div key={g.id} className="bg-stone-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-stone-200 min-w-0 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-stone-800 text-base sm:text-lg truncate">{g.name}</h4>
                            {groupRest && <p className="text-xs sm:text-sm text-emerald-600 font-bold mt-1 truncate">{groupRest.name}</p>}
                            {(groupNeedsCheck || (groupHasOrder && needsOrderCheck)) && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {groupNeedsCheck && <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse shrink-0">재주문 확인 필요</span>}
                                {groupHasOrder && needsOrderCheck && !groupNeedsCheck && <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded shrink-0">최종 주문 도착</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button type="button" onClick={() => onOpenLinkModal(event, 'res', g.id, g)} className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition min-w-0 truncate"><LinkIcon size={12} className="sm:w-3.5 sm:h-3.5 inline mr-1 shrink-0"/>예약 링크</button>
                            <button type="button" onClick={() => onOpenLinkModal(event, 'order', g.id, g)} className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1 min-w-0 truncate"><Send size={12} className="sm:w-3.5 sm:h-3.5 shrink-0"/> 주문 링크</button>
                            {groupHasOrder && <button type="button" onClick={() => onOpenOrder(event, g.id)} className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs transition flex items-center gap-1 min-w-0 truncate ${groupNeedsCheck || (needsOrderCheck && groupOrder?.id === event.latestOrder?.id) ? 'bg-amber-500 text-white animate-pulse' : 'bg-stone-900 text-white hover:bg-emerald-600'}`}><ClipboardList size={12} className="sm:w-3.5 sm:h-3.5 shrink-0"/> {groupNeedsCheck ? '재주문 확인' : '최종 주문 확인'}</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}</div>
    </div>
  );
}
