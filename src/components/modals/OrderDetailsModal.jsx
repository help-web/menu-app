import { X, Store, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

function OrderCard({ event, order, showToast }) {
  const total = (order.rooms || []).reduce((a, r) => a + r.totalPrice, 0);
  const final = order.paymentMethod?.includes('위드스페이스') ? Math.round(total * 1.1) : total;
  const isReorder = order.isReorder;
  const needsCheck = order.needsAdminCheck;
  return (
    <div id={`order-card-${order.id}`} className={`bg-stone-50 rounded-2xl p-6 border shadow-inner ${needsCheck ? 'border-amber-400 ring-2 ring-amber-200' : 'border-stone-200'}`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-200 flex-wrap">
        <Store size={18} className="text-emerald-600" />
        <span className="font-black text-stone-800">확정 식당: <span className="text-emerald-600">{order.restaurantName}</span></span>
        {isReorder && <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">재주문</span>}
        {needsCheck && <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">확인 필요</span>}
      </div>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {(order.rooms || []).map(room => (
          <div key={room.id} className="bg-white rounded-xl p-4 border border-stone-100">
            <div className="font-black text-stone-800 mb-2 border-b border-stone-100 pb-2 text-sm">{room.roomName}</div>
            <div className="space-y-1 text-sm">
              {Object.entries(room.items || {}).map(([name, qty]) => qty > 0 && (
                <div key={name} className="flex justify-between"><span className="text-stone-600">{name}</span><span className="font-bold text-stone-900">{qty}개</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {order.note && (
        <div className="mt-3 pt-3 border-t border-stone-200">
          <p className="text-xs font-black text-stone-400 uppercase mb-1">요청 사항</p>
          <p className="text-sm text-stone-700 font-bold leading-relaxed">{order.note}</p>
        </div>
      )}
      <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between items-center">
        <span className="text-xs font-black text-stone-400 uppercase">결제 합계</span>
        <span className="text-lg font-black text-emerald-600">{final.toLocaleString()}원</span>
      </div>
      <button onClick={async () => { try { showToast?.('이미지 생성 중...'); const el = document.getElementById(`order-card-${order.id}`); if (!el) return; const clone = el.cloneNode(true); clone.style.position = 'fixed'; clone.style.left = '-9999px'; clone.style.top = '0'; clone.style.zIndex = '-1'; clone.style.width = `${el.offsetWidth}px`; const scrollables = clone.querySelectorAll('[class*="max-h-"], [class*="overflow-y-auto"]'); scrollables.forEach(n => { n.style.maxHeight = 'none'; n.style.overflow = 'visible'; }); document.body.appendChild(clone); const canvas = await html2canvas(clone, { backgroundColor: '#ffffff', scale: 2, logging: false, useCORS: true }); document.body.removeChild(clone); canvas.toBlob(async (blob) => { try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); showToast?.('복사되었습니다.'); } catch (err) {} }, 'image/png'); } catch (e) { showToast?.('이미지 생성 실패'); } }} className="mt-3 w-full bg-stone-100 text-stone-600 py-2.5 rounded-xl font-black text-xs hover:bg-stone-200 transition flex items-center justify-center gap-2"><Camera size={14}/> 이미지로 복사</button>
    </div>
  );
}

export default function OrderDetailsModal({ event, groupId, onClose, onConfirm, onCopy, showToast }) {
  let orders = event.orders?.length ? event.orders : (event.latestOrder ? [event.latestOrder] : []);
  if (groupId) orders = orders.filter(o => o.groupId === groupId);
  if (!orders.length) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in font-black">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 border border-white/10 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-start mb-6 shrink-0"><div><h3 className="text-2xl font-black text-stone-800 flex items-center gap-2">최종 메뉴 취합 결과</h3><p className="text-sm text-stone-400 font-bold mt-1 tracking-tight">{orders.length}건의 주문서</p></div><button onClick={onClose} className="p-2 text-stone-400 hover:bg-stone-50 rounded-full transition"><X/></button></div>
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
          {orders.map((order) => (<OrderCard key={order.id} event={event} order={order} showToast={showToast} />))}
        </div>
        <div className="mt-6 pt-4 border-t border-stone-200 shrink-0"><button onClick={onConfirm} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-emerald-100 active:scale-95 transition hover:bg-emerald-700">확인 완료</button></div>
      </div>
    </div>
  );
}
