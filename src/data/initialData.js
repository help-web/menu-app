const DEFAULT_RESERVATION_TEMPLATE = `[위드스페이스 식당 예약 안내]

안녕하세요, {기관명} 담당자님.
원활한 식사 예약을 위해 아래 링크를 통해 일자별 정보(인원, 시간 등)를 입력해 주세요.

▶ 예약 신청 링크: {링크}

* 안내 사항: 예약 현황 및 식당 사정에 따라 식사 장소(A점 또는 B점)가 배정/변경될 수 있는 점 양해 부탁드립니다.`;

const DEFAULT_ORDER_TEMPLATE = `[위드스페이스 메뉴 취합 안내]

안녕하세요, {기관명} 담당자님.
요청하신 식사 장소가 [{배정식당}]으로 확정되었습니다.
아래 링크를 통해 회의실별 메뉴 수량을 최종 선택해 주시기 바랍니다.

▶ 메뉴 선택 링크: {링크}
▶ 확인 사항: 행사 1일 전까지 입력을 완료해 주세요.

감사합니다.`;

const DEFAULT_GLOBAL_NOTICE = `식당 입구에서 예약자 성함을 말씀해 주시면 안내해 드립니다.
알레르기 등 특이사항은 요청 사항 칸에 상세히 기입 부탁드립니다.`;

const DEFAULT_ASSIGN_TITLE = "지점 배정 완료!";
const DEFAULT_ASSIGN_DESC = "확정된 지점에 맞춰 최종 수량을 선택해 주세요.";

const INITIAL_RESTAURANTS = [
  {
    id: 'rest-1',
    name: '충정화로',
    menuImage: 'https://images.unsplash.com/photo-1555243821-208b4317996c?w=1200&q=80',
    mapImage: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=1200&q=80',
    items: [
      { id: 1, name: '갈비탕', price: 15000 },
      { id: 2, name: '육회비빔밥', price: 12000 },
      { id: 3, name: '떡갈비비빔밥', price: 11000 },
      { id: 4, name: '된장찌개', price: 9000 },
      { id: 5, name: '물냉면', price: 9000 },
      { id: 6, name: '비빔냉면', price: 9000 },
      { id: 7, name: '소고기 정식A', price: 30000 },
      { id: 8, name: '소고기 정식B', price: 25000 },
    ]
  },
  {
    id: 'rest-2',
    name: '화우',
    menuImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&q=80',
    mapImage: 'https://images.unsplash.com/photo-1511316730460-1e5828801265?w=1200&q=80',
    items: [
      { id: 9, name: '한우 불고기', price: 28000 },
      { id: 10, name: '낙지 볶음', price: 18000 },
      { id: 11, name: '해물 파전', price: 20000 },
    ]
  }
];

const INITIAL_EVENTS = [
  {
    id: 'evt-101',
    orgName: '한국 비즈니스 협회',
    manager: '이민수',
    contact: '010-1234-5678',
    date: '2024-06-15',
    status: 'res_submitted',
    resData: [
      { id: 1, date: '2024-06-15 ~ 2024-06-17', headcount: '20', arrivalTime: '오후 12:00', restaurantId: 'rest-1', menuType: '정식', paymentMethod: '위드스페이스 결제', note: '' }
    ],
    assignedRestaurantId: null,
    assignedGroups: null,
    latestOrder: null,
    unreadRes: true,
    unreadOrder: false
  }
];

export {
  DEFAULT_RESERVATION_TEMPLATE,
  DEFAULT_ORDER_TEMPLATE,
  DEFAULT_GLOBAL_NOTICE,
  DEFAULT_ASSIGN_TITLE,
  DEFAULT_ASSIGN_DESC,
  INITIAL_RESTAURANTS,
  INITIAL_EVENTS,
};
