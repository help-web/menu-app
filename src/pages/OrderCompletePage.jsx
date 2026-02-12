import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, Store, LayoutGrid, RefreshCw, RotateCcw } from 'lucide-react';

function OrderSummary({ order }) {
  const isSetOrder = order.menuType === 'set';
  const total = isSetOrder
    ? (order.setQuantity ?? 0) * (order.setPrice ?? 0)
    : (order.rooms || []).reduce((a, r) => a + (r.totalPrice ?? 0), 0);
  const final = order.paymentMethod?.includes('위드스페이스') ? Math.round(total * 1.1) : total;

  return (
    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 w-full max-w-lg mx-auto text-left">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-200 flex-wrap">
        <Store size={18} className="text-emerald-600" />
        <span className="font-black text-stone-800">확정 식당: <span className="text-emerald-600">{order.restaurantName}</span></span>
        {order.menuType === 'set' && (
          <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
            <LayoutGrid size={10} /> 정식
          </span>
        )}
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {isSetOrder ? (
          <div className="bg-white rounded-xl p-4 border border-stone-100 space-y-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-stone-500 font-black mb-1">정식</div>
              <div className="flex justify-between items-center">
                <span className="text-stone-700 font-bold">{order.setType ?? '-'}</span>
                <span className="font-black text-stone-900">{order.setQuantity ?? 0}인분</span>
              </div>
              {order.setPrice != null && (
                <div className="text-xs text-stone-500 mt-0.5">
                  {Number(order.setPrice).toLocaleString()}원 × {order.setQuantity ?? 0}
                </div>
              )}
            </div>
            {(order.mealSelections?.length > 0) && (
              <div>
                <div className="text-xs uppercase tracking-widest text-stone-500 font-black mb-1">식사 메뉴</div>
                <div className="space-y-1 text-sm">
                  {order.mealSelections.map((m, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-stone-600">{m.name}</span>
                      <span className="font-bold text-stone-900">{m.quantity}개</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          (order.rooms || []).map(room => (
            <div key={room.id} className="bg-white rounded-xl p-4 border border-stone-100">
              <div className="font-black text-stone-800 mb-2 border-b border-stone-100 pb-2 text-sm">{room.roomName}</div>
              <div className="space-y-1 text-sm">
                {Object.entries(room.items || {}).map(
                  ([name, qty]) =>
                    qty > 0 && (
                      <div key={name} className="flex justify-between">
                        <span className="text-stone-600">{name}</span>
                        <span className="font-bold text-stone-900">{qty}개</span>
                      </div>
                    )
                )}
              </div>
            </div>
          ))
        )}
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
    </div>
  );
}

export default function OrderCompletePage({ fetchEvent }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = location.state?.groupId ?? null;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadEvent = async () => {
    if (!eventId || !fetchEvent) return;
    setLoading(true);
    setError(false);
    try {
      const data = await fetchEvent(eventId);
      setEvent(data);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const order = event
    ? groupId
      ? (event.orders || []).filter(o => o.groupId === groupId).slice(-1)[0]
      : event.latestOrder || (event.orders || []).slice(-1)[0]
    : null;

  const handleReorder = () => {
    const to = groupId ? `/order/${eventId}?group=${groupId}` : `/order/${eventId}`;
    navigate(to);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <div className="animate-pulse text-stone-400 font-bold">불러오는 중...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <div className="text-center text-stone-500 font-bold">주문 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <div className="text-center text-stone-500 font-bold">제출된 주문 내역이 없습니다.</div>
        <button type="button" onClick={handleReorder} className="mt-4 text-emerald-600 text-sm font-bold hover:underline flex items-center gap-2">
          <RotateCcw size={16} /> 메뉴 선택하기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Check size={40} className="sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-800">주문 제출 완료</h1>
        <p className="text-sm text-stone-500 font-bold">아래 내용으로 접수되었습니다.</p>

        <OrderSummary order={order} />

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="button"
            onClick={loadEvent}
            className="text-stone-400 text-xs font-bold flex items-center justify-center gap-2 hover:text-stone-600"
          >
            <RefreshCcw size={14} /> 상태 새로고침
          </button>
          <button
            type="button"
            onClick={handleReorder}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition active:scale-[0.98]"
          >
            <RotateCcw size={18} /> 재주문하기
          </button>
        </div>
      </div>
    </div>
  );
}
