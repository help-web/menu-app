import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  DEFAULT_RESERVATION_TEMPLATE,
  DEFAULT_ORDER_TEMPLATE,
  DEFAULT_GLOBAL_NOTICE,
  DEFAULT_ASSIGN_TITLE,
  DEFAULT_ASSIGN_DESC,
  INITIAL_RESTAURANTS,
  INITIAL_EVENTS,
} from './data/initialData.js';
import { getBaseUrl, copyTextToClipboard, getFormattedDateWithDay } from './utils/helpers.js';
import AdminPage from './pages/AdminPage.jsx';
import UserPage from './pages/UserPage.jsx';
import ReservationListPage from './pages/ReservationListPage.jsx';

const STORAGE_KEYS = {
  events: 'menu-app-events',
  restaurants: 'menu-app-restaurants',
  resTemplate: 'menu-app-resTemplate',
  orderTemplate: 'menu-app-orderTemplate',
  globalNotice: 'menu-app-globalNotice',
  assignTitle: 'menu-app-assignTitle',
  assignDesc: 'menu-app-assignDesc',
};

function loadFromStorage(key, fallback, validator) {
  try {
    if (typeof window === 'undefined' || window.localStorage == null) return fallback;
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    if (validator != null && !validator(parsed)) return fallback;
    return parsed;
  } catch (e) {
    return fallback;
  }
}

export default function App() {
  const [adminTab, setAdminTab] = useState('events');
  const [restaurants, setRestaurants] = useState(() =>
    loadFromStorage(STORAGE_KEYS.restaurants, INITIAL_RESTAURANTS, (v) => Array.isArray(v))
  );
  const [events, setEvents] = useState(() =>
    loadFromStorage(STORAGE_KEYS.events, INITIAL_EVENTS, (v) => Array.isArray(v))
  );
  const [showOrderModal, setShowOrderModal] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [resTemplate, setResTemplate] = useState(() =>
    loadFromStorage(STORAGE_KEYS.resTemplate, DEFAULT_RESERVATION_TEMPLATE, (v) => typeof v === 'string')
  );
  const [orderTemplate, setOrderTemplate] = useState(() =>
    loadFromStorage(STORAGE_KEYS.orderTemplate, DEFAULT_ORDER_TEMPLATE, (v) => typeof v === 'string')
  );
  const [globalNotice, setGlobalNotice] = useState(() =>
    loadFromStorage(STORAGE_KEYS.globalNotice, DEFAULT_GLOBAL_NOTICE, (v) => typeof v === 'string')
  );
  const [assignTitle, setAssignTitle] = useState(() =>
    loadFromStorage(STORAGE_KEYS.assignTitle, DEFAULT_ASSIGN_TITLE, (v) => typeof v === 'string')
  );
  const [assignDesc, setAssignDesc] = useState(() =>
    loadFromStorage(STORAGE_KEYS.assignDesc, DEFAULT_ASSIGN_DESC, (v) => typeof v === 'string')
  );
  const [toast, setToast] = useState(null);
  const [baseUrl, setBaseUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setBaseUrl(getBaseUrl());
  }, []);

  useEffect(() => {
    try {
      if (events != null) localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
    } catch (e) {}
  }, [events]);

  useEffect(() => {
    try {
      if (restaurants != null) localStorage.setItem(STORAGE_KEYS.restaurants, JSON.stringify(restaurants));
    } catch (e) {}
  }, [restaurants]);

  useEffect(() => {
    try {
      if (resTemplate != null) localStorage.setItem(STORAGE_KEYS.resTemplate, JSON.stringify(resTemplate));
    } catch (e) {}
  }, [resTemplate]);

  useEffect(() => {
    try {
      if (orderTemplate != null) localStorage.setItem(STORAGE_KEYS.orderTemplate, JSON.stringify(orderTemplate));
    } catch (e) {}
  }, [orderTemplate]);

  useEffect(() => {
    try {
      if (globalNotice != null) localStorage.setItem(STORAGE_KEYS.globalNotice, JSON.stringify(globalNotice));
    } catch (e) {}
  }, [globalNotice]);

  useEffect(() => {
    try {
      if (assignTitle != null) localStorage.setItem(STORAGE_KEYS.assignTitle, JSON.stringify(assignTitle));
    } catch (e) {}
  }, [assignTitle]);

  useEffect(() => {
    try {
      if (assignDesc != null) localStorage.setItem(STORAGE_KEYS.assignDesc, JSON.stringify(assignDesc));
    } catch (e) {}
  }, [assignDesc]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const addEvent = (newEvent) => {
    setEvents(prev => [{ ...newEvent, id: `evt-${Date.now()}`, status: 'res_pending', resData: null, assignedRestaurantId: null, assignedGroups: null, latestOrder: null, unreadRes: false, unreadOrder: false }, ...prev]);
    showToast('새 행사가 등록되었습니다.');
  };

  const submitReservation = (eventId, dataList) => {
    setEvents(prev => prev.map(evt =>
      evt.id === eventId ? { ...evt, status: 'res_submitted', resData: dataList, unreadRes: true } : evt
    ));
    showToast('예약 정보가 전송되었습니다.');
  };

  const assignRestaurant = (eventId, restaurantId) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== eventId) return evt;
      const resData = (evt.resData || []).map(r => ({ ...r, assignedRestaurantId: restaurantId }));
      return { ...evt, status: 'assigned', resData, assignedRestaurantId: restaurantId, assignedGroups: null, unreadRes: false };
    }));
    setShowAssignModal(null);
    showToast('지점 배정이 완료되었습니다.');
  };

  const assignPerRow = (eventId, resDataWithAssignments) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== eventId) return evt;
      const groups = resDataWithAssignments
        .filter(r => r.assignedRestaurantId)
        .map((r, idx) => ({ id: r.id, name: `일정 ${idx + 1}: ${getFormattedDateWithDay(r.date) || r.date || '날짜'}`, restaurantId: r.assignedRestaurantId, time: r.arrivalTime, headcount: r.headcount, menuType: r.menuType }));
      return { ...evt, status: 'assigned', resData: resDataWithAssignments, assignedRestaurantId: null, assignedGroups: groups.length ? groups : null, unreadRes: false };
    }));
    setShowAssignModal(null);
    showToast('일자별 식당 배정이 완료되었습니다.');
  };

  const submitOrder = (eventId, roomOrders, paymentMethod, restaurantName, groupId = null, orderNote = '', isReplacing = false) => {
    const newOrder = { id: `ord-${Date.now()}`, groupId, restaurantName, rooms: roomOrders, paymentMethod, note: orderNote || undefined, timestamp: new Date().toISOString(), isReorder: isReplacing, needsAdminCheck: isReplacing };
    setEvents(prev => prev.map(evt => {
      if (evt.id !== eventId) return evt;
      let orders = evt.orders || [];
      if (isReplacing && groupId) {
        orders = orders.filter(o => o.groupId !== groupId);
      }
      orders = [...orders, newOrder];
      return { ...evt, status: 'ordered', unreadOrder: true, orders, latestOrder: newOrder };
    }));
    showToast(isReplacing ? '수정 주문이 반영되었습니다.' : '메뉴 취합 내역이 수신되었습니다.');
  };

  const resetEvent = (eventId) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          status: 'res_pending',
          resData: null,
          assignedRestaurantId: null,
          assignedGroups: null,
          orders: [],
          latestOrder: null,
          unreadRes: false,
          unreadOrder: false
        };
      }
      return evt;
    }));
    showToast('행사 상태가 초기화되었습니다. 다시 테스트하세요.');
  };

  const markOrderRead = (eventId) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== eventId) return evt;
      const orders = (evt.orders || []).map(o => ({ ...o, needsAdminCheck: false }));
      return { ...evt, unreadOrder: false, orders: orders.length ? orders : evt.orders };
    }));
    setShowOrderModal(null);
  };

  const copyToClipboard = (text) => {
    copyTextToClipboard(text).then(() => showToast('클립보드에 복사되었습니다.')).catch(() => showToast('클립보드에 복사되었습니다.'));
  };

  const generateLink = (type, eventId) => {
    return `${baseUrl}${type}/${eventId}`;
  };

  const onSaveTemplate = (rt, ot, nt, at, ad) => {
    setResTemplate(rt);
    setOrderTemplate(ot);
    setGlobalNotice(nt);
    setAssignTitle(at);
    setAssignDesc(ad);
    setShowTemplateModal(false);
    showToast('모든 설정이 저장되었습니다.');
  };

  const onUpdateRestaurants = (action, payload) => {
    if (action === 'add') setRestaurants(p => [{ ...payload, id: `rest-${Date.now()}` }, ...p]);
    else if (action === 'update') setRestaurants(p => p.map(x => x.id === payload.id ? payload : x));
    else if (action === 'delete') setRestaurants(p => p.filter(x => x.id !== payload));
  };

  return (
    <div className="font-sans antialiased text-stone-900 bg-stone-50 min-h-screen">
      <Routes>
        <Route path="/" element={
          <AdminPage
            events={events}
            restaurants={restaurants}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            showOrderModal={showOrderModal}
            setShowOrderModal={setShowOrderModal}
            showLinkModal={showLinkModal}
            setShowLinkModal={setShowLinkModal}
            showAssignModal={showAssignModal}
            setShowAssignModal={setShowAssignModal}
            showTemplateModal={showTemplateModal}
            setShowTemplateModal={setShowTemplateModal}
            resTemplate={resTemplate}
            orderTemplate={orderTemplate}
            globalNotice={globalNotice}
            assignTitle={assignTitle}
            assignDesc={assignDesc}
            baseUrl={baseUrl}
            toast={toast}
            addEvent={addEvent}
            onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))}
            onResetEvent={resetEvent}
            onOpenLinkModal={(evt, type, groupId, group) => setShowLinkModal({ event: evt, type, groupId, group })}
            onOpenAssign={(evt) => setShowAssignModal(evt)}
            onOpenOrder={(evt, groupId) => setShowOrderModal({ event: evt, groupId })}
            onOpenTemplate={() => setShowTemplateModal(true)}
            generateLink={generateLink}
            assignRestaurant={assignRestaurant}
            assignPerRow={assignPerRow}
            onSaveTemplate={onSaveTemplate}
            markOrderRead={markOrderRead}
            copyToClipboard={copyToClipboard}
            showToast={showToast}
            onUpdateRestaurants={onUpdateRestaurants}
          />
        } />
        <Route path="/res/:eventId" element={
          <UserPage
            events={events}
            allRestaurants={restaurants}
            globalNotice={globalNotice}
            assignTitle={assignTitle}
            assignDesc={assignDesc}
            mode="res"
            onSubmitRes={(id, data) => { submitReservation(id, data); navigate('/'); }}
            onSubmitOrder={(id, orders, pay, restName, groupId, note, isReplacing) => { submitOrder(id, orders, pay, restName, groupId, note, isReplacing); navigate('/'); }}
            onBack={() => navigate('/')}
          />
        } />
        <Route path="/order/:eventId" element={
          <UserPage
            events={events}
            allRestaurants={restaurants}
            globalNotice={globalNotice}
            assignTitle={assignTitle}
            assignDesc={assignDesc}
            mode="order"
            onSubmitRes={(id, data) => { submitReservation(id, data); navigate('/'); }}
            onSubmitOrder={(id, orders, pay, restName, groupId, note, isReplacing) => { submitOrder(id, orders, pay, restName, groupId, note, isReplacing); navigate('/'); }}
            onBack={() => navigate('/')}
          />
        } />
        <Route path="/reservations" element={
          <ReservationListPage onBack={() => navigate('/')} showToast={showToast} />
        } />
      </Routes>
    </div>
  );
}
