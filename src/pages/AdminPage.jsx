import { Utensils, Users, Store } from 'lucide-react';
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
  generateLink,
  assignRestaurant,
  assignPerRow,
  onSaveTemplate,
  markOrderRead,
  copyToClipboard,
  showToast,
  onUpdateRestaurants,
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-w-0 w-full overflow-x-hidden">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-0 sm:h-20 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 font-black text-lg sm:text-xl text-stone-800 cursor-pointer min-w-0 shrink-0" onClick={() => navigate('/')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0"><Utensils size={20} className="sm:w-[22px] sm:h-[22px]" /></div>
            <span className="truncate">위드스페이스 매니저</span>
          </div>
          <nav className="flex bg-stone-100 p-1 rounded-xl shadow-inner font-bold flex-wrap gap-1 min-w-0">
            <button type="button" onClick={() => setAdminTab('events')} className={`flex-1 min-w-0 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm transition-all truncate ${adminTab === 'events' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}><Users size={14} className="inline mr-1 sm:mr-2 shrink-0"/> 행사 관리</button>
            <button type="button" onClick={() => setAdminTab('restaurants')} className={`flex-1 min-w-0 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm transition-all truncate ${adminTab === 'restaurants' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}><Store size={14} className="inline mr-1 sm:mr-2 shrink-0"/> 식당 정보</button>
          </nav>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 animate-in fade-in min-w-0 box-border">
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

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white px-8 py-4 rounded-full shadow-2xl font-bold border border-white/10 animate-in slide-in-from-bottom-5">
          {toast}
        </div>
      )}
    </div>
  );
}
