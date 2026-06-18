import type { User, Category, Tag, Storyteller, Story, ReviewRecord } from '../types';
import type { Province } from './location';
import { provinces } from './location';

export const users: User[] = [
  {
    id: 'user-001',
    username: 'visitor_wang',
    email: 'visitor@example.com',
    role: 'visitor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor',
    phone: '13800000001',
    bio: '一位热爱民间文化的普通访客',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-20T14:20:00Z',
  },
  {
    id: 'user-002',
    username: 'contributor_li',
    email: 'contributor@example.com',
    role: 'contributor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=contributor',
    phone: '13800000002',
    bio: '民俗文化爱好者，致力于收集和整理民间故事',
    createdAt: '2023-11-20T08:15:00Z',
    updatedAt: '2024-04-10T09:45:00Z',
  },
  {
    id: 'user-003',
    username: 'admin_zhang',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    phone: '13800000003',
    bio: '平台管理员，负责内容审核和用户管理',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-05-01T16:30:00Z',
  },
];

export const categories: Category[] = [
  {
    id: 'cat-001',
    name: '神话传说',
    slug: 'myth-legend',
    description: '关于神仙、英雄、创世等古代神话故事和民间传说',
    icon: '🏛️',
    sort: 1,
    storyCount: 12,
    createdAt: '2023-06-15T10:00:00Z',
  },
  {
    id: 'cat-002',
    name: '历史人物',
    slug: 'historical-figures',
    description: '历史上著名人物的逸闻趣事、传奇故事',
    icon: '👤',
    sort: 2,
    storyCount: 8,
    createdAt: '2023-06-15T10:05:00Z',
  },
  {
    id: 'cat-003',
    name: '地方风物',
    slug: 'local-customs',
    description: '各地山水名胜、特产风物的由来传说',
    icon: '🏞️',
    sort: 3,
    storyCount: 10,
    createdAt: '2023-06-15T10:10:00Z',
  },
  {
    id: 'cat-004',
    name: '民俗仪式',
    slug: 'folk-ceremonies',
    description: '婚丧嫁娶、节日庆典等传统民俗仪式',
    icon: '🎊',
    sort: 4,
    storyCount: 7,
    createdAt: '2023-06-15T10:15:00Z',
  },
  {
    id: 'cat-005',
    name: '鬼怪故事',
    slug: 'ghost-stories',
    description: '狐仙鬼怪、灵异事件等民间志怪故事',
    icon: '👻',
    sort: 5,
    storyCount: 9,
    createdAt: '2023-06-15T10:20:00Z',
  },
  {
    id: 'cat-006',
    name: '民间歌谣',
    slug: 'folk-songs',
    description: '山歌、小调、劳动号子等传统民间歌谣',
    icon: '🎵',
    sort: 6,
    storyCount: 5,
    createdAt: '2023-06-15T10:25:00Z',
  },
  {
    id: 'cat-007',
    name: '谚语谜语',
    slug: 'proverbs-riddles',
    description: '民间谚语、歇后语、谜语及背后的故事',
    icon: '🧩',
    sort: 7,
    storyCount: 5,
    createdAt: '2023-06-15T10:30:00Z',
  },
  {
    id: 'cat-008',
    name: '手工技艺口述',
    slug: 'craft-oral',
    description: '传统手工艺、非遗技艺传承人的口述历史',
    icon: '🎨',
    sort: 8,
    storyCount: 4,
    createdAt: '2023-06-15T10:35:00Z',
  },
];

export const tags: Tag[] = [
  { id: 'tag-001', name: '盘古开天', color: '#FF6B6B', usageCount: 5, createdAt: '2023-07-01T00:00:00Z' },
  { id: 'tag-002', name: '女娲补天', color: '#4ECDC4', usageCount: 4, createdAt: '2023-07-01T00:01:00Z' },
  { id: 'tag-003', name: '夸父追日', color: '#45B7D1', usageCount: 3, createdAt: '2023-07-01T00:02:00Z' },
  { id: 'tag-004', name: '嫦娥奔月', color: '#96CEB4', usageCount: 4, createdAt: '2023-07-01T00:03:00Z' },
  { id: 'tag-005', name: '后羿射日', color: '#FFEAA7', usageCount: 3, createdAt: '2023-07-01T00:04:00Z' },
  { id: 'tag-006', name: '精卫填海', color: '#DDA0DD', usageCount: 2, createdAt: '2023-07-01T00:05:00Z' },
  { id: 'tag-007', name: '八仙过海', color: '#98D8C8', usageCount: 4, createdAt: '2023-07-01T00:06:00Z' },
  { id: 'tag-008', name: '白蛇传', color: '#F7DC6F', usageCount: 5, createdAt: '2023-07-01T00:07:00Z' },
  { id: 'tag-009', name: '梁山伯与祝英台', color: '#BB8FCE', usageCount: 4, createdAt: '2023-07-01T00:08:00Z' },
  { id: 'tag-010', name: '孟姜女哭长城', color: '#85C1E9', usageCount: 3, createdAt: '2023-07-01T00:09:00Z' },
  { id: 'tag-011', name: '牛郎织女', color: '#F8B500', usageCount: 5, createdAt: '2023-07-01T00:10:00Z' },
  { id: 'tag-012', name: '孔子', color: '#E74C3C', usageCount: 6, createdAt: '2023-07-01T00:11:00Z' },
  { id: 'tag-013', name: '诸葛亮', color: '#3498DB', usageCount: 5, createdAt: '2023-07-01T00:12:00Z' },
  { id: 'tag-014', name: '岳飞', color: '#2ECC71', usageCount: 4, createdAt: '2023-07-01T00:13:00Z' },
  { id: 'tag-015', name: '关羽', color: '#E67E22', usageCount: 5, createdAt: '2023-07-01T00:14:00Z' },
  { id: 'tag-016', name: '李白', color: '#9B59B6', usageCount: 4, createdAt: '2023-07-01T00:15:00Z' },
  { id: 'tag-017', name: '杜甫', color: '#1ABC9C', usageCount: 3, createdAt: '2023-07-01T00:16:00Z' },
  { id: 'tag-018', name: '苏东坡', color: '#F39C12', usageCount: 4, createdAt: '2023-07-01T00:17:00Z' },
  { id: 'tag-019', name: '长城', color: '#C0392B', usageCount: 6, createdAt: '2023-07-01T00:18:00Z' },
  { id: 'tag-020', name: '黄河', color: '#D35400', usageCount: 5, createdAt: '2023-07-01T00:19:00Z' },
  { id: 'tag-021', name: '长江', color: '#2980B9', usageCount: 5, createdAt: '2023-07-01T00:20:00Z' },
  { id: 'tag-022', name: '西湖', color: '#27AE60', usageCount: 4, createdAt: '2023-07-01T00:21:00Z' },
  { id: 'tag-023', name: '泰山', color: '#8E44AD', usageCount: 4, createdAt: '2023-07-01T00:22:00Z' },
  { id: 'tag-024', name: '黄山', color: '#16A085', usageCount: 3, createdAt: '2023-07-01T00:23:00Z' },
  { id: 'tag-025', name: '故宫', color: '#C0392B', usageCount: 5, createdAt: '2023-07-01T00:24:00Z' },
  { id: 'tag-026', name: '春节', color: '#E74C3C', usageCount: 7, createdAt: '2023-07-01T00:25:00Z' },
  { id: 'tag-027', name: '端午节', color: '#27AE60', usageCount: 5, createdAt: '2023-07-01T00:26:00Z' },
  { id: 'tag-028', name: '中秋节', color: '#F39C12', usageCount: 6, createdAt: '2023-07-01T00:27:00Z' },
  { id: 'tag-029', name: '清明节', color: '#7F8C8D', usageCount: 4, createdAt: '2023-07-01T00:28:00Z' },
  { id: 'tag-030', name: '重阳节', color: '#D35400', usageCount: 3, createdAt: '2023-07-01T00:29:00Z' },
  { id: 'tag-031', name: '元宵节', color: '#E91E63', usageCount: 4, createdAt: '2023-07-01T00:30:00Z' },
  { id: 'tag-032', name: '婚礼习俗', color: '#FF4081', usageCount: 5, createdAt: '2023-07-01T00:31:00Z' },
  { id: 'tag-033', name: '丧葬文化', color: '#607D8B', usageCount: 3, createdAt: '2023-07-01T00:32:00Z' },
  { id: 'tag-034', name: '狐仙', color: '#FF9800', usageCount: 5, createdAt: '2023-07-01T00:33:00Z' },
  { id: 'tag-035', name: '聊斋志异', color: '#795548', usageCount: 4, createdAt: '2023-07-01T00:34:00Z' },
  { id: 'tag-036', name: '鬼故事', color: '#37474F', usageCount: 6, createdAt: '2023-07-01T00:35:00Z' },
  { id: 'tag-037', name: '灵异事件', color: '#455A64', usageCount: 4, createdAt: '2023-07-01T00:36:00Z' },
  { id: 'tag-038', name: '山歌', color: '#4CAF50', usageCount: 4, createdAt: '2023-07-01T00:37:00Z' },
  { id: 'tag-039', name: '小调', color: '#8BC34A', usageCount: 3, createdAt: '2023-07-01T00:38:00Z' },
  { id: 'tag-040', name: '劳动号子', color: '#CDDC39', usageCount: 2, createdAt: '2023-07-01T00:39:00Z' },
  { id: 'tag-041', name: '情歌', color: '#E91E63', usageCount: 4, createdAt: '2023-07-01T00:40:00Z' },
  { id: 'tag-042', name: '童谣', color: '#00BCD4', usageCount: 3, createdAt: '2023-07-01T00:41:00Z' },
  { id: 'tag-043', name: '农谚', color: '#FF5722', usageCount: 4, createdAt: '2023-07-01T00:42:00Z' },
  { id: 'tag-044', name: '歇后语', color: '#673AB7', usageCount: 5, createdAt: '2023-07-01T00:43:00Z' },
  { id: 'tag-045', name: '字谜', color: '#009688', usageCount: 3, createdAt: '2023-07-01T00:44:00Z' },
  { id: 'tag-046', name: '物谜', color: '#3F51B5', usageCount: 2, createdAt: '2023-07-01T00:45:00Z' },
  { id: 'tag-047', name: '剪纸', color: '#F44336', usageCount: 3, createdAt: '2023-07-01T00:46:00Z' },
  { id: 'tag-048', name: '刺绣', color: '#E91E63', usageCount: 3, createdAt: '2023-07-01T00:47:00Z' },
  { id: 'tag-049', name: '陶瓷', color: '#795548', usageCount: 4, createdAt: '2023-07-01T00:48:00Z' },
  { id: 'tag-050', name: '木雕', color: '#5D4037', usageCount: 2, createdAt: '2023-07-01T00:49:00Z' },
  { id: 'tag-051', name: '竹编', color: '#33691E', usageCount: 2, createdAt: '2023-07-01T00:50:00Z' },
  { id: 'tag-052', name: '皮影戏', color: '#BF360C', usageCount: 3, createdAt: '2023-07-01T00:51:00Z' },
  { id: 'tag-053', name: '非遗', color: '#FF6F00', usageCount: 8, createdAt: '2023-07-01T00:52:00Z' },
  { id: 'tag-054', name: '传承人', color: '#7B1FA2', usageCount: 6, createdAt: '2023-07-01T00:53:00Z' },
  { id: 'tag-055', name: '口述历史', color: '#00796B', usageCount: 5, createdAt: '2023-07-01T00:54:00Z' },
  { id: 'tag-056', name: '农耕文化', color: '#388E3C', usageCount: 4, createdAt: '2023-07-01T00:55:00Z' },
  { id: 'tag-057', name: '渔猎文化', color: '#0288D1', usageCount: 3, createdAt: '2023-07-01T00:56:00Z' },
  { id: 'tag-058', name: '游牧文化', color: '#F57C00', usageCount: 2, createdAt: '2023-07-01T00:57:00Z' },
  { id: 'tag-059', name: '方言', color: '#512DA8', usageCount: 7, createdAt: '2023-07-01T00:58:00Z' },
  { id: 'tag-060', name: '粤语', color: '#C2185B', usageCount: 4, createdAt: '2023-07-01T00:59:00Z' },
  { id: 'tag-061', name: '闽南语', color: '#D32F2F', usageCount: 3, createdAt: '2023-07-01T01:00:00Z' },
  { id: 'tag-062', name: '四川话', color: '#F9A825', usageCount: 4, createdAt: '2023-07-01T01:01:00Z' },
  { id: 'tag-063', name: '山东话', color: '#303F9F', usageCount: 3, createdAt: '2023-07-01T01:02:00Z' },
  { id: 'tag-064', name: '陕西话', color: '#00796B', usageCount: 3, createdAt: '2023-07-01T01:03:00Z' },
  { id: 'tag-065', name: '湖南话', color: '#8BC34A', usageCount: 3, createdAt: '2023-07-01T01:04:00Z' },
  { id: 'tag-066', name: '湖北话', color: '#FFB300', usageCount: 2, createdAt: '2023-07-01T01:05:00Z' },
  { id: 'tag-067', name: '江浙话', color: '#7E57C2', usageCount: 3, createdAt: '2023-07-01T01:06:00Z' },
  { id: 'tag-068', name: '客家话', color: '#AB47BC', usageCount: 2, createdAt: '2023-07-01T01:07:00Z' },
  { id: 'tag-069', name: '茶文化', color: '#795548', usageCount: 4, createdAt: '2023-07-01T01:08:00Z' },
  { id: 'tag-070', name: '酒文化', color: '#8D6E63', usageCount: 3, createdAt: '2023-07-01T01:09:00Z' },
  { id: 'tag-071', name: '饮食文化', color: '#A1887F', usageCount: 5, createdAt: '2023-07-01T01:10:00Z' },
  { id: 'tag-072', name: '建筑文化', color: '#90A4AE', usageCount: 3, createdAt: '2023-07-01T01:11:00Z' },
  { id: 'tag-073', name: '四合院', color: '#FF7043', usageCount: 2, createdAt: '2023-07-01T01:12:00Z' },
  { id: 'tag-074', name: '窑洞', color: '#8D6E63', usageCount: 2, createdAt: '2023-07-01T01:13:00Z' },
  { id: 'tag-075', name: '吊脚楼', color: '#66BB6A', usageCount: 2, createdAt: '2023-07-01T01:14:00Z' },
  { id: 'tag-076', name: '蒙古族', color: '#42A5F5', usageCount: 2, createdAt: '2023-07-01T01:15:00Z' },
  { id: 'tag-077', name: '藏族', color: '#FFCA28', usageCount: 2, createdAt: '2023-07-01T01:16:00Z' },
  { id: 'tag-078', name: '维吾尔族', color: '#EF5350', usageCount: 2, createdAt: '2023-07-01T01:17:00Z' },
  { id: 'tag-079', name: '壮族', color: '#AB47BC', usageCount: 2, createdAt: '2023-07-01T01:18:00Z' },
  { id: 'tag-080', name: '苗族', color: '#26A69A', usageCount: 2, createdAt: '2023-07-01T01:19:00Z' },
  { id: 'tag-081', name: '满族', color: '#5C6BC0', usageCount: 2, createdAt: '2023-07-01T01:20:00Z' },
  { id: 'tag-082', name: '回族', color: '#66BB6A', usageCount: 2, createdAt: '2023-07-01T01:21:00Z' },
  { id: 'tag-083', name: '土家族', color: '#FFA726', usageCount: 1, createdAt: '2023-07-01T01:22:00Z' },
  { id: 'tag-084', name: '彝族', color: '#EC407A', usageCount: 1, createdAt: '2023-07-01T01:23:00Z' },
  { id: 'tag-085', name: '畲族', color: '#42A5F5', usageCount: 1, createdAt: '2023-07-01T01:24:00Z' },
];

const provinceIds = provinces.map(p => p.id);
const cityIds: string[] = [];
const districtIds: string[] = [];
provinces.forEach(p => p.cities.forEach(c => {
  cityIds.push(c.id);
  c.districts.forEach(d => districtIds.push(d.id));
}));

const storytellerNames = [
  '陈老根', '王秀兰', '李大山', '张桂花', '刘明德', '赵天福', '孙秀英', '周玉堂',
  '吴金凤', '郑海涛', '冯秀珍', '钱国华', '许文清', '何素梅', '罗志强', '梁红玉',
  '宋文华', '唐玉莲', '韩世昌', '曹德顺', '邓玉芬', '彭海涛', '曾金花', '萧明远',
  '田桂兰', '董建国', '袁秀英', '潘玉堂', '于金凤', '蒋海涛', '蔡秀珍', '魏国华',
  '叶文清', '阎素梅', '余志强'
];

export const storytellers: Storyteller[] = storytellerNames.map((name, index) => {
  const provinceIndex = index % provinces.length;
  const province = provinces[provinceIndex];
  const cityIndex = index % province.cities.length;
  const city = province.cities[cityIndex];
  const districtIndex = index % city.districts.length;
  const district = city.districts[districtIndex];
  const specialtiesPool = ['神话传说', '历史故事', '民间歌谣', '谚语谜语', '鬼怪故事', '手工技艺', '民俗仪式', '地方风物'];
  const gender = index % 3 === 0 ? 'female' : index % 3 === 1 ? 'male' : 'other';
  return {
    id: `st-${String(index + 1).padStart(3, '0')}`,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    gender,
    age: 55 + (index % 30),
    ethnicity: ['汉族', '汉族', '汉族', '蒙古族', '回族', '藏族', '壮族', '苗族'][index % 8],
    provinceId: province.id,
    cityId: city.id,
    districtId: district.id,
    address: `${city.name}${district.name}某某街道${index + 1}号`,
    occupation: ['农民', '退休教师', '民间艺人', '手工艺人', '村干部', '退休工人', '渔民', '牧民'][index % 8],
    education: ['小学', '初中', '高中', '中专', '大专', '本科'][index % 6],
    specialties: [specialtiesPool[index % specialtiesPool.length], specialtiesPool[(index + 3) % specialtiesPool.length]],
    yearsOfExperience: 20 + (index % 40),
    bio: `${name}老人是${city.name}${district.name}著名的民间故事讲述人，从小跟随父辈学习传统故事，已从事民间文学传承${20 + (index % 40)}余年，擅长讲述${specialtiesPool[index % specialtiesPool.length]}和${specialtiesPool[(index + 3) % specialtiesPool.length]}。`,
    contactPhone: `138${String(10000000 + index * 137).slice(0, 8)}`,
    storyCount: 1 + (index % 5),
    isVerified: index < 28,
    createdAt: new Date(2023, 6 + (index % 6), 1 + (index % 28)).toISOString(),
    updatedAt: new Date(2024, (index % 5), 1 + (index % 27)).toISOString(),
  };
});

const storyTitles: Array<{ title: string; subtitle: string; categoryId: string; tagIds: string[]; keywords: string[] }> = [
  { title: '盘古开天辟地', subtitle: '宇宙起源的古老传说', categoryId: 'cat-001', tagIds: ['tag-001'], keywords: ['盘古', '开天', '创世', '混沌'] },
  { title: '女娲炼石补天', subtitle: '人类始祖的伟大功绩', categoryId: 'cat-001', tagIds: ['tag-002'], keywords: ['女娲', '补天', '五彩石', '始祖'] },
  { title: '夸父逐日的故事', subtitle: '追求光明的英雄壮举', categoryId: 'cat-001', tagIds: ['tag-003'], keywords: ['夸父', '追日', '英雄', '执着'] },
  { title: '嫦娥飞向月宫', subtitle: '中秋佳节的美丽传说', categoryId: 'cat-001', tagIds: ['tag-004', 'tag-028'], keywords: ['嫦娥', '月宫', '后羿', '中秋节'] },
  { title: '后羿射九日', subtitle: '拯救苍生的神箭手', categoryId: 'cat-001', tagIds: ['tag-005'], keywords: ['后羿', '射日', '弓箭', '英雄'] },
  { title: '精卫填海不息', subtitle: '永不放弃的小鸟', categoryId: 'cat-001', tagIds: ['tag-006'], keywords: ['精卫', '填海', '炎帝', '执着'] },
  { title: '八仙各显神通', subtitle: '过海赴蟠桃盛会', categoryId: 'cat-001', tagIds: ['tag-007'], keywords: ['八仙', '过海', '吕洞宾', '何仙姑'] },
  { title: '白蛇下凡遇许仙', subtitle: '西湖畔的千年之恋', categoryId: 'cat-001', tagIds: ['tag-008', 'tag-022'], keywords: ['白蛇传', '许仙', '西湖', '雷峰塔'] },
  { title: '梁祝化蝶双飞', subtitle: '千古爱情的绝唱', categoryId: 'cat-001', tagIds: ['tag-009'], keywords: ['梁山伯', '祝英台', '化蝶', '爱情'] },
  { title: '孟姜女哭长城', subtitle: '寻夫哭倒八百里', categoryId: 'cat-001', tagIds: ['tag-010', 'tag-019'], keywords: ['孟姜女', '长城', '范喜良', '秦朝'] },
  { title: '牛郎织女鹊桥会', subtitle: '七夕节的浪漫传说', categoryId: 'cat-001', tagIds: ['tag-011'], keywords: ['牛郎', '织女', '七夕', '银河'] },
  { title: '沉香劈山救母', subtitle: '宝莲灯的神话故事', categoryId: 'cat-001', tagIds: ['tag-001'], keywords: ['沉香', '华山', '宝莲灯', '二郎神'] },
  { title: '孔子周游列国', subtitle: '儒家圣人的传道之旅', categoryId: 'cat-002', tagIds: ['tag-012'], keywords: ['孔子', '论语', '儒家', '教育'] },
  { title: '诸葛亮空城退敌', subtitle: '智斗司马懿的妙计', categoryId: 'cat-002', tagIds: ['tag-013'], keywords: ['诸葛亮', '空城计', '司马懿', '三国'] },
  { title: '岳飞精忠报国', subtitle: '岳母刺字的千古佳话', categoryId: 'cat-002', tagIds: ['tag-014'], keywords: ['岳飞', '精忠报国', '岳母', '抗金'] },
  { title: '关羽过五关斩六将', subtitle: '忠义武圣的传奇', categoryId: 'cat-002', tagIds: ['tag-015'], keywords: ['关羽', '五关', '六将', '忠义'] },
  { title: '李白斗酒诗百篇', subtitle: '诗仙的豪放人生', categoryId: 'cat-002', tagIds: ['tag-016'], keywords: ['李白', '诗仙', '酒', '唐诗'] },
  { title: '杜甫忧国忧民', subtitle: '诗圣的沉郁人生', categoryId: 'cat-002', tagIds: ['tag-017'], keywords: ['杜甫', '诗圣', '安史之乱', '忧国'] },
  { title: '苏东坡赤壁怀古', subtitle: '文豪的豁达人生', categoryId: 'cat-002', tagIds: ['tag-018'], keywords: ['苏轼', '赤壁', '宋词', '黄州'] },
  { title: '长城的修建传说', subtitle: '世界奇迹的诞生', categoryId: 'cat-003', tagIds: ['tag-019'], keywords: ['长城', '秦始皇', '孟姜女', '奇迹'] },
  { title: '黄河源头的故事', subtitle: '母亲河的古老传说', categoryId: 'cat-003', tagIds: ['tag-020'], keywords: ['黄河', '源头', '母亲河', '大禹'] },
  { title: '长江三峡的传说', subtitle: '神女峰下的故事', categoryId: 'cat-003', tagIds: ['tag-021'], keywords: ['长江', '三峡', '神女峰', '巫山'] },
  { title: '西湖明珠从天降', subtitle: '人间天堂的由来', categoryId: 'cat-003', tagIds: ['tag-022'], keywords: ['西湖', '杭州', '明珠', '玉龙'] },
  { title: '泰山封禅的故事', subtitle: '五岳独尊的辉煌', categoryId: 'cat-003', tagIds: ['tag-023'], keywords: ['泰山', '封禅', '五岳', '帝王'] },
  { title: '黄山奇石云海', subtitle: '天下第一奇山', categoryId: 'cat-003', tagIds: ['tag-024'], keywords: ['黄山', '奇石', '云海', '奇松'] },
  { title: '故宫的建造之谜', subtitle: '紫禁城的辉煌历史', categoryId: 'cat-003', tagIds: ['tag-025'], keywords: ['故宫', '紫禁城', '明朝', '建筑'] },
  { title: '景德镇瓷器的传说', subtitle: '千年瓷都的故事', categoryId: 'cat-003', tagIds: ['tag-049', 'tag-053'], keywords: ['景德镇', '瓷器', '瓷都', '青花'] },
  { title: '龙井茶的来历', subtitle: '杭州名茶的故事', categoryId: 'cat-003', tagIds: ['tag-069'], keywords: ['龙井', '茶叶', '杭州', '乾隆'] },
  { title: '过年的由来传说', subtitle: '春节的古老习俗', categoryId: 'cat-004', tagIds: ['tag-026'], keywords: ['春节', '过年', '年兽', '除夕'] },
  { title: '端午节赛龙舟', subtitle: '纪念屈原的传统', categoryId: 'cat-004', tagIds: ['tag-027'], keywords: ['端午节', '屈原', '龙舟', '粽子'] },
  { title: '中秋赏月吃月饼', subtitle: '团圆佳节的习俗', categoryId: 'cat-004', tagIds: ['tag-028', 'tag-004'], keywords: ['中秋节', '月饼', '赏月', '团圆'] },
  { title: '清明扫墓祭祖', subtitle: '慎终追远的传统', categoryId: 'cat-004', tagIds: ['tag-029'], keywords: ['清明节', '扫墓', '祭祖', '寒食'] },
  { title: '九九重阳登高', subtitle: '敬老节的由来', categoryId: 'cat-004', tagIds: ['tag-030'], keywords: ['重阳节', '登高', '敬老', '菊花'] },
  { title: '正月十五闹花灯', subtitle: '元宵节的狂欢', categoryId: 'cat-004', tagIds: ['tag-031'], keywords: ['元宵节', '花灯', '灯谜', '汤圆'] },
  { title: '传统婚礼的习俗', subtitle: '从提亲到拜堂', categoryId: 'cat-004', tagIds: ['tag-032'], keywords: ['婚礼', '嫁娶', '拜堂', '习俗'] },
  { title: '狐仙传说之黄大仙', subtitle: '民间信仰中的灵狐', categoryId: 'cat-005', tagIds: ['tag-034'], keywords: ['狐仙', '黄大仙', '灵异', '信仰'] },
  { title: '聊斋志异之聂小倩', subtitle: '人鬼情未了的故事', categoryId: 'cat-005', tagIds: ['tag-035', 'tag-036'], keywords: ['聂小倩', '宁采臣', '聊斋', '鬼故事'] },
  { title: '山村老宅的夜半哭声', subtitle: '真实的灵异经历', categoryId: 'cat-005', tagIds: ['tag-036', 'tag-037'], keywords: ['老宅', '灵异', '哭声', '山村'] },
  { title: '河边的红衣女子', subtitle: '水鬼的传说', categoryId: 'cat-005', tagIds: ['tag-036'], keywords: ['水鬼', '红衣', '河边', '传说'] },
  { title: '黄鼠狼讨封的故事', subtitle: '民间的五大仙', categoryId: 'cat-005', tagIds: ['tag-034', 'tag-037'], keywords: ['黄鼠狼', '讨封', '五大仙', '民间信仰'] },
  { title: '走夜路遇鬼打墙', subtitle: '无法解释的迷路', categoryId: 'cat-005', tagIds: ['tag-037'], keywords: ['鬼打墙', '夜路', '迷路', '灵异'] },
  { title: '托梦破案的奇事', subtitle: '亡者的冤屈', categoryId: 'cat-005', tagIds: ['tag-036', 'tag-037'], keywords: ['托梦', '破案', '冤屈', '奇事'] },
  { title: '客家山歌对唱', subtitle: '山间传情的歌声', categoryId: 'cat-006', tagIds: ['tag-038', 'tag-068'], keywords: ['客家', '山歌', '对唱', '爱情'] },
  { title: '陕北信天游', subtitle: '黄土高原上的绝唱', categoryId: 'cat-006', tagIds: ['tag-038', 'tag-064'], keywords: ['信天游', '陕北', '黄土高原', '民歌'] },
  { title: '江南小调茉莉花', subtitle: '传唱世界的名曲', categoryId: 'cat-006', tagIds: ['tag-039', 'tag-067'], keywords: ['茉莉花', '江南', '小调', '民歌'] },
  { title: '川江号子震天响', subtitle: '纤夫们的劳动之歌', categoryId: 'cat-006', tagIds: ['tag-040', 'tag-062'], keywords: ['川江号子', '纤夫', '劳动', '长江'] },
  { title: '青海花儿少年', subtitle: '西北高原的情歌', categoryId: 'cat-006', tagIds: ['tag-041', 'tag-077'], keywords: ['花儿', '青海', '情歌', '少年'] },
  { title: '农谚二十四节气', subtitle: '老祖宗的智慧结晶', categoryId: 'cat-007', tagIds: ['tag-043', 'tag-056'], keywords: ['农谚', '二十四节气', '农耕', '智慧'] },
  { title: '经典歇后语大全', subtitle: '幽默与智慧并存', categoryId: 'cat-007', tagIds: ['tag-044'], keywords: ['歇后语', '幽默', '智慧', '语言'] },
  { title: '猜字谜的乐趣', subtitle: '汉字的奇妙游戏', categoryId: 'cat-007', tagIds: ['tag-045'], keywords: ['字谜', '汉字', '游戏', '益智'] },
  { title: '民间物谜精选', subtitle: '生活中的谜语智慧', categoryId: 'cat-007', tagIds: ['tag-046'], keywords: ['物谜', '谜语', '生活', '智慧'] },
  { title: '陕北剪纸大师口述', subtitle: '一把剪刀剪出的艺术', categoryId: 'cat-008', tagIds: ['tag-047', 'tag-053', 'tag-054', 'tag-055'], keywords: ['剪纸', '陕北', '非遗', '传承人'] },
  { title: '苏绣传承人访谈录', subtitle: '针线里的江南韵味', categoryId: 'cat-008', tagIds: ['tag-048', 'tag-053', 'tag-054'], keywords: ['苏绣', '刺绣', '江南', '非遗'] },
  { title: '宜兴紫砂壶制作', subtitle: '陶都工匠的坚守', categoryId: 'cat-008', tagIds: ['tag-049', 'tag-053', 'tag-054'], keywords: ['紫砂壶', '宜兴', '陶瓷', '工匠'] },
  { title: '东阳木雕传承记', subtitle: '千年技艺的薪火相传', categoryId: 'cat-008', tagIds: ['tag-050', 'tag-053', 'tag-054', 'tag-055'], keywords: ['木雕', '东阳', '非遗', '技艺'] },
];

const dialectWordsPool = [
  { word: '俺', pronunciation: 'ǎn', meaning: '我，我们', example: '俺们那旮瘩都是好人', region: '北方方言' },
  { word: '啥', pronunciation: 'shá', meaning: '什么', example: '你说啥？我没听清', region: '北方方言' },
  { word: '咋', pronunciation: 'zǎ', meaning: '怎么', example: '咋回事啊这是？', region: '北方方言' },
  { word: '甭', pronunciation: 'béng', meaning: '不用', example: '甭客气，都是自己人', region: '北方方言' },
  { word: '孬', pronunciation: 'nāo', meaning: '不好，坏', example: '这东西太孬了', region: '河南/山东' },
  { word: '中意', pronunciation: 'zhōng yì', meaning: '喜欢，满意', example: '这件衣服我好中意', region: '粤语/客家话' },
  { word: '靓仔', pronunciation: 'liàng zǎi', meaning: '帅哥，小伙子', example: '靓仔，要点什么？', region: '粤语' },
  { word: '靓女', pronunciation: 'liàng nǚ', meaning: '美女，姑娘', example: '这位靓女真有气质', region: '粤语' },
  { word: '搞掂', pronunciation: 'gǎo diān', meaning: '办妥，解决', example: '放心，已经搞掂了', region: '粤语' },
  { word: '巴适', pronunciation: 'bā shì', meaning: '舒服，好', example: '这火锅吃起太巴适了', region: '四川话' },
  { word: '安逸', pronunciation: 'ān yì', meaning: '舒服，满意', example: '这个日子过得安逸', region: '四川话' },
  { word: '雄起', pronunciation: 'xióng qǐ', meaning: '加油，振作', example: '四川雄起！', region: '四川话' },
  { word: '晓得', pronunciation: 'xiǎo dé', meaning: '知道', example: '晓得晓得，你别说了', region: '西南官话' },
  { word: '莫', pronunciation: 'mò', meaning: '不要', example: '莫要着急，慢慢来', region: '四川/湖南' },
  { word: '堂客', pronunciation: 'táng kè', meaning: '妻子，老婆', example: '我堂客今天回娘家了', region: '湖南话' },
  { word: '伢子', pronunciation: 'yá zǐ', meaning: '男孩子', example: '这个伢子真懂事', region: '湖南话' },
  { word: '妹子', pronunciation: 'mèi zǐ', meaning: '女孩子', example: '那妹子长得真俊', region: '湖南/四川' },
  { word: '老表', pronunciation: 'lǎo biǎo', meaning: '表亲，老乡', example: '老表，来抽根烟', region: '江西/湖南' },
  { word: '介个', pronunciation: 'jiè gè', meaning: '这个', example: '介个东西怎么卖？', region: '天津话' },
  { word: '倍儿', pronunciation: 'bèir', meaning: '特别，非常', example: '这道菜倍儿好吃', region: '北京话' },
  { word: '您呐', pronunciation: 'nín na', meaning: '您（尊称）', example: '您呐慢走啊', region: '北京话' },
  { word: '阿拉', pronunciation: 'ā lā', meaning: '我，我们', example: '阿拉上海人', region: '上海话' },
  { word: '侬', pronunciation: 'nóng', meaning: '你', example: '侬好啊', region: '上海话/吴语' },
  { word: '囡囡', pronunciation: 'nān nān', meaning: '宝贝，女儿', example: '囡囡乖，不哭', region: '吴语区' },
  { word: '晓得嘞', pronunciation: 'xiǎo dé lēi', meaning: '知道了', example: '晓得嘞，马上就去', region: '江浙话' },
  { word: '做啥', pronunciation: 'zù sā', meaning: '做什么', example: '侬做啥啦？', region: '上海话' },
  { word: '尴尬', pronunciation: 'gān gà', meaning: '难为情，不自然', example: '当时场面老尴尬了', region: '吴语起源' },
  { word: '蹩脚', pronunciation: 'bié jiǎo', meaning: '差劲，不好', example: '这东西太蹩脚了', region: '上海话' },
  { word: '扎西德勒', pronunciation: 'zhā xī dé lè', meaning: '吉祥如意', example: '扎西德勒！', region: '藏语' },
  { word: '呼麦', pronunciation: 'hū mài', meaning: '蒙古族喉音唱法', example: '他的呼麦唱得真好', region: '蒙古族' },
];

function generateParagraphs(storyTitle: string, storyIndex: number) {
  const paragraphs = [];
  const paragraphCount = 4 + (storyIndex % 5);
  const intro = [
    `话说在很久很久以前，有一个关于${storyTitle}的故事，在民间代代相传。`,
    `提起${storyTitle}，那可是家喻户晓、妇孺皆知的传奇故事。`,
    `相传，${storyTitle}的故事发生在遥远的古代，那时候天地初开，民风淳朴。`,
    `老辈人常说，${storyTitle}的故事是从祖辈那里传下来的，已经不知道传了多少代。`,
  ];
  const developments = [
    '那时候，有一位善良勇敢的主人公，他/她生来就与众不同。',
    '某天，一件奇怪的事情发生了，彻底改变了主人公的命运。',
    '村里的人们都在议论纷纷，说这是百年不遇的奇事。',
    '主人公决定踏上旅程，去寻找事情的真相。',
    '一路上，主人公遇到了许多艰难险阻，但他/她从未放弃。',
    '好心人纷纷伸出援手，给主人公指明了方向。',
    '经过重重考验，主人公终于明白了其中的道理。',
    '关键时刻，主人公展现出了非凡的勇气和智慧。',
  ];
  const climaxes = [
    '就在千钧一发之际，奇迹发生了！',
    '主人公用自己的行动，证明了真善美的力量。',
    '所有的谜题终于揭开，真相大白于天下。',
    '邪恶终究被正义战胜，光明重新回到了人间。',
  ];
  const endings = [
    '从此以后，人们过上了幸福安康的生活。',
    '这个故事就这样流传了下来，教育着一代又一代人。',
    '直到今天，人们还在传颂着这个动人的传说。',
    '每年到了这个时候，人们都会用各种方式纪念这个故事。',
  ];
  for (let i = 0; i < paragraphCount; i++) {
    let content = '';
    if (i === 0) {
      content = intro[storyIndex % intro.length];
    } else if (i === paragraphCount - 1) {
      content = endings[storyIndex % endings.length];
    } else if (i === paragraphCount - 2) {
      content = climaxes[(storyIndex + i) % climaxes.length];
    } else {
      content = developments[(storyIndex + i) % developments.length];
    }
    const extraSentences = [
      '村里的老人说起这件事来，总是滔滔不绝，眼睛里闪着光。',
      '据说，当时还有人亲眼见证了这一切，后来活到了九十九岁。',
      '这个道理，直到今天依然适用，值得我们每个人深思。',
      '那时候的人们，虽然生活艰苦，但心地善良，互帮互助。',
      '主人公的事迹，感动了无数人，也激励了无数人。',
      '乡亲们都说，这是老天爷有眼，好人自有好报。',
    ];
    if (i % 2 === 1) {
      content += extraSentences[(storyIndex + i) % extraSentences.length];
    }
    paragraphs.push({
      id: `p-${storyIndex + 1}-${i + 1}`,
      order: i + 1,
      content,
    });
  }
  return paragraphs;
}

function generateDialectNotes(paragraphs: Array<{ id: string }>, storyIndex: number) {
  const notes = [];
  const noteCount = 2 + (storyIndex % 4);
  for (let i = 0; i < noteCount; i++) {
    const wordIndex = (storyIndex * 3 + i * 7) % dialectWordsPool.length;
    const word = dialectWordsPool[wordIndex];
    const paragraphIndex = i % paragraphs.length;
    notes.push({
      id: `dn-${storyIndex + 1}-${i + 1}`,
      word: word.word,
      pronunciation: word.pronunciation,
      meaning: word.meaning,
      example: word.example,
      region: word.region,
      paragraphId: paragraphs[paragraphIndex].id,
    });
  }
  return notes;
}

export const stories: Story[] = [];
storyTitles.forEach((item, index) => {
  const paragraphs = generateParagraphs(item.title, index);
  const dialectNotes = generateDialectNotes(paragraphs, index);
  const stIndex = index % storytellers.length;
  const storyteller = storytellers[stIndex];
  const status: 'approved' | 'pending' = index < 50 ? 'approved' : 'pending';
  const submittedAt = new Date(2023, 8 + (index % 8), 1 + (index % 27)).toISOString();
  stories.push({
    id: `story-${String(index + 1).padStart(3, '0')}`,
    title: item.title,
    subtitle: item.subtitle,
    categoryId: item.categoryId,
    storytellerId: storyteller.id,
    collectorId: users[index % 3].id,
    provinceId: storyteller.provinceId,
    cityId: storyteller.cityId,
    districtId: storyteller.districtId,
    coverImage: `https://picsum.photos/seed/story${index + 1}/800/450`,
    summary: `${item.subtitle}。${item.title}的故事流传久远，蕴含着丰富的民间智慧和文化内涵，是中华优秀传统文化的重要组成部分。`,
    paragraphs,
    dialectNotes,
    tagIds: item.tagIds.length >= 3 ? item.tagIds : [...item.tagIds, `tag-${String(55 + (index % 10)).padStart(3, '0')}`, `tag-${String(59 + (index % 15)).padStart(3, '0')}`],
    keywords: item.keywords,
    sourceType: (['interview', 'document', 'inheritance', 'other'] as const)[index % 4],
    oralYear: `${1950 + (index % 50)}年代`,
    recordingDate: new Date(2023, (index % 12), 1 + (index % 27)).toISOString().split('T')[0],
    recordingLocation: `${storyteller.cityId ? (provinces.find(p => p.id === storyteller.provinceId)?.name || '') + (provinces.find(p => p.id === storyteller.provinceId)?.cities.find(c => c.id === storyteller.cityId)?.name || '') : ''}`,
    status,
    viewCount: 100 + Math.floor(index * 137) % 9900,
    likeCount: 10 + Math.floor(index * 53) % 990,
    shareCount: Math.floor(index * 17) % 200,
    collectCount: 5 + Math.floor(index * 31) % 500,
    commentCount: Math.floor(index * 13) % 150,
    submittedAt,
    reviewedAt: status === 'approved' ? new Date(new Date(submittedAt).getTime() + 86400000 * (1 + (index % 7))).toISOString() : undefined,
    reviewerId: status === 'approved' ? users[2].id : undefined,
    reviewComment: status === 'approved' ? '内容详实，文化价值高，审核通过。' : undefined,
    createdAt: submittedAt,
    updatedAt: status === 'approved' ? new Date(new Date(submittedAt).getTime() + 86400000 * (2 + (index % 7))).toISOString() : submittedAt,
  });
});

export const reviewRecords: ReviewRecord[] = stories
  .filter(s => s.status === 'approved' && s.reviewedAt)
  .map((s, index) => ({
    id: `review-${String(index + 1).padStart(3, '0')}`,
    storyId: s.id,
    reviewerId: s.reviewerId!,
    previousStatus: 'pending' as const,
    newStatus: 'approved' as const,
    comment: index % 5 === 0
      ? '故事内容丰富，讲述生动，方言注释准确，具有很高的文化保存价值，同意发布。'
      : index % 5 === 1
      ? '内容真实可信，采访记录完整，分类正确，通过审核。'
      : index % 5 === 2
      ? '非遗传承人口述记录，史料价值极高，审核通过。'
      : index % 5 === 3
      ? '格式规范，标签准确，推荐至首页展示。'
      : '资料详实，来源可靠，准予发布。',
    reviewedAt: s.reviewedAt!,
  }));

export const locationData: Province[] = provinces;
