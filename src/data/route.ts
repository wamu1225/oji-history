export interface RouteStop {
  id: string;
  order: number;
  name: string;
  category: 'faith' | 'heritage';
  note: string;
  articleSlug: string;
  lat: number;
  lng: number;
}

// 緯度経度は公表されている施設の座標（地図サービスの検索結果）にもとづく概算値。
// 測量精度の座標ではなく、実座標から算出した相対位置の目安として扱う。
export const routeStops: RouteStop[] = [
  {
    id: 'asukayama',
    order: 1,
    name: '飛鳥山公園',
    category: 'heritage',
    note: '飛鳥山碑・晩香廬・青淵文庫など、吉宗の桜と渋沢栄一の近代がともに残る起点',
    articleSlug: 'asukayama-takinogawa',
    lat: 35.7515,
    lng: 139.7376,
  },
  {
    id: 'oji-jinja',
    order: 2,
    name: '王子神社',
    category: 'faith',
    note: '若一王子を祀り「王子」の地名を生んだ社。夏には王子田楽が奉納される',
    articleSlug: 'oji-jinja',
    lat: 35.7532,
    lng: 139.7358,
  },
  {
    id: 'oji-inari',
    order: 3,
    name: '王子稲荷神社',
    category: 'faith',
    note: '落語「王子の狐」の舞台。装束稲荷から続く狐火伝承の到着点',
    articleSlug: 'oji-jinja',
    lat: 35.7562,
    lng: 139.7334,
  },
  {
    id: 'nanushi-no-taki',
    order: 4,
    name: '名主の滝公園',
    category: 'heritage',
    note: '王子七滝のうち唯一現存する滝。2028年3月末まで男滝は工事で停止中',
    articleSlug: 'asukayama-takinogawa',
    lat: 35.7574,
    lng: 139.7323,
  },
  {
    id: 'akarenga-library',
    order: 5,
    name: '北区立中央図書館（赤レンガ図書館）',
    category: 'heritage',
    note: '大正8年築の陸軍弾丸工場を保存活用。軍需施設が公共施設に転用された姿',
    articleSlug: 'akarenga-library',
    lat: 35.7563,
    lng: 139.7293,
  },
  {
    id: 'sozoku-inari',
    order: 6,
    name: '装束稲荷神社',
    category: 'faith',
    note: '大晦日、関八州の狐が装束を整えたという伝承の地。王子駅にもっとも近い',
    articleSlug: 'sozoku-inari',
    lat: 35.7564,
    lng: 139.7379,
  },
];
