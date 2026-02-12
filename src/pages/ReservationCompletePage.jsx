import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, CheckCircle, UtensilsCrossed, ArrowLeft, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  res_pending: {
    label: '예약 대기',
    description: '예약 정보를 확인 중입니다.',
    icon: Clock,
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-500',
  },
  res_submitted: {
    label: '관리자 확인중',
    description: '예약 내용을 확인 중입니다. 확정되면 안내해 드리겠습니다.',
    icon: Clock,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  assigned: {
    label: '식당 확정',
    description: '식당 배정이 완료되었습니다. 메뉴 선택 링크가 발송될 예정입니다.',
    icon: CheckCircle,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  ordered: {
    label: '메뉴 확정',
    description: '메뉴 취합이 완료되었습니다.',
    icon: UtensilsCrossed,
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-700',
  },
};

export default function ReservationCompletePage({ fetchEvent, onBack }) {
  const { eventId } = useParams();
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
        <div className="text-center text-stone-500 font-bold">예약 정보를 불러올 수 없습니다.</div>
        <button type="button" onClick={onBack} className="mt-4 text-stone-400 text-sm font-bold hover:text-stone-600 flex items-center gap-2">
          <ArrowLeft size={16} /> 돌아가기
        </button>
      </div>
    );
  }

  const status = event.status || 'res_submitted';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.res_submitted;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl p-8 sm:p-12 text-center">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 ${config.iconBg} ${config.iconColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon size={40} className="sm:w-12 sm:h-12" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-800 mb-2">{config.label}</h1>
        <p className="text-sm text-stone-500 font-bold leading-relaxed mb-8">{config.description}</p>
        <p className="text-xs text-stone-400 font-bold mb-6">{event.orgName}</p>
        <button
          type="button"
          onClick={loadEvent}
          className="text-stone-400 text-xs font-bold flex items-center gap-2 mx-auto mb-4 hover:text-stone-600"
        >
          <RefreshCw size={14} /> 상태 새로고침
        </button>
        <button type="button" onClick={onBack} className="text-stone-400 text-xs font-black uppercase hover:text-stone-600 flex items-center gap-2 mx-auto">
          <ArrowLeft size={14} /> 관리자 페이지로
        </button>
      </div>
    </div>
  );
}
