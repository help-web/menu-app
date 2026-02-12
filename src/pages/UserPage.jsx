import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar, X, Check, Home, ArrowLeft, Clock, Megaphone, CalendarPlus, ChevronDown, ChevronUp, Maximize2,
  MessageSquareText, Split, ArrowRightCircle, Clock3, Users, ChefHat, MessageSquare, CheckCircle,
  MinusCircle, PlusCircle, ArrowRight, MapPin, UtensilsCrossed,
} from 'lucide-react';
import { getFormattedDateWithDay, getFormattedDateWithDaySegments, getRestaurantMenus } from '../utils/helpers.js';

export default function UserPage({ loading = false, events, allRestaurants, globalNotice, assignTitle, assignDesc, mode, onSubmitRes, onSubmitOrder, onBack }) {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const groupFromUrl = searchParams.get('group');
  const event = events.find(e => e.id === eventId);
  const [activeTab, setActiveTab] = useState('order');
  const [rooms, setRooms] = useState([{ id: Date.now(), roomName: '회의실 1', items: {}, totalPrice: 0 }]);
  const [payMode, setPayMode] = useState(event?.resData?.[0]?.paymentMethod || '기관 직접 결제');
  const [resItems, setResItems] = useState([
    { id: Date.now(), date: event?.date || '', headcount: '', arrivalTime: '', restaurantId: '', menuType: '일품', paymentMethod: '기관 직접 결제', note: '' }
  ]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isResSubmitted, setIsResSubmitted] = useState(false);
  const [menuConfirmRestId, setMenuConfirmRestId] = useState(null);
  const [menuConfirmTab, setMenuConfirmTab] = useState('menu');
  const [orderNote, setOrderNote] = useState('');
  const [setTypeId, setSetTypeId] = useState(null);
  const [setQuantity, setSetQuantity] = useState(0);
  const [mealSelections, setMealSelections] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (groupFromUrl && event?.assignedGroups?.some(g => g.id === groupFromUrl)) {
      setSelectedGroupId(groupFromUrl);
    }
  }, [groupFromUrl, event?.assignedGroups]);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/');
  };

  const existingOrderForGroup = selectedGroupId && event?.orders?.find(o => o.groupId === selectedGroupId);

  useEffect(() => {
    if (selectedGroupId && event?.assignedGroups) {
        const group = event.assignedGroups.find(g => g.id === selectedGroupId);
        if (group) {
          const existing = event?.orders?.find(o => o.groupId === selectedGroupId);
          const isSetOrder = existing?.menuType === 'set';
          if (isSetOrder && existing) {
            setSetTypeId(existing.setType ?? null);
            setSetQuantity(existing.setQuantity ?? 0);
            const sel = {};
            (existing.mealSelections || []).forEach(m => { sel[m.name] = m.quantity; });
            setMealSelections(sel);
            setOrderNote(existing.note || '');
          } else if (existing?.rooms?.length) {
            setRooms(existing.rooms.map((r, i) => ({ ...r, id: r.id || Date.now() + i, items: { ...(r.items || {}) }, totalPrice: r.totalPrice ?? 0 })));
            setOrderNote(existing.note || '');
            setSetTypeId(null);
            setSetQuantity(0);
            setMealSelections({});
          } else {
            setRooms([{ id: Date.now(), roomName: group.name, items: {}, totalPrice: 0 }]);
            setOrderNote('');
            setSetTypeId(null);
            setSetQuantity(0);
            setMealSelections({});
          }
        }
    }
  }, [selectedGroupId, event]);

  useEffect(() => {
    if (!selectedGroupId && event?.orders?.length && event.assignedRestaurantId) {
      const existing = event.orders.find(o => !o.groupId) ?? event.latestOrder;
      if (existing) {
        const isSetOrder = existing.menuType === 'set';
        if (isSetOrder) {
          setSetTypeId(existing.setType ?? null);
          setSetQuantity(existing.setQuantity ?? 0);
          const sel = {};
          (existing.mealSelections || []).forEach(m => { sel[m.name] = m.quantity; });
          setMealSelections(sel);
          setOrderNote(existing.note || '');
        } else if (existing.rooms?.length) {
          setRooms(existing.rooms.map((r, i) => ({ ...r, id: r.id || Date.now() + i, items: { ...(r.items || {}) }, totalPrice: r.totalPrice ?? 0 })));
          setOrderNote(existing.note || '');
          setSetTypeId(null);
          setSetQuantity(0);
          setMealSelections({});
        }
      }
    }
  }, [selectedGroupId, event?.orders, event?.latestOrder, event?.assignedRestaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center font-bold text-stone-500">로딩 중...</div>
      </div>
    );
  }

  if (!eventId || !event) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center font-bold text-stone-400">존재하지 않는 행사입니다.</div>
        <button onClick={handleBack} className="fixed bottom-10 left-1/2 -translate-x-1/2 text-xs font-bold text-stone-500">관리자 홈으로</button>
      </div>
    );
  }

  const assignedRest = event.assignedRestaurantId
    ? allRestaurants.find(r => r.id === event.assignedRestaurantId)
    : (selectedGroupId ? allRestaurants.find(r => r.id === event.assignedGroups.find(g => g.id === selectedGroupId)?.restaurantId) : null);

  const { ilpumMenus, setMenus, mealOptions } = getRestaurantMenus(assignedRest);
  const orderMenuType = selectedGroupId
    ? (event.assignedGroups?.find(g => g.id === selectedGroupId)?.menuType ?? '일품')
    : (event.resData?.[0]?.menuType ?? '일품');
  const isSetOrder = orderMenuType === '정식';

  const addResDay = () => setResItems([...resItems, { id: Date.now(), date: '', headcount: '', arrivalTime: '', restaurantId: '', menuType: '일품', paymentMethod: '기관 직접 결제', note: '' }]);
  const removeResDay = (id) => resItems.length > 1 && setResItems(resItems.filter(i => i.id !== id));

  const getIlpumPrice = (name) => ilpumMenus.find(i => i.name === name)?.price ?? 0;
  const handleQtyInput = (rid, name, e) => {
    const val = e.target.value;
    const newQty = val === '' ? 0 : parseInt(val);
    if (isNaN(newQty) || newQty < 0) return;
    setRooms(rooms.map(r => r.id === rid ? { ...r, items: { ...r.items, [name]: newQty }, totalPrice: Object.entries({ ...r.items, [name]: newQty }).reduce((s, [n, q]) => s + getIlpumPrice(n) * q, 0) } : r));
  };
  const updateQty = (rid, name, delta) => {
    setRooms(rooms.map(r => r.id === rid ? { ...r, items: { ...r.items, [name]: Math.max(0, (r.items[name] || 0) + delta) }, totalPrice: Object.entries({ ...r.items, [name]: Math.max(0, (r.items[name] || 0) + delta) }).reduce((s, [n, q]) => s + getIlpumPrice(n) * q, 0) } : r));
  };
  const mealTotalSum = Object.values(mealSelections).reduce((a, q) => a + q, 0);
  const updateMealQty = (name, delta) => {
    setMealSelections(prev => {
      const cur = (prev[name] || 0) + delta;
      if (cur <= 0) {
        const next = { ...prev }; delete next[name]; return next;
      }
      if (delta > 0) {
        const prevSum = Object.values(prev).reduce((a, q) => a + q, 0);
        if (prevSum >= setQuantity) return prev;
      }
      return { ...prev, [name]: cur };
    });
  };
  const setMealQtyInput = (name, val) => {
    const q = val === '' ? 0 : parseInt(val);
    if (isNaN(q) || q < 0) return;
    const otherSum = mealTotalSum - (mealSelections[name] || 0);
    const maxForThis = Math.max(0, setQuantity - otherSum);
    const capped = Math.min(q, maxForThis);
    setMealSelections(prev => (capped === 0 ? (() => { const p = { ...prev }; delete p[name]; return p; })() : { ...prev, [name]: capped }));
  };
  const selectedSet = (setTypeId != null ? setMenus.find(m => m.id === setTypeId || m.name === setTypeId) : null) || (setMenus[0] ?? null);
  const effectiveSetId = selectedSet ? (selectedSet.id ?? selectedSet.name) : '';
  const setTotal = (selectedSet?.price ?? 0) * setQuantity;

  const handleSubmitRes = () => {
      onSubmitRes(event.id, resItems);
      setIsResSubmitted(true);
  };

  const handleSubmitOrder = () => {
      const isReplacing = !!existingOrderForGroup;
      const orderPayload = {
        restaurantName: assignedRest.name,
        paymentMethod: payMode,
        note: orderNote,
      };
      if (isSetOrder) {
        orderPayload.menuType = 'set';
        orderPayload.setType = selectedSet?.name ?? setTypeId;
        orderPayload.setQuantity = setQuantity;
        orderPayload.setPrice = selectedSet?.price;
        orderPayload.mealSelections = Object.entries(mealSelections)
          .filter(([, q]) => q > 0)
          .map(([name, quantity]) => ({ name, quantity }));
      } else {
        orderPayload.menuType = 'ilpum';
        orderPayload.rooms = rooms;
      }
      onSubmitOrder(event.id, orderPayload, selectedGroupId ?? undefined, isReplacing);
      if (mode === 'res') setIsResSubmitted(true);
  };

  if (isResSubmitted && mode === 'res') {
      return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in">
             <div className="w-full max-w-md bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-8 sm:p-16 text-center space-y-6 sm:space-y-8 font-black">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto border-[6px] border-white shadow-xl animate-bounce"><Check size={48}/></div>
                <h2 className="text-3xl font-black text-stone-800">제출 완료!</h2>
                <p className="text-stone-500 text-sm leading-relaxed font-bold">정보가 성공적으로 전달되었습니다.<br/>관리자가 확인 후 다음 단계를 안내해 드립니다.</p>
                <div className="pt-10"><button onClick={handleBack} className="text-stone-400 text-xs font-black uppercase hover:text-stone-600 flex items-center gap-2 mx-auto"><Home size={14}/> 관리자 화면으로 돌아가기</button></div>
             </div>
        </div>
      );
  }

  if (mode === 'res' || (!assignedRest && !event.assignedGroups && (event.status === 'res_pending' || event.status === 'res_submitted'))) {
    if (event.status === 'res_submitted' && mode !== 'res') {
      return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in"><div className="w-full max-w-md bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-8 sm:p-16 text-center space-y-6 sm:space-y-8 font-black"><div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border-4 sm:border-[6px] border-white shadow-xl animate-bounce"><Clock size={40} className="sm:w-12 sm:h-12"/></div><h2 className="text-2xl sm:text-3xl font-black text-stone-800 break-words">예약 검토 중</h2><p className="text-stone-500 text-sm leading-relaxed font-bold break-words">제출해주신 내용을 바탕으로 지점을 확정 중입니다.<br/><span className="text-blue-600">배정이 완료되면</span> 안내 메시지를 보내드립니다!</p><div className="pt-8 sm:pt-10"><button onClick={handleBack} className="text-stone-400 text-xs font-black uppercase hover:text-stone-600 flex items-center gap-2 mx-auto"><ArrowLeft size={14}/> 관리자 화면으로 돌아가기</button></div></div></div>
      );
    }
    return (
        <div className="min-h-screen bg-stone-50 p-4 sm:p-6 flex flex-col items-center animate-in fade-in font-sans w-full max-w-lg mx-auto">
          <div className="w-full space-y-6 sm:space-y-8 pb-10">
            <div className="text-center font-black min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 text-white rounded-2xl sm:rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl animate-in zoom-in"><Calendar size={32} className="sm:w-10 sm:h-10" /></div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight break-words">식당 예약 신청</h2>
                <p className="text-stone-400 text-xs sm:text-sm mt-2 sm:mt-3 font-medium opacity-80 uppercase tracking-widest truncate max-w-full px-2">{event.orgName} 담당자 전용</p>
            </div>
            {globalNotice && (<div className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm animate-in slide-in-from-top-2 min-w-0"><div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-widest mb-2"><Megaphone size={14} /> 관리자 안내 사항</div><p className="text-sm text-emerald-800 leading-relaxed font-black opacity-90 whitespace-pre-wrap break-words">{globalNotice}</p></div>)}
            <div className="space-y-4 font-black w-full min-w-0">
              <p className="text-[10px] text-stone-500 uppercase tracking-widest px-1 font-black">식당 메뉴 확인 하기</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                {allRestaurants.map(r => (
                  <button key={r.id} type="button" onClick={() => { setMenuConfirmRestId(r.id); setMenuConfirmTab('menu'); }} className={`w-full sm:flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm font-black border-2 transition-all min-w-0 truncate ${menuConfirmRestId === r.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-stone-600 border-stone-200 hover:border-blue-300 hover:bg-blue-50'}`}>{r.name}</button>
                ))}
              </div>
              {menuConfirmRestId && (() => {
                const rest = allRestaurants.find(r => r.id === menuConfirmRestId);
                if (!rest) return null;
                return (
                  <div className="bg-stone-50 rounded-2xl border border-stone-100 p-5 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-stone-600 truncate">{rest.name} 메뉴·약도</span>
                      <button type="button" onClick={() => setMenuConfirmRestId(null)} className="flex items-center gap-1.5 shrink-0 py-2 px-3 rounded-lg text-xs font-black text-stone-500 hover:bg-stone-200/80 hover:text-stone-700 transition-colors" aria-label="접기">
                        <ChevronUp size={16} />
                        <span>접기</span>
                      </button>
                    </div>
                    <div className="flex p-1.5 bg-stone-200/60 rounded-xl">
                      <button type="button" onClick={() => setMenuConfirmTab('menu')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${menuConfirmTab === 'menu' ? 'bg-white text-stone-900 shadow' : 'text-stone-500'}`}>메뉴판</button>
                      <button type="button" onClick={() => setMenuConfirmTab('map')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${menuConfirmTab === 'map' ? 'bg-white text-stone-900 shadow' : 'text-stone-500'}`}>찾아가는 길</button>
                    </div>
                    {menuConfirmTab === 'menu' && (
                      <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-stone-200 bg-white" onClick={() => setFullscreenImage(rest.menuImage)}>
                        <img src={rest.menuImage} className="w-full h-48 object-cover" alt="메뉴판" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Maximize2 size={28} className="text-white" /></div>
                      </div>
                    )}
                    {menuConfirmTab === 'map' && (
                      <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-stone-200 bg-white" onClick={() => setFullscreenImage(rest.mapImage)}>
                        <img src={rest.mapImage} className="w-full h-48 object-cover" alt="찾아가는 길" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Maximize2 size={28} className="text-white" /></div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="space-y-6 w-full min-w-0">
                {resItems.map((item, idx) => (
                        <div key={item.id} className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl p-4 sm:p-8 space-y-4 sm:space-y-6 border border-white relative animate-in slide-in-from-bottom-5 w-full min-w-0 overflow-hidden">
                             {resItems.length > 1 && <button onClick={() => removeResDay(item.id)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-stone-300 hover:text-red-500"><X size={20}/></button>}
                             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 text-blue-600 font-black text-xs uppercase tracking-widest pr-10 sm:pr-0"><div className="flex items-center gap-2 font-black shrink-0"><CalendarPlus size={14}/> 일정 {idx + 1}</div><div className="flex flex-wrap gap-x-2 gap-y-1 min-w-0 break-words">{(() => { const segs = getFormattedDateWithDaySegments(item.date); if (segs.length === 0) return <span className="break-words">{getFormattedDateWithDay(item.date)}</span>; return segs.map((seg, i) => (<span key={i} className="whitespace-nowrap">{i > 0 && <span className="text-stone-400"> + </span>}{seg}</span>)); })()}</div></div>
                             <div className="space-y-1 font-black min-w-0"><label className="text-[10px] text-stone-400 uppercase tracking-widest px-1">식사 날짜 범위</label><div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-black min-w-0"><input type="date" className="w-full min-w-0 flex-1 bg-stone-50 border-none rounded-xl p-3 sm:p-4 text-xs focus:ring-2 focus:ring-blue-500 font-black shadow-inner" onChange={e => { const s = e.target.value; const c = item.date.split('~'); setResItems(resItems.map(x => x.id === item.id ? {...x, date: `${s} ~ ${c[1]?.trim() || s}`} : x)); }} /><span className="text-stone-300 font-black hidden sm:inline">~</span><input type="date" className="w-full min-w-0 flex-1 bg-stone-50 border-none rounded-xl p-3 sm:p-4 text-xs focus:ring-2 focus:ring-blue-500 font-black shadow-inner" onChange={e => { const en = e.target.value; const c = item.date.split('~'); setResItems(resItems.map(x => x.id === item.id ? {...x, date: `${c[0]?.trim() || en} ~ ${en}`} : x)); }} /></div>{item.date && <p className="text-[10px] text-blue-500 mt-1 px-1 font-bold break-words">선택 범위: {item.date}</p>}</div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-black items-end"><div className="space-y-1 font-black min-w-0"><label className="text-[10px] text-stone-400 uppercase tracking-widest px-1 font-black whitespace-nowrap block">일자별 인원(명) - <span className="text-emerald-600 normal-case">1일 기준</span></label><input type="number" className="w-full min-w-0 bg-stone-50 border-none rounded-xl p-3 sm:p-4 text-sm focus:ring-2 focus:ring-blue-500 font-black shadow-inner" placeholder="15" value={item.headcount} onChange={e => setResItems(resItems.map(x => x.id === item.id ? {...x, headcount: e.target.value} : x))} /></div><div className="space-y-1 font-black min-w-0"><label className="text-[10px] text-stone-400 uppercase tracking-widest px-1 font-black block">도착 시간</label><input type="text" className="w-full min-w-0 bg-stone-50 border-none rounded-xl p-3 sm:p-4 text-sm focus:ring-2 focus:ring-blue-500 font-black shadow-inner" placeholder="예: 오후 12:30" value={item.arrivalTime} onChange={e => setResItems(resItems.map(x => x.id === item.id ? {...x, arrivalTime: e.target.value} : x))} /></div></div>
                             <div className="space-y-2 font-black min-w-0"><label className="text-[10px] text-stone-400 uppercase tracking-widest px-1 font-black">희망 식당 선택</label><div className="relative font-black"><select className="w-full min-w-0 bg-stone-50 border-none rounded-xl p-3 sm:p-4 pr-10 text-sm focus:ring-2 focus:ring-blue-500 font-black shadow-inner appearance-none cursor-pointer" value={item.restaurantId} onChange={e => setResItems(resItems.map(x => x.id === item.id ? {...x, restaurantId: e.target.value} : x))}><option value="">식당을 선택해 주세요</option>{allRestaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={20} /></div></div>
                             <div className="space-y-1 font-black min-w-0"><label className="text-[10px] text-stone-400 uppercase tracking-widest px-1 font-black">식사 종류</label><div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-xl font-black"><button type="button" onClick={() => setResItems(resItems.map(x => x.id === item.id ? {...x, menuType: '일품'} : x))} className={`py-3 rounded-xl text-xs transition-all font-black min-w-0 ${item.menuType === '일품' ? 'bg-white text-blue-600 shadow-md' : 'text-stone-400'}`}>일품</button><button type="button" onClick={() => setResItems(resItems.map(x => x.id === item.id ? {...x, menuType: '정식'} : x))} className={`py-3 rounded-xl text-xs transition-all font-black min-w-0 ${item.menuType === '정식' ? 'bg-white text-blue-600 shadow-md' : 'text-stone-400'}`}>정식</button></div></div>
                             <div className="space-y-1 font-black min-w-0"><label className="text-[10px] text-stone-400 uppercase tracking-widest px-1 flex items-center gap-1 font-bold"><MessageSquareText size={10}/> 기타 요청 사항</label><textarea className="w-full min-w-0 h-24 bg-stone-50 border-none rounded-xl p-3 sm:p-4 text-sm focus:ring-2 focus:ring-blue-500 font-bold shadow-inner resize-none placeholder:text-stone-400 placeholder:font-normal break-words" placeholder="예) 5명씩 3그룹으로 식사 테이블 나눠주세요" value={item.note} onChange={e => setResItems(resItems.map(x => x.id === item.id ? {...x, note: e.target.value} : x))} /></div>
                             <div className="space-y-1 font-black min-w-0"><label className="text-[10px] text-stone-400 uppercase tracking-widest px-1 font-black">결제 방식</label><div className="grid grid-cols-1 gap-2 p-1.5 bg-stone-100 rounded-xl font-black"><button type="button" onClick={() => setResItems(resItems.map(x => x.id === item.id ? {...x, paymentMethod: '기관 직접 결제'} : x))} className={`py-3 rounded-xl text-xs transition-all font-black w-full min-w-0 ${item.paymentMethod === '기관 직접 결제' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400'}`}>기관 직접 결제</button><button type="button" onClick={() => setResItems(resItems.map(x => x.id === item.id ? {...x, paymentMethod: '위드스페이스 결제'} : x))} className={`py-3 rounded-xl text-xs transition-all font-black w-full min-w-0 ${item.paymentMethod === '위드스페이스 결제' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400'}`}>위드스페이스 결제 (부가세 10% 부과)</button></div></div>
                        </div>
                ))}
                <button type="button" onClick={addResDay} className="w-full py-4 sm:py-5 border-2 border-dashed border-stone-200 rounded-2xl sm:rounded-[2.5rem] text-stone-400 font-black text-xs uppercase tracking-widest hover:bg-white hover:border-blue-200 transition-all shadow-inner">+ 다른 날짜도 추가</button>
                <button type="button" onClick={handleSubmitRes} className="w-full bg-blue-600 text-white py-5 sm:py-6 rounded-xl sm:rounded-[2rem] font-black text-base sm:text-lg shadow-2xl active:scale-[0.98] transition-all shadow-blue-200/50">예약 신청 정보 제출</button>
                <button type="button" onClick={handleBack} className="text-stone-400 text-xs font-black tracking-widest uppercase hover:text-stone-600 transition-all flex items-center gap-2 mx-auto pb-10"><ArrowLeft size={14}/> 관리자 화면으로 돌아가기</button>
            </div>
          </div>
          {fullscreenImage && (
              <div className="fixed inset-0 z-[300] bg-stone-900/95 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setFullscreenImage(null)}>
                 <button className="absolute top-8 right-8 text-white/60 hover:text-white p-2 rounded-full bg-white/10 transition-all"><X size={32}/></button>
                 <img src={fullscreenImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 font-black" alt="Fullscreen View" />
              </div>
          )}
        </div>
    );
  }

  if (event.assignedGroups && !selectedGroupId) {
    return (
       <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 sm:p-6 font-black animate-in fade-in w-full">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 text-center space-y-4 sm:space-y-6 overflow-hidden">
             <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4 shadow-lg"><Split size={28} className="sm:w-8 sm:h-8"/></div>
             <h2 className="text-xl sm:text-2xl font-black text-stone-900 break-words">일정 선택</h2>
             <p className="text-xs sm:text-sm text-stone-500 font-bold mb-4 sm:mb-6 break-words">배정된 일정을 선택하면 해당 식당의 메뉴가 나옵니다.</p>
             <div className="space-y-2 sm:space-y-3 w-full min-w-0">
               {event.assignedGroups.map(g => {
                 const hasOrder = event.orders?.some(o => o.groupId === g.id);
                 return (
                   <button key={g.id} type="button" onClick={() => setSelectedGroupId(g.id)} className="w-full py-3 sm:py-4 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl text-stone-700 font-black hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm flex flex-col items-start px-4 sm:px-6 gap-1 group text-left min-w-0 overflow-hidden">
                      <div className="flex justify-between w-full items-center gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                          <span className="text-sm sm:text-base font-black truncate">{g.name}</span>
                          {hasOrder && <span className="shrink-0 text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">제출 완료</span>}
                        </div>
                        <ArrowRightCircle size={18} className="sm:w-5 sm:h-5 opacity-50 group-hover:opacity-100 group-hover:text-blue-500 transition-all shrink-0"/>
                      </div>
                      <div className="flex gap-2 text-[10px] text-stone-400 font-bold flex-wrap items-center">
                        {hasOrder && <span className="text-blue-600">수정 주문하기</span>}
                        {g.time && <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 flex items-center gap-1"><Clock3 size={10}/> {g.time}</span>}{g.headcount && <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 flex items-center gap-1"><Users size={10}/> {g.headcount}</span>}{g.menuType && <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 flex items-center gap-1"><ChefHat size={10}/> {g.menuType}</span>}
                      </div>
                   </button>
                 );
               })}
             </div>
             <button type="button" onClick={handleBack} className="text-stone-300 text-[10px] font-black uppercase mt-2 sm:mt-4 hover:text-stone-500">Back</button>
          </div>
       </div>
    );
  }

  const ilpumTotal = rooms.reduce((a, r) => a + r.totalPrice, 0);
  const finalTotal = isSetOrder ? setTotal : ilpumTotal;
  const finalPrice = payMode.includes('위드스페이스') ? Math.round(finalTotal * 1.1) : finalTotal;

  return (
    <div className="min-h-screen bg-stone-50 pb-36 sm:pb-40 animate-in fade-in font-black w-full min-w-0 overflow-x-hidden">
      <div className="bg-white border-b border-stone-100 sticky top-0 z-40 px-3 sm:px-6 py-4 sm:py-5 shadow-sm flex items-center justify-between gap-2 font-black min-w-0">
        <button type="button" onClick={handleBack} className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center text-stone-400 hover:bg-stone-50 rounded-full transition"><ArrowLeft size={22} className="sm:w-6 sm:h-6"/></button>
        <div className="text-center font-black min-w-0 flex-1 overflow-hidden">
          <h2 className="text-base sm:text-lg font-black text-stone-800 tracking-tight truncate">{assignedRest?.name || 'Loading...'}</h2>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest truncate">{event.orgName} - 최종 메뉴 기입</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center bg-stone-100 rounded-xl text-stone-500"><MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]"/></div>
      </div>
      <div className="w-full max-w-xl mx-auto mt-6 sm:mt-8 px-3 sm:px-4 font-black min-w-0 box-border">
        {assignedRest && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 font-black">
            <div className="flex bg-stone-200/50 p-1.5 rounded-xl sm:rounded-[1.5rem] mb-6 sm:mb-10 border border-stone-200 shadow-inner font-black min-w-0"><button type="button" onClick={() => setActiveTab('order')} className={`flex-1 min-w-0 py-3 sm:py-3.5 rounded-lg sm:rounded-[1.2rem] text-xs uppercase transition-all ${activeTab === 'order' ? 'bg-white text-stone-900 shadow-lg font-black' : 'text-stone-400'}`}>수량 선택</button><button type="button" onClick={() => setActiveTab('menu')} className={`flex-1 min-w-0 py-3 sm:py-3.5 rounded-lg sm:rounded-[1.2rem] text-xs uppercase transition-all ${activeTab === 'menu' ? 'bg-white text-stone-900 shadow-lg font-black' : 'text-stone-400'}`}>메뉴판</button><button type="button" onClick={() => setActiveTab('map')} className={`flex-1 min-w-0 py-3 sm:py-3.5 rounded-lg sm:rounded-[1.2rem] text-xs uppercase transition-all ${activeTab === 'map' ? 'bg-white text-stone-900 shadow-lg font-black' : 'text-stone-400'}`}>약도</button></div>
            {activeTab === 'order' && (
              <div className="space-y-4 sm:space-y-6 font-black w-full min-w-0">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 shadow-sm min-w-0"><div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-lg animate-in zoom-in shadow-emerald-100"><CheckCircle size={28} className="sm:w-8 sm:h-8"/></div><div className="min-w-0 flex-1"><p className="text-emerald-900 font-black text-base sm:text-lg italic break-words">식사장소: {assignedRest?.name || assignTitle}</p><p className="text-emerald-700 text-xs sm:text-sm mt-1 sm:mt-1.5 leading-relaxed font-bold opacity-80 break-words">{assignDesc}</p><p className="text-[10px] text-emerald-600/80 mt-1 uppercase tracking-widest">{orderMenuType} 선택</p></div></div>

                {isSetOrder ? (
                  <>
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-stone-100 shadow-xl p-4 sm:p-6 w-full min-w-0">
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest px-1 mb-3 font-black">정식 종류</p>
                      <div className="relative">
                        <select className="w-full min-w-0 bg-stone-50 border-none rounded-xl p-3 sm:p-4 pr-10 text-sm focus:ring-2 focus:ring-emerald-500 font-black shadow-inner appearance-none cursor-pointer" value={effectiveSetId} onChange={e => setSetTypeId(e.target.value || null)}>
                          {setMenus.length === 0 ? <option value="">정식 메뉴 없음</option> : setMenus.map(m => <option key={m.id ?? m.name} value={m.id ?? m.name}>{m.name} · {Number(m.price).toLocaleString()}원</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={20} />
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-stone-100 shadow-xl p-4 sm:p-6 w-full min-w-0">
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest px-1 mb-3 font-black">정식 수량</p>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <button type="button" onClick={() => setSetQuantity(q => Math.max(0, q - 1))} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 transition shrink-0"><MinusCircle size={24} className="sm:w-8 sm:h-8"/></button>
                        <input type="number" className="w-16 sm:w-20 text-center font-black text-xl bg-transparent border-b border-stone-200 focus:border-emerald-500 focus:outline-none p-0 min-w-0" value={setQuantity} onChange={e => { const v = e.target.value === '' ? 0 : parseInt(e.target.value); if (!isNaN(v) && v >= 0) setSetQuantity(v); }} onFocus={e => e.target.select()}/>
                        <button type="button" onClick={() => setSetQuantity(q => q + 1)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-100 transition shrink-0"><PlusCircle size={24} className="sm:w-8 sm:h-8"/></button>
                        <span className="text-sm text-stone-500 font-bold">인분</span>
                      </div>
                    </div>
                    {mealOptions.length > 0 && (
                      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-stone-100 shadow-xl overflow-hidden w-full min-w-0">
                        <div className="bg-stone-100 px-4 sm:px-6 py-3 font-black text-stone-600 text-xs uppercase tracking-widest">식사 메뉴 (정식에 포함 · 1인 1개)</div>
                        <p className="px-4 pt-2 text-[10px] text-stone-500 font-bold">총 합계가 정식 수량({setQuantity}개)을 넘을 수 없습니다.</p>
                        <div className="divide-y divide-stone-50 p-2 sm:p-3 font-black">
                          {mealOptions.map(item => {
                            const atLimit = mealTotalSum >= setQuantity;
                            return (
                              <div key={item.id ?? item.name} className="p-3 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 min-w-0">
                                <div className="min-w-0"><p className="font-bold text-stone-800 text-sm sm:text-base truncate">{item.name}</p></div>
                                <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0">
                                  <button type="button" onClick={() => updateMealQty(item.name, -1)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition border-2 shrink-0 ${(mealSelections[item.name] || 0) > 0 ? 'bg-white text-stone-900 border-stone-200 shadow-sm' : 'bg-stone-50 text-stone-200 border-stone-100'}`}><MinusCircle size={24} className="sm:w-8 sm:h-8"/></button>
                                  <input type="number" className="w-10 sm:w-12 text-center font-black text-lg bg-transparent border-b border-stone-200 focus:border-emerald-500 focus:outline-none p-0 mx-1 min-w-0" value={mealSelections[item.name] || 0} onChange={e => setMealQtyInput(item.name, e.target.value)} onFocus={e => e.target.select()} min={0} max={setQuantity}/>
                                  <button type="button" onClick={() => updateMealQty(item.name, 1)} disabled={atLimit} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shrink-0 transition ${atLimit ? 'bg-stone-100 text-stone-300 border-stone-100 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}><PlusCircle size={24} className="sm:w-8 sm:h-8"/></button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                {rooms.map((room, idx) => (
                  <div key={room.id} className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-stone-100 shadow-2xl overflow-hidden animate-in zoom-in-95 shadow-stone-200/40 transition-all font-black w-full min-w-0"><div className="bg-stone-900 px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center gap-2 text-white shadow-lg min-w-0"><input className="bg-transparent font-black text-base sm:text-lg border-none focus:ring-0 p-0 flex-1 min-w-0 w-full" value={room.roomName} onChange={(e) => { const nr = [...rooms]; nr[idx].roomName = e.target.value; setRooms(nr); }} />{rooms.length > 1 && <button type="button" onClick={() => setRooms(rooms.filter(x => x.id !== room.id))} className="text-white/30 hover:text-white transition-colors shrink-0"><X size={22} className="sm:w-6 sm:h-6"/></button>}</div>
                    <div className="divide-y divide-stone-50 p-2 sm:p-3 font-black">{ilpumMenus.map(item => (<div key={item.id ?? item.name} className="p-3 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 group hover:bg-stone-50/50 transition-colors min-w-0"><div className="min-w-0"><p className="font-bold text-stone-800 text-sm sm:text-base truncate">{item.name}</p><p className="text-xs font-black text-stone-400 mt-0.5">{Number(item.price).toLocaleString()}원</p></div><div className="flex items-center justify-end sm:justify-between gap-2 sm:gap-4 shrink-0"><button type="button" onClick={() => updateQty(room.id, item.name, -1)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition border-2 shrink-0 ${room.items[item.name] > 0 ? 'bg-white text-stone-900 border-stone-200 shadow-sm' : 'bg-stone-50 text-stone-200 border-stone-100'}`}><MinusCircle size={24} className="sm:w-8 sm:h-8"/></button><input type="number" className={`w-10 sm:w-12 text-center font-black text-lg sm:text-xl bg-transparent border-b border-stone-200 focus:border-emerald-500 focus:outline-none p-0 mx-1 sm:mx-2 min-w-0 ${room.items[item.name] > 0 ? 'text-emerald-600' : 'text-stone-300'}`} value={room.items[item.name] || 0} onChange={(e) => handleQtyInput(room.id, item.name, e)} onFocus={(e) => e.target.select()}/><button type="button" onClick={() => updateQty(room.id, item.name, 1)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-100 transition shadow-md active:scale-90 shrink-0"><PlusCircle size={24} className="sm:w-8 sm:h-8"/></button></div></div>))}</div>
                  </div>
                ))}
                <button type="button" onClick={() => setRooms([...rooms, { id: Date.now(), roomName: `회의실 ${rooms.length + 1}`, items: {}, totalPrice: 0 }])} className="w-full py-5 sm:py-7 border-2 border-dashed border-stone-200 rounded-2xl sm:rounded-[3rem] text-stone-400 font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-white hover:border-emerald-200 transition-all duration-300 shadow-inner shadow-stone-100">+ 회의실 추가하기</button>
                  </>
                )}
                <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-stone-100 font-black w-full min-w-0">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest px-1 flex items-center gap-1 font-bold mb-2"><MessageSquareText size={12}/> 요청 사항</p>
                  <textarea className="w-full min-w-0 h-24 bg-stone-50 border-none rounded-xl p-3 sm:p-4 text-sm focus:ring-2 focus:ring-emerald-500 font-bold shadow-inner resize-none placeholder:text-stone-400 placeholder:font-normal break-words" placeholder="특이사항을 입력해 주세요" value={orderNote} onChange={e => setOrderNote(e.target.value)} />
                </div>
                <div className="bg-white p-4 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-stone-100 space-y-4 sm:space-y-6 shadow-stone-200/50 font-black w-full min-w-0">
                    <h4 className="font-black text-stone-800 text-center uppercase tracking-widest text-xs opacity-40">Payment Confirmation</h4>
                    <div className="flex flex-col sm:flex-row p-1.5 bg-stone-100 rounded-2xl sm:rounded-3xl shadow-inner gap-2 sm:gap-0">
                        <button type="button" onClick={() => setPayMode('기관 직접 결제')} className={`flex-1 min-w-0 py-3 sm:py-4 rounded-xl sm:rounded-[1.2rem] text-xs font-black transition-all ${payMode.includes('직접') ? 'bg-white text-stone-900 shadow-lg' : 'text-stone-400'}`}>기관 직접 결제</button>
                        <button type="button" onClick={() => setPayMode('위드스페이스 결제')} className={`flex-1 min-w-0 py-3 sm:py-4 rounded-xl sm:rounded-[1.2rem] text-xs font-black transition-all ${payMode.includes('위드스페이스') ? 'bg-white text-stone-900 shadow-lg' : 'text-stone-400'}`}>위드스페이스 결제 (부가세 10%)</button>
                    </div>
                    {payMode.includes('위드스페이스') && (
                        <p className="text-center text-[10px] text-emerald-600 font-bold animate-in fade-in slide-in-from-top-1">
                            * 위드스페이스 결제 시 부가세 10%가 합산되어 청구됩니다.
                        </p>
                    )}
                </div>
                {mode !== 'order' && (
                  <button type="button" onClick={handleBack} className="text-stone-400 text-xs font-black tracking-widest uppercase hover:text-stone-600 transition-all flex items-center gap-2 mx-auto pb-10"><ArrowLeft size={14}/> 관리자 화면으로 돌아가기</button>
                )}
              </div>
            )}
            {activeTab === 'menu' && (
               <div className="relative group cursor-pointer font-black w-full min-w-0 overflow-hidden" onClick={() => setFullscreenImage(assignedRest.menuImage)}>
                  <div className="bg-white p-2 sm:p-3 rounded-2xl sm:rounded-[3rem] shadow-2xl border border-stone-100 overflow-hidden shadow-stone-200/50">
                    <img src={assignedRest.menuImage} className="w-full h-auto rounded-xl sm:rounded-[2rem] shadow-sm object-contain" alt="Menu"/>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center rounded-2xl sm:rounded-[3rem]">
                     <div className="bg-white p-3 sm:p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"><Maximize2 size={28} className="sm:w-8 sm:h-8 text-emerald-600" /></div>
                  </div>
               </div>
            )}
            {activeTab === 'map' && (
               <div className="relative group cursor-pointer font-black w-full min-w-0 overflow-hidden" onClick={() => setFullscreenImage(assignedRest.mapImage)}>
                  <div className="bg-white p-2 sm:p-3 rounded-2xl sm:rounded-[3rem] shadow-2xl border border-stone-100 overflow-hidden shadow-stone-200/50">
                    <img src={assignedRest.mapImage} className="w-full h-auto rounded-xl sm:rounded-[2rem] shadow-sm object-contain" alt="Map"/>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center rounded-2xl sm:rounded-[3rem]">
                     <div className="bg-white p-3 sm:p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"><Maximize2 size={28} className="sm:w-8 sm:h-8 text-emerald-600" /></div>
                  </div>
               </div>
            )}
          </div>
        )}
        {fullscreenImage && (
          <div className="fixed inset-0 z-[300] bg-stone-900/95 flex items-center justify-center p-4 animate-in fade-in font-black" onClick={() => setFullscreenImage(null)}>
             <button className="absolute top-8 right-8 text-white/60 hover:text-white p-2 rounded-full bg-white/10 transition-all font-black"><X size={32}/></button>
             <img src={fullscreenImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 font-black" alt="Fullscreen View" />
          </div>
        )}
      </div>
      <div className="fixed bottom-4 sm:bottom-10 left-0 right-0 z-50 px-3 sm:px-6 animate-in slide-in-from-bottom-5 font-black w-full box-border">
        <div className="w-full max-w-md mx-auto bg-stone-900 rounded-2xl sm:rounded-[3rem] shadow-2xl p-4 sm:p-8 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden relative group transition-all shadow-stone-900/60 min-w-0">
            <div className="relative z-10 font-black min-w-0 flex-1">
                <p className="text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-widest mb-1 opacity-60">Final Amount Sum</p>
                <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                    <span className="text-2xl sm:text-3xl tracking-tighter font-black">{finalPrice.toLocaleString()}원</span>
                    {payMode.includes('위드스페이스') && <span className="text-[10px] font-bold text-emerald-400/80">(VAT 10%)</span>}
                </div>
            </div>
            <button type="button" disabled={finalTotal === 0} onClick={handleSubmitOrder} className={`relative z-10 w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-[1.8rem] text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-3 transition-all shrink-0 ${finalTotal === 0 ? 'bg-stone-800 text-stone-600 cursor-not-allowed shadow-none' : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-500/20'}`}>{existingOrderForGroup ? '재주문 제출' : '최종 메뉴 전송'} <ArrowRight size={20} className="sm:w-[22px] sm:h-[22px]"/></button>
            <div className="absolute top-0 right-0 w-24 sm:w-40 h-full bg-emerald-500/10 -skew-x-12 translate-x-8 sm:translate-x-12 group-hover:translate-x-0 transition-transform duration-1000 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
