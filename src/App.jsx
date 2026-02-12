import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase.js';
import {
  DEFAULT_RESERVATION_TEMPLATE,
  DEFAULT_ORDER_TEMPLATE,
  DEFAULT_GLOBAL_NOTICE,
  DEFAULT_ASSIGN_TITLE,
  DEFAULT_ASSIGN_DESC,
} from './data/initialData.js';
import { getBaseUrl, copyTextToClipboard, getFormattedDateWithDay } from './utils/helpers.js';
import AdminPage from './pages/AdminPage.jsx';
import UserPage from './pages/UserPage.jsx';
import ReservationListPage from './pages/ReservationListPage.jsx';

const STORAGE_KEYS = {
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

function eventRowToApp(row) {
  if (!row) return null;
  return {
    id: row.id,
    orgName: row.org_name ?? '',
    manager: row.manager ?? '',
    contact: row.contact ?? '',
    date: row.date ?? '',
    status: row.status ?? 'res_pending',
    resData: row.res_data ?? null,
    assignedRestaurantId: row.assigned_restaurant_id ?? null,
    assignedGroups: row.assigned_groups ?? null,
    orders: row.orders ?? [],
    latestOrder: row.latest_order ?? null,
    unreadRes: row.unread_res ?? false,
    unreadOrder: row.unread_order ?? false,
  };
}

function eventAppToRow(evt) {
  return {
    org_name: evt.orgName,
    manager: evt.manager,
    contact: evt.contact,
    date: evt.date,
    status: evt.status,
    res_data: evt.resData,
    assigned_restaurant_id: evt.assignedRestaurantId,
    assigned_groups: evt.assignedGroups,
    orders: evt.orders ?? [],
    latest_order: evt.latestOrder,
    unread_res: evt.unreadRes ?? false,
    unread_order: evt.unreadOrder ?? false,
  };
}

function restaurantRowToApp(row) {
  if (!row) return null;
  const ilpum = Array.isArray(row.ilpum_menus) ? row.ilpum_menus : [];
  const setMenus = Array.isArray(row.set_menus) ? row.set_menus : [];
  const mealOptions = Array.isArray(row.meal_options) ? row.meal_options : [];
  const items = Array.isArray(row.items) ? row.items : [];
  return {
    id: row.id,
    name: row.name ?? '',
    menuImage: row.menu_image ?? '',
    mapImage: row.map_image ?? '',
    items: ilpum.length > 0 ? ilpum : items,
    ilpumMenus: ilpum.length > 0 ? ilpum : items,
    setMenus,
    mealOptions,
  };
}

function restaurantAppToRow(r) {
  return {
    name: r.name,
    menu_image: r.menuImage ?? '',
    map_image: r.mapImage ?? '',
    items: r.ilpumMenus ?? r.items ?? [],
    ilpum_menus: r.ilpumMenus ?? [],
    set_menus: r.setMenus ?? [],
    meal_options: r.mealOptions ?? [],
  };
}

export default function App() {
  const [adminTab, setAdminTab] = useState('events');
  const [restaurants, setRestaurants] = useState([]);
  const [events, setEvents] = useState([]);
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
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setBaseUrl(getBaseUrl());
  }, []);

  const fetchData = async () => {
    try {
      const { data: restaurantData } = await supabase.from('restaurants').select('*');
      const { data: eventData } = await supabase.from('events').select('*');

      if (Array.isArray(restaurantData)) {
        setRestaurants(restaurantData.map(restaurantRowToApp).filter(Boolean));
      }
      if (Array.isArray(eventData)) {
        setEvents(eventData.map(eventRowToApp).filter(Boolean));
      }
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const addEvent = async (newEvent) => {
    const row = {
      org_name: newEvent.orgName,
      manager: newEvent.manager ?? '',
      contact: newEvent.contact ?? '',
      date: newEvent.date,
      status: 'res_pending',
      res_data: null,
      assigned_restaurant_id: null,
      assigned_groups: null,
      orders: [],
      latest_order: null,
      unread_res: false,
      unread_order: false,
    };
    const { data, error } = await supabase.from('events').insert([row]).select();
    if (!error && data?.[0]) {
      setEvents((prev) => [eventRowToApp(data[0]), ...prev]);
      showToast('새 행사가 등록되었습니다.');
    }
  };

  const persistEvent = async (eventId, nextEvt) => {
    await supabase
      .from('events')
      .update(eventAppToRow(nextEvt))
      .eq('id', eventId);
  };

  const submitReservation = async (eventId, dataList) => {
    const next = (evt) =>
      evt.id === eventId
        ? { ...evt, status: 'res_submitted', resData: dataList, unreadRes: true }
        : evt;
    setEvents((prev) => prev.map(next));
    const evt = events.find((e) => e.id === eventId);
    if (evt) await persistEvent(eventId, { ...evt, status: 'res_submitted', resData: dataList, unreadRes: true });
    showToast('예약 정보가 전송되었습니다.');
  };

  const assignRestaurant = async (eventId, restaurantId) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;
    const resData = (evt.resData || []).map((r) => ({ ...r, assignedRestaurantId: restaurantId }));
    const nextEvt = {
      ...evt,
      status: 'assigned',
      resData,
      assignedRestaurantId: restaurantId,
      assignedGroups: null,
      unreadRes: false,
    };
    setEvents((prev) => prev.map((e) => (e.id === eventId ? nextEvt : e)));
    setShowAssignModal(null);
    await persistEvent(eventId, nextEvt);
    showToast('지점 배정이 완료되었습니다.');
  };

  const assignPerRow = async (eventId, resDataWithAssignments) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;
    const groups = resDataWithAssignments
      .filter((r) => r.assignedRestaurantId)
      .map((r, idx) => ({
        id: r.id,
        name: `일정 ${idx + 1}: ${getFormattedDateWithDay(r.date) || r.date || '날짜'}`,
        restaurantId: r.assignedRestaurantId,
        time: r.arrivalTime,
        headcount: r.headcount,
        menuType: r.menuType,
      }));
    const nextEvt = {
      ...evt,
      status: 'assigned',
      resData: resDataWithAssignments,
      assignedRestaurantId: null,
      assignedGroups: groups.length ? groups : null,
      unreadRes: false,
    };
    setEvents((prev) => prev.map((e) => (e.id === eventId ? nextEvt : e)));
    setShowAssignModal(null);
    await persistEvent(eventId, nextEvt);
    showToast('일자별 식당 배정이 완료되었습니다.');
  };

  const submitOrder = async (eventId, orderPayload, groupId = null, isReplacing = false) => {
    const {
      restaurantName,
      paymentMethod,
      note: orderNote,
      menuType,
      rooms: roomOrders,
      setType,
      setQuantity,
      mealSelections,
      setPrice,
      mealTotal,
    } = orderPayload;
    const newOrder = {
      id: `ord-${Date.now()}`,
      groupId,
      restaurantName,
      paymentMethod,
      note: orderNote || undefined,
      timestamp: new Date().toISOString(),
      isReorder: isReplacing,
      needsAdminCheck: isReplacing,
      menuType: menuType || 'ilpum',
      rooms: roomOrders ?? undefined,
      setType,
      setQuantity,
      mealSelections: mealSelections ?? undefined,
      setPrice,
      mealTotal,
    };
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;
    let orders = evt.orders || [];
    if (isReplacing && groupId) {
      orders = orders.filter((o) => o.groupId !== groupId);
    }
    orders = [...orders, newOrder];
    const nextEvt = { ...evt, status: 'ordered', unreadOrder: true, orders, latestOrder: newOrder };
    setEvents((prev) => prev.map((e) => (e.id === eventId ? nextEvt : e)));
    await persistEvent(eventId, nextEvt);
    showToast(isReplacing ? '수정 주문이 반영되었습니다.' : '메뉴 취합 내역이 수신되었습니다.');
  };

  const resetEvent = async (eventId) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;
    const nextEvt = {
      ...evt,
      status: 'res_pending',
      resData: null,
      assignedRestaurantId: null,
      assignedGroups: null,
      orders: [],
      latestOrder: null,
      unreadRes: false,
      unreadOrder: false,
    };
    setEvents((prev) => prev.map((e) => (e.id === eventId ? nextEvt : e)));
    await persistEvent(eventId, nextEvt);
    showToast('행사 상태가 초기화되었습니다. 다시 테스트하세요.');
  };

  const markOrderRead = async (eventId) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;
    const orders = (evt.orders || []).map((o) => ({ ...o, needsAdminCheck: false }));
    const nextEvt = { ...evt, unreadOrder: false, orders: orders.length ? orders : evt.orders };
    setEvents((prev) => prev.map((e) => (e.id === eventId ? nextEvt : e)));
    setShowOrderModal(null);
    await persistEvent(eventId, nextEvt);
  };

  const copyToClipboard = (text) => {
    copyTextToClipboard(text)
      .then(() => showToast('클립보드에 복사되었습니다.'))
      .catch(() => showToast('클립보드에 복사되었습니다.'));
  };

  const generateLink = (type, eventId) => {
    return `${getBaseUrl()}${type}/${eventId}`;
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

  const onUpdateRestaurants = async (action, payload) => {
    if (action === 'add') {
      const row = restaurantAppToRow(payload);
      const { data, error } = await supabase.from('restaurants').insert([row]).select();
      if (!error && data?.[0]) {
        setRestaurants((prev) => [restaurantRowToApp(data[0]), ...prev]);
      }
    } else if (action === 'update') {
      const row = restaurantAppToRow(payload);
      const { error } = await supabase.from('restaurants').update(row).eq('id', payload.id);
      if (!error) {
        setRestaurants((prev) => prev.map((x) => (x.id === payload.id ? { ...payload } : x)));
      }
    } else if (action === 'delete') {
      const { error } = await supabase.from('restaurants').delete().eq('id', payload);
      if (!error) {
        setRestaurants((prev) => prev.filter((x) => x.id !== payload));
      }
    }
  };

  const onDeleteEvent = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="font-sans antialiased text-stone-900 bg-stone-50 min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
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
              onDeleteEvent={onDeleteEvent}
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
          }
        />
        <Route
          path="/res/:eventId"
          element={
            <UserPage
              loading={dataLoading}
              events={events}
              allRestaurants={restaurants}
              globalNotice={globalNotice}
              assignTitle={assignTitle}
              assignDesc={assignDesc}
              mode="res"
              onSubmitRes={(id, data) => {
                submitReservation(id, data);
                navigate('/');
              }}
              onSubmitOrder={(id, orderPayload, groupId, isReplacing) => {
                submitOrder(id, orderPayload, groupId, isReplacing);
                navigate('/');
              }}
              onBack={() => navigate('/')}
            />
          }
        />
        <Route
          path="/order/:eventId"
          element={
            <UserPage
              loading={dataLoading}
              events={events}
              allRestaurants={restaurants}
              globalNotice={globalNotice}
              assignTitle={assignTitle}
              assignDesc={assignDesc}
              mode="order"
              onSubmitRes={(id, data) => {
                submitReservation(id, data);
                navigate('/');
              }}
              onSubmitOrder={(id, orderPayload, groupId, isReplacing) => {
                submitOrder(id, orderPayload, groupId, isReplacing);
                navigate('/');
              }}
              onBack={() => navigate('/')}
            />
          }
        />
        <Route path="/reservations" element={<ReservationListPage onBack={() => navigate('/')} showToast={showToast} />} />
      </Routes>
    </div>
  );
}
