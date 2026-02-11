import { useState } from 'react';
import { Copy } from 'lucide-react';

export default function LinkModal({ data, resT, orderT, restaurants, baseUrl, onClose, onCopy }) {
  const { event, type, groupId, group } = data;
  const linkBase = `${baseUrl}${type}/${event.id}`;
  const uniqueLink = groupId ? `${linkBase}?group=${groupId}` : linkBase;
  const assignedRest = event.assignedGroups && group
    ? restaurants.find(r => r.id === group.restaurantId)
    : restaurants.find(r => r.id === event.assignedRestaurantId);
  const dateForTemplate = group ? (event.resData?.find(r => r.id === groupId)?.date || group.name) : event.date;
  const template = type === 'res' ? resT : orderT;
  const processedMessage = template.replace(/{기관명}/g, event.orgName).replace(/{날짜}/g, dateForTemplate).replace(/{링크}/g, uniqueLink).replace(/{배정식당}/g, assignedRest?.name || '배정 대기 중');
  const [message, setMessage] = useState(processedMessage);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in font-black">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95">
        <h3 className="text-xl font-black text-stone-800 mb-6">{type === 'res' ? '예약 신청' : '메뉴 취합'} 링크 생성</h3>
        <textarea className="w-full h-80 bg-stone-50 border-2 border-stone-100 rounded-3xl p-6 text-sm leading-relaxed outline-none focus:ring-4 focus:ring-blue-500/10 font-medium shadow-inner" value={message} onChange={e => setMessage(e.target.value)} />
        <div className="mt-8 flex gap-3"><button onClick={onClose} className="flex-1 bg-stone-100 py-4 rounded-2xl font-bold">닫기</button><button onClick={() => { onCopy(message); onClose(); }} className="flex-[2] bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 flex items-center justify-center gap-2"><Copy size={18}/> 내용 복사하기</button></div>
      </div>
    </div>
  );
}
