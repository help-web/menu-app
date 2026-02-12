const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatOneDate(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : `${dateStr} (${DAY_NAMES[d.getDay()]})`;
}

export function getFormattedDateWithDay(dateStr) {
  if (!dateStr) return "";
  if (dateStr.includes('~')) {
    const parts = dateStr.split('~').map(p => p.trim());
    return parts.map(formatOneDate).join(' ~ ');
  }
  return formatOneDate(dateStr);
}

/** 여러 범위/단일 날짜가 쉼표로 구분된 문자열을 세그먼트 배열로 반환 (줄바꿈 시 범위가 끊기지 않도록 UI에서 세그먼트 단위로 렌더링용) */
export function getFormattedDateWithDaySegments(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return [];
  const segments = dateStr.split(',').map(s => s.trim()).filter(Boolean);
  return segments.map((seg) => {
    if (seg.includes('~')) {
      const [s, e] = seg.split('~').map(p => p.trim());
      return `${formatOneDate(s)} ~ ${formatOneDate(e)}`;
    }
    return formatOneDate(seg);
  });
}

/** 여러 날짜/범위 문자열을 "23일~24일 2일 + 26일 1일" 형태로 포맷 (쉼표로 구분된 범위 또는 단일 날짜) */
export function formatEventDateDisplay(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const segments = dateStr.split(',').map(s => s.trim()).filter(Boolean);
  const parts = [];
  for (const seg of segments) {
    if (seg.includes('~')) {
      const [s, e] = seg.split('~').map(x => x.trim());
      const start = new Date(s);
      const end = new Date(e);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
      const startDay = start.getDate();
      const endDay = end.getDate();
      const days = Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1;
      parts.push(`${startDay}일~${endDay}일 ${days}일`);
    } else {
      const d = new Date(seg);
      if (isNaN(d.getTime())) continue;
      parts.push(`${d.getDate()}일 1일`);
    }
  }
  return parts.join(' + ') || dateStr;
}

/** dateEntries 배열을 event.date 저장용 문자열로 직렬화 */
export function serializeDateEntries(entries) {
  if (!entries || !Array.isArray(entries) || entries.length === 0) return '';
  return entries
    .map((e) => {
      if (e.type === 'range' && e.start && e.end) return `${e.start}~${e.end}`;
      if (e.type === 'single' && e.date) return e.date;
      return null;
    })
    .filter(Boolean)
    .join(',');
}

/** event.date 문자열을 dateEntries 배열로 파싱 (폼 초기값용) */
export function parseDateEntries(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return [{ id: 1, type: 'range', start: '', end: '' }];
  const segments = dateStr.split(',').map(s => s.trim()).filter(Boolean);
  if (segments.length === 0) return [{ id: 1, type: 'range', start: '', end: '' }];
  return segments.map((seg, idx) => {
    if (seg.includes('~')) {
      const [start, end] = seg.split('~').map(x => x.trim());
      return { id: Date.now() + idx, type: 'range', start: start || '', end: end || '' };
    }
    return { id: Date.now() + idx, type: 'single', date: seg };
  });
}

export function getBaseUrl() {
  if (import.meta.env.PROD) {
    if (typeof window === 'undefined') return '';
    return window.location.origin + '/';
  }
  return 'https://menu-app-eight-liard.vercel.app/';
}

export function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  return Promise.resolve();
}

/** 식당에서 일품/정식/식사 메뉴 배열 반환 (하위 호환: items 있으면 ilpumMenus로 사용) */
export function getRestaurantMenus(restaurant) {
  if (!restaurant) return { ilpumMenus: [], setMenus: [], mealOptions: [] };
  const ilpum = Array.isArray(restaurant.ilpumMenus) && restaurant.ilpumMenus.length > 0
    ? restaurant.ilpumMenus
    : (Array.isArray(restaurant.items) ? restaurant.items : []);
  const setMenus = Array.isArray(restaurant.setMenus) ? restaurant.setMenus : [];
  const mealOptions = Array.isArray(restaurant.mealOptions) ? restaurant.mealOptions : [];
  return { ilpumMenus: ilpum, setMenus, mealOptions };
}
