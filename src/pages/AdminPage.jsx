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
