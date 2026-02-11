import { Utensils, Users, Store, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EventSection from '../components/EventSection.jsx';
import RestaurantSection from '../components/RestaurantSection.jsx';
import TemplateModal from '../components/modals/TemplateModal.jsx';
import LinkModal from '../components/modals/LinkModal.jsx';
import AssignModal from '../components/modals/AssignModal.jsx';
import OrderDetailsModal from '../components/modals/OrderDetailsModal.jsx';

export default function AdminPage({
  events,
  restaurants,
  adminTab,
  setAdminTab,
  showOrderModal,
  setShowOrderModal,
  showLinkModal,
  setShowLinkModal,
  showAssignModal,
  setShowAssignModal,
  showTemplateModal,
  setShowTemplateModal,
  resTemplate,
  orderTemplate,
  globalNotice,
  assignTitle,
  assignDesc,
  baseUrl,
  toast,
  addEvent,
  onDeleteEvent,
  onResetEvent,
  onOpenLinkModal,
  onOpenAssign,
  onOpenOrder,
  onOpenTemplate,
  onOpenUserView,
  generateLink,
  assignRestaurant,
  assignPerRow,
  onSaveTemplate,
  markOrderRead,
  copyToClipboard,
  showToast,
  onUpdateRestaurants,
  targetEventId,
  debugSetStatus,
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 font-black text-xl text-stone-800 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Utensils size={22} /></div>
            위드스페이스 매니저
          </div>
          <nav className="flex bg-stone-100 p-1 rounded-xl shadow-inner font-bold">
            <button onClick={() => setAdminTab('events')} className={`px-6 py-2 rounded-lg text-sm transition-all ${adminTab === 'events' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}><Users size={16} className="inline mr-2"/> 행사 관리</button>
            <button onClick={() => setAdminTab('restaurants')} className={`px-6 py-2 rounded-lg text-sm transition-all ${adminTab === 'restaurants' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}><Store size={16} className="inline mr-2"/> 식당 정보</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 lg:p-10 animate-in fade-in">
        {adminTab === 'events' ? (
          <EventSection
            events={events}
            restaurants={restaurants}
            onAdd={addEvent}
            onDelete={onDeleteEvent}
            onReset={onResetEvent}
            onOpenLinkModal={onOpenLinkModal}
            onOpenAssign={onOpenAssign}
            onOpenOrder={onOpenOrder}
            onOpenTemplate={onOpenTemplate}
            onOpenUserView={onOpenUserView}
            generateLink={generateLink}
          />
        ) : (
          <RestaurantSection
            restaurants={restaurants}
            onAdd={(r) => onUpdateRestaurants('add', r)}
            onUpdate={(r) => onUpdateRestaurants('update', r)}
            onDelete={(id) => onUpdateRestaurants('delete', id)}
          />
        )}
      </main>

      {showTemplateModal && (
        <TemplateModal
          resT={resTemplate}
          orderT={orderTemplate}
          noticeT={globalNotice}
          assignT={assignTitle}
          assignD={assignDesc}
          onSave={onSaveTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
      {showLinkModal && <LinkModal data={showLinkModal} resT={resTemplate} orderT={orderTemplate} restaurants={restaurants} baseUrl={baseUrl} onClose={() => setShowLinkModal(null)} onCopy={copyToClipboard} />}
      {showAssignModal && <AssignModal event={showAssignModal} restaurants={restaurants} onAssign={assignRestaurant} onAssignPerRow={assignPerRow} onClose={() => setShowAssignModal(null)} onCopy={copyToClipboard} showToast={showToast} />}
      {showOrderModal && <OrderDetailsModal event={showOrderModal.event ?? showOrderModal} groupId={showOrderModal.groupId} onClose={() => setShowOrderModal(null)} onConfirm={() => markOrderRead((showOrderModal.event ?? showOrderModal).id)} onCopy={copyToClipboard} showToast={showToast} />}

      <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2 items-start animate-in slide-in-from-bottom-10">
         <div className="flex items-center bg-stone-900/90 backdrop-blur text-white p-2 rounded-2xl shadow-2xl border border-white/10 font-black gap-2">
            <a href="/" className={`px-4 py-2 rounded-xl text-[10px] tracking-widest transition-all bg-white text-stone-900 shadow-lg`}>ADMIN</a>
            <a href="/reservations" className="px-4 py-2 rounded-xl text-[10px] tracking-widest transition-all text-stone-400 hover:text-white">예약 내역</a>
            <a href={events[0] ? `/res/${events[0].id}` : '#'} className="px-4 py-2 rounded-xl text-[10px] tracking-widest transition-all text-stone-400 hover:text-white">RES PREVIEW</a>
            <a href={events[0] ? `/order/${events[0].id}` : '#'} className="px-4 py-2 rounded-xl text-[10px] tracking-widest transition-all text-stone-400 hover:text-white">MENU PREVIEW</a>
         </div>

         {targetEventId && (
            <div className="flex items-center bg-white/90 backdrop-blur text-stone-900 p-2 rounded-2xl shadow-xl border border-stone-200 font-black gap-2">
               <div className="px-2 text-[9px] font-black text-stone-400 flex items-center gap-1"><Wrench size={10}/> STATUS SET:</div>
               <button onClick={() => debugSetStatus(targetEventId, 'res_pending')} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-[10px]">초기화</button>
               <button onClick={() => debugSetStatus(targetEventId, 'res_submitted')} className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-[10px]">예약접수</button>
               <button onClick={() => debugSetStatus(targetEventId, 'assigned')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-[10px]">배정완료</button>
               <button onClick={() => debugSetStatus(targetEventId, 'ordered')} className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-[10px]">주문도착</button>
            </div>
         )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white px-8 py-4 rounded-full shadow-2xl font-bold border border-white/10 animate-in slide-in-from-bottom-5">
          {toast}
        </div>
      )}
    </div>
  );
}
