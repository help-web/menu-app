import { useState, useRef } from 'react';
import { Calendar, Users, Clock, CreditCard, Tag, MessageCircle, ArrowLeft, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

const SAMPLE_RESERVATIONS = [
  {
    id: 'res-1',
    status: '확인 대기',
    dateRange: '2026-02-11 (수) ~ 2026-02-12 (목)',
    headcount: '15',
    arrivalTime: '12:30',
    menuType: '일품',
    paymentMethod: '위드스페이스 결제',
    desiredRestaurant: '미지정',
    note: '12시~13시 순차적으로 인원 나눠서 출발 예정입니다.',
  },
  {
    id: 'res-2',
    status: '확인 대기',
    dateRange: '2026-02-15 (일) ~ 2026-02-15 (일)',
    headcount: '15',
    arrivalTime: '12시 30분',
    menuType: '일품',
    paymentMethod: '기관 직접 결제',
    desiredRestaurant: '충정화로',
    note: '없음',
  },
];

const SAMPLE_HEADER = {
  title: '위드스페이스',
  contactLabel: '담당자 정보',
  contactText: '강민재 | 010-4307-3707',
  scheduleLabel: '일정 정보',
  scheduleText: '11일~12일 2일 + 15일 1일',
};

export default function ReservationListPage({ onBack, showToast }) {
  const captureRef = useRef(null);

  const handleImageCopy = async () => {
    if (!captureRef.current) return;
    try {
      if (showToast) showToast('이미지 생성 중...');
      const el = captureRef.current;
      const clone = el.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.zIndex = '-1';
      clone.style.width = `${el.offsetWidth}px`;
      const scrollables = clone.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-auto"]');
      scrollables.forEach(node => {
        node.style.maxHeight = 'none';
        node.style.overflow = 'visible';
      });
      document.body.appendChild(clone);
      const canvas = await html2canvas(clone, { backgroundColor: '#f5f5f5', scale: 2, logging: false, useCORS: true });
      document.body.removeChild(clone);
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          if (showToast) showToast('복사되었습니다.');
        } catch (err) {}
      }, 'image/png');
    } catch (error) {
      if (showToast) showToast('이미지 생성 실패');
    }
  };

  return (
    <div className="min-h-screen bg-stone-200/80 font-sans antialiased">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-800 font-bold text-sm transition-colors"
          >
            <ArrowLeft size={18} />
            돌아가기
          </button>
          <button
            onClick={handleImageCopy}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl font-black text-xs hover:bg-stone-800 transition-colors"
          >
            <Camera size={14} />
            이미지 복사
          </button>
        </div>

        <div ref={captureRef} className="bg-stone-100 p-6 rounded-2xl min-w-[720px]">
        <header className="mb-10">
          <h1 className="text-xl font-black text-stone-900 tracking-tight mb-1">
            예약 신청 내역
          </h1>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-4">
            {SAMPLE_HEADER.title}
          </h2>
          <p className="text-sm text-stone-600 font-bold">
            <span className="text-stone-500 font-bold">{SAMPLE_HEADER.contactLabel}</span>{' '}
            {SAMPLE_HEADER.contactText}
            <span className="text-stone-400 mx-2">|</span>
            <span className="text-stone-500 font-bold">{SAMPLE_HEADER.scheduleLabel}</span>{' '}
            {SAMPLE_HEADER.scheduleText}
          </p>
        </header>

        <ul className="space-y-6">
          {SAMPLE_RESERVATIONS.map((item) => (
            <li
              key={item.id}
              className="bg-white rounded-2xl shadow-md shadow-stone-200/80 border border-stone-100 overflow-hidden"
            >
              <div className="p-6 relative">
                <span className="absolute top-5 right-5 bg-teal-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
                  {item.status}
                </span>

                <div className="flex items-center gap-2 mb-5 pr-24">
                  <Calendar size={20} className="text-stone-500 shrink-0" />
                  <span className="text-base font-black text-stone-900">
                    {item.dateRange}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-5">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                      인원 / 시간
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-stone-800">
                      <span className="flex items-center gap-1">
                        <Users size={16} className="text-stone-500" />
                        {item.headcount}명
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} className="text-stone-500" />
                        {item.arrivalTime}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                      종류 / 결제
                    </p>
                    <div className="space-y-1 text-sm font-bold text-stone-800">
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={16} className="text-stone-500 shrink-0" />
                        <span>종류: {item.menuType}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={16} className="text-stone-500 shrink-0" />
                        <span>결제: {item.paymentMethod.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <div className="flex items-start gap-2">
                    <Tag size={18} className="text-stone-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-0.5">
                        희망 식당:
                      </p>
                      <p className="text-sm font-black text-teal-600">
                        {item.desiredRestaurant}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageCircle size={18} className="text-stone-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-0.5">
                        요청 사항:
                      </p>
                      <p className="text-sm text-stone-700 font-bold leading-relaxed">
                        {item.note}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </div>
  );
}
