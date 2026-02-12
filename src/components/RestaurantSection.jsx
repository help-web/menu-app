import { useState, useRef } from 'react';
import { Plus, X, Store, Upload, CheckCircle2, Edit2, Trash2, UtensilsCrossed, LayoutGrid, Coffee } from 'lucide-react';
import { getRestaurantMenus } from '../utils/helpers.js';

const emptyForm = () => ({
  name: '',
  menuImage: '',
  mapImage: '',
  ilpumMenus: [],
  setMenus: [],
  mealOptions: [],
});

function MenuBlock({ title, icon: Icon, items, onAdd, onRemove, newItem, setNewItem, placeholderName = '메뉴 이름' }) {
  return (
    <div className="bg-stone-50 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border border-stone-100 shadow-inner w-full min-w-0">
      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest px-1 mb-3 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-emerald-600" />}
        {title}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
        <input
          className="flex-1 w-full min-w-0 bg-white border-none rounded-xl sm:rounded-2xl p-3 sm:p-4 text-sm shadow-sm font-bold"
          placeholder={placeholderName}
          value={newItem.name}
          onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          className="w-full sm:w-28 md:w-32 min-w-0 bg-white border-none rounded-xl sm:rounded-2xl p-3 sm:p-4 text-sm shadow-sm font-bold"
          placeholder="가격(원)"
          type="number"
          value={newItem.price}
          onChange={e => setNewItem(prev => ({ ...prev, price: e.target.value === '' ? '' : parseInt(e.target.value) }))}
        />
        <button
          type="button"
          onClick={() => {
            if (newItem.name && newItem.price !== '' && Number(newItem.price) >= 0) {
              onAdd({ id: Date.now(), name: newItem.name, price: Number(newItem.price) });
              setNewItem({ name: '', price: '' });
            }
          }}
          className="w-full sm:w-auto bg-stone-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black active:scale-[0.98] transition shadow-lg hover:bg-black shrink-0"
        >
          추가
        </button>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {items.map(item => (
          <span
            key={item.id}
            className="bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border text-xs font-black flex items-center gap-2 sm:gap-3 shadow-sm border-stone-100 max-w-full min-w-0"
          >
            <span className="truncate">{item.name}</span>
            <span className="text-emerald-600 shrink-0">{Number(item.price).toLocaleString()}원</span>
            <button type="button" onClick={() => onRemove(item.id)} className="text-stone-300 hover:text-red-500 transition-colors shrink-0">
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RestaurantSection({ restaurants, onAdd, onUpdate, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [newIlpum, setNewIlpum] = useState({ name: '', price: '' });
  const [newSet, setNewSet] = useState({ name: '', price: '' });
  const [newMeal, setNewMeal] = useState({ name: '', price: '' });
  const menuRef = useRef(null);
  const mapRef = useRef(null);
  const handleFile = (e, t) => {
    const f = e.target.files[0];
    if (f) {
      const r = new FileReader();
      r.onloadend = () => setForm(p => ({ ...p, [t]: r.result }));
      r.readAsDataURL(f);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openForm = (rest = null) => {
    if (rest) {
      const { ilpumMenus, setMenus, mealOptions } = getRestaurantMenus(rest);
      setForm({
        ...rest,
        name: rest.name ?? '',
        menuImage: rest.menuImage ?? '',
        mapImage: rest.mapImage ?? '',
        ilpumMenus: ilpumMenus.map((i, idx) => ({ ...i, id: i.id ?? Date.now() + idx })),
        setMenus: setMenus.map((i, idx) => ({ ...i, id: i.id ?? Date.now() + idx + 1000 })),
        mealOptions: mealOptions.map((i, idx) => ({ ...i, id: i.id ?? Date.now() + idx + 2000 })),
      });
      setIsEditing(true);
    } else {
      setForm(emptyForm());
      setIsEditing(false);
    }
    setNewIlpum({ name: '', price: '' });
    setNewSet({ name: '', price: '' });
    setNewMeal({ name: '', price: '' });
    setShowAdd(true);
    scrollToTop();
  };

  const closeForm = () => {
    setShowAdd(false);
    setIsEditing(false);
    setForm(emptyForm());
  };

  const saveForm = () => {
    const payload = {
      ...form,
      ilpumMenus: form.ilpumMenus || [],
      setMenus: form.setMenus || [],
      mealOptions: form.mealOptions || [],
    };
    if (isEditing) onUpdate(payload);
    else onAdd(payload);
    closeForm();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 font-black w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight break-words">식당 라이브러리</h2>
        <button
          type="button"
          onClick={() => (showAdd ? closeForm() : openForm(null))}
          className="w-full sm:w-auto bg-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg active:scale-[0.98] min-w-0"
        >
          {showAdd ? <X size={18} className="sm:w-5 sm:h-5" /> : <Plus size={18} className="sm:w-5 sm:h-5" />}
          <span className="truncate">{isEditing ? '편집 취소' : showAdd ? '닫기' : '식당 추가'}</span>
        </button>
      </div>
      {showAdd && (
        <div className="bg-white p-4 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-xl border border-stone-100 space-y-6 sm:space-y-8 animate-in slide-in-from-top-4 shadow-stone-200/50 font-black w-full min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="space-y-1.5 min-w-0 sm:col-span-2 md:col-span-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">식당 명칭</label>
              <input
                className="w-full min-w-0 bg-stone-50 border-none rounded-xl sm:rounded-2xl p-4 sm:p-5 focus:ring-2 focus:ring-emerald-500 transition shadow-inner font-bold"
                placeholder="예: 소담 한정식"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 min-w-0">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">메뉴판 파일</label>
              <div
                role="button"
                tabIndex={0}
                onClick={() => menuRef.current?.click()}
                onKeyDown={e => e.key === 'Enter' && menuRef.current?.click()}
                className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center justify-center cursor-pointer hover:border-emerald-300 transition shadow-inner font-bold text-stone-400 text-xs min-w-0"
              >
                <input type="file" ref={menuRef} className="hidden" onChange={e => handleFile(e, 'menuImage')} accept="image/*" />
                {form.menuImage ? <CheckCircle2 className="text-emerald-500 shrink-0" /> : <Upload size={18} className="shrink-0" />}
                <span className="ml-2 truncate">{form.menuImage ? '업로드 완료' : '파일 선택'}</span>
              </div>
            </div>
            <div className="space-y-1.5 min-w-0">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">약도 파일</label>
              <div
                role="button"
                tabIndex={0}
                onClick={() => mapRef.current?.click()}
                onKeyDown={e => e.key === 'Enter' && mapRef.current?.click()}
                className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center justify-center cursor-pointer hover:border-emerald-300 transition shadow-inner font-bold text-stone-400 text-xs min-w-0"
              >
                <input type="file" ref={mapRef} className="hidden" onChange={e => handleFile(e, 'mapImage')} accept="image/*" />
                {form.mapImage ? <CheckCircle2 className="text-emerald-500 shrink-0" /> : <Upload size={18} className="shrink-0" />}
                <span className="ml-2 truncate">{form.mapImage ? '업로드 완료' : '파일 선택'}</span>
              </div>
            </div>
          </div>

          <MenuBlock
            title="일품 메뉴"
            icon={UtensilsCrossed}
            items={form.ilpumMenus || []}
            onAdd={item => setForm(f => ({ ...f, ilpumMenus: [...(f.ilpumMenus || []), item] }))}
            onRemove={id => setForm(f => ({ ...f, ilpumMenus: (f.ilpumMenus || []).filter(i => i.id !== id) }))}
            newItem={newIlpum}
            setNewItem={setNewIlpum}
            placeholderName="일품 메뉴 이름"
          />
          <MenuBlock
            title="정식 메뉴 (정식 A, B 등)"
            icon={LayoutGrid}
            items={form.setMenus || []}
            onAdd={item => setForm(f => ({ ...f, setMenus: [...(f.setMenus || []), item] }))}
            onRemove={id => setForm(f => ({ ...f, setMenus: (f.setMenus || []).filter(i => i.id !== id) }))}
            newItem={newSet}
            setNewItem={setNewSet}
            placeholderName="정식 이름 (예: 정식 A)"
          />
          <MenuBlock
            title="식사 메뉴 (정식 선택 시 함께 선택)"
            icon={Coffee}
            items={form.mealOptions || []}
            onAdd={item => setForm(f => ({ ...f, mealOptions: [...(f.mealOptions || []), item] }))}
            onRemove={id => setForm(f => ({ ...f, mealOptions: (f.mealOptions || []).filter(i => i.id !== id) }))}
            newItem={newMeal}
            setNewItem={setNewMeal}
            placeholderName="식사 메뉴 (예: 냉면, 찌개)"
          />

          <button
            type="button"
            className="w-full bg-stone-900 text-white py-4 sm:py-6 rounded-xl sm:rounded-[1.8rem] font-black text-base sm:text-xl hover:bg-emerald-600 transition shadow-2xl active:scale-[0.98] shadow-stone-900/20"
            onClick={saveForm}
          >
            정보 저장하기
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 w-full min-w-0">
        {restaurants.map(rest => {
          const { ilpumMenus, setMenus, mealOptions } = getRestaurantMenus(rest);
          const total = ilpumMenus.length + setMenus.length + mealOptions.length;
          const subtitle = [ilpumMenus.length && `일품 ${ilpumMenus.length}`, setMenus.length && `정식 ${setMenus.length}`, mealOptions.length && `식사 ${mealOptions.length}`].filter(Boolean).join(' · ') || '메뉴 없음';
          return (
            <div
              key={rest.id}
              className="bg-white rounded-2xl sm:rounded-[3rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-700 group relative shadow-stone-200/50 min-w-0"
            >
              <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20 flex gap-2 sm:gap-2.5 shadow-2xl rounded-xl sm:rounded-2xl">
                <button
                  type="button"
                  onClick={() => openForm(rest)}
                  className="p-3 sm:p-4 bg-white/90 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-white transition shadow-lg"
                >
                  <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(rest.id)}
                  className="p-3 sm:p-4 bg-white/90 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition shadow-lg"
                >
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
              <div className="relative h-56 sm:h-72 overflow-hidden bg-stone-100">
                {rest.menuImage ? (
                  <img src={rest.menuImage} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt={rest.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-200 uppercase tracking-widest text-xs">No Visual Data</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white shadow-inner">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight truncate">{rest.name}</h3>
                  <p className="text-[10px] sm:text-[11px] font-bold text-stone-300 mt-1 sm:mt-2 uppercase tracking-widest flex items-center gap-2 opacity-80">
                    <Store size={12} className="shrink-0" /> {subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
