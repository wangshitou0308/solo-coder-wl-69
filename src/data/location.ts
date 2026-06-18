export interface District {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  districts: District[];
}

export interface Province {
  id: string;
  name: string;
  cities: City[];
}

export const provinces: Province[] = [
  {
    id: '110000',
    name: '北京市',
    cities: [
      {
        id: '110100',
        name: '北京市',
        districts: [
          { id: '110101', name: '东城区' },
          { id: '110102', name: '西城区' },
          { id: '110105', name: '朝阳区' },
          { id: '110106', name: '丰台区' },
          { id: '110108', name: '海淀区' },
        ],
      },
    ],
  },
  {
    id: '310000',
    name: '上海市',
    cities: [
      {
        id: '310100',
        name: '上海市',
        districts: [
          { id: '310101', name: '黄浦区' },
          { id: '310104', name: '徐汇区' },
          { id: '310105', name: '长宁区' },
          { id: '310106', name: '静安区' },
          { id: '310110', name: '杨浦区' },
        ],
      },
    ],
  },
  {
    id: '440000',
    name: '广东省',
    cities: [
      {
        id: '440100',
        name: '广州市',
        districts: [
          { id: '440103', name: '荔湾区' },
          { id: '440104', name: '越秀区' },
          { id: '440105', name: '海珠区' },
          { id: '440106', name: '天河区' },
        ],
      },
      {
        id: '440300',
        name: '深圳市',
        districts: [
          { id: '440303', name: '罗湖区' },
          { id: '440304', name: '福田区' },
          { id: '440305', name: '南山区' },
          { id: '440306', name: '宝安区' },
        ],
      },
      {
        id: '440600',
        name: '佛山市',
        districts: [
          { id: '440604', name: '禅城区' },
          { id: '440605', name: '南海区' },
          { id: '440606', name: '顺德区' },
        ],
      },
      {
        id: '441900',
        name: '东莞市',
        districts: [
          { id: '441900', name: '东莞市辖区' },
        ],
      },
    ],
  },
  {
    id: '330000',
    name: '浙江省',
    cities: [
      {
        id: '330100',
        name: '杭州市',
        districts: [
          { id: '330102', name: '上城区' },
          { id: '330105', name: '拱墅区' },
          { id: '330106', name: '西湖区' },
          { id: '330108', name: '滨江区' },
        ],
      },
      {
        id: '330200',
        name: '宁波市',
        districts: [
          { id: '330203', name: '海曙区' },
          { id: '330205', name: '江北区' },
          { id: '330206', name: '北仑区' },
        ],
      },
      {
        id: '330300',
        name: '温州市',
        districts: [
          { id: '330302', name: '鹿城区' },
          { id: '330303', name: '龙湾区' },
          { id: '330304', name: '瓯海区' },
        ],
      },
    ],
  },
  {
    id: '320000',
    name: '江苏省',
    cities: [
      {
        id: '320100',
        name: '南京市',
        districts: [
          { id: '320102', name: '玄武区' },
          { id: '320104', name: '秦淮区' },
          { id: '320105', name: '建邺区' },
          { id: '320106', name: '鼓楼区' },
        ],
      },
      {
        id: '320200',
        name: '无锡市',
        districts: [
          { id: '320205', name: '锡山区' },
          { id: '320206', name: '惠山区' },
          { id: '320211', name: '滨湖区' },
        ],
      },
      {
        id: '320500',
        name: '苏州市',
        districts: [
          { id: '320505', name: '虎丘区' },
          { id: '320506', name: '吴中区' },
          { id: '320507', name: '相城区' },
          { id: '320508', name: '姑苏区' },
        ],
      },
      {
        id: '320600',
        name: '南通市',
        districts: [
          { id: '320602', name: '崇川区' },
          { id: '320611', name: '港闸区' },
          { id: '320612', name: '通州区' },
        ],
      },
    ],
  },
  {
    id: '510000',
    name: '四川省',
    cities: [
      {
        id: '510100',
        name: '成都市',
        districts: [
          { id: '510104', name: '锦江区' },
          { id: '510105', name: '青羊区' },
          { id: '510106', name: '金牛区' },
          { id: '510107', name: '武侯区' },
        ],
      },
      {
        id: '510300',
        name: '自贡市',
        districts: [
          { id: '510302', name: '自流井区' },
          { id: '510303', name: '贡井区' },
          { id: '510304', name: '大安区' },
        ],
      },
      {
        id: '510400',
        name: '攀枝花市',
        districts: [
          { id: '510402', name: '东区' },
          { id: '510403', name: '西区' },
          { id: '510411', name: '仁和区' },
        ],
      },
    ],
  },
  {
    id: '610000',
    name: '陕西省',
    cities: [
      {
        id: '610100',
        name: '西安市',
        districts: [
          { id: '610102', name: '新城区' },
          { id: '610103', name: '碑林区' },
          { id: '610104', name: '莲湖区' },
          { id: '610113', name: '雁塔区' },
        ],
      },
      {
        id: '610200',
        name: '铜川市',
        districts: [
          { id: '610202', name: '王益区' },
          { id: '610203', name: '印台区' },
          { id: '610204', name: '耀州区' },
        ],
      },
      {
        id: '610300',
        name: '宝鸡市',
        districts: [
          { id: '610302', name: '渭滨区' },
          { id: '610303', name: '金台区' },
          { id: '610304', name: '陈仓区' },
        ],
      },
    ],
  },
  {
    id: '370000',
    name: '山东省',
    cities: [
      {
        id: '370100',
        name: '济南市',
        districts: [
          { id: '370102', name: '历下区' },
          { id: '370103', name: '市中区' },
          { id: '370104', name: '槐荫区' },
          { id: '370105', name: '天桥区' },
        ],
      },
      {
        id: '370200',
        name: '青岛市',
        districts: [
          { id: '370202', name: '市南区' },
          { id: '370203', name: '市北区' },
          { id: '370211', name: '黄岛区' },
          { id: '370212', name: '崂山区' },
        ],
      },
      {
        id: '370300',
        name: '淄博市',
        districts: [
          { id: '370302', name: '淄川区' },
          { id: '370303', name: '张店区' },
          { id: '370304', name: '博山区' },
        ],
      },
      {
        id: '370600',
        name: '烟台市',
        districts: [
          { id: '370602', name: '芝罘区' },
          { id: '370611', name: '福山区' },
          { id: '370612', name: '牟平区' },
        ],
      },
      {
        id: '370700',
        name: '潍坊市',
        districts: [
          { id: '370702', name: '潍城区' },
          { id: '370703', name: '寒亭区' },
          { id: '370704', name: '坊子区' },
        ],
      },
    ],
  },
  {
    id: '420000',
    name: '湖北省',
    cities: [
      {
        id: '420100',
        name: '武汉市',
        districts: [
          { id: '420102', name: '江岸区' },
          { id: '420103', name: '江汉区' },
          { id: '420104', name: '硚口区' },
          { id: '420105', name: '汉阳区' },
        ],
      },
      {
        id: '420200',
        name: '黄石市',
        districts: [
          { id: '420202', name: '黄石港区' },
          { id: '420203', name: '西塞山区' },
          { id: '420204', name: '下陆区' },
        ],
      },
      {
        id: '420500',
        name: '宜昌市',
        districts: [
          { id: '420502', name: '西陵区' },
          { id: '420503', name: '伍家岗区' },
          { id: '420504', name: '点军区' },
        ],
      },
    ],
  },
  {
    id: '430000',
    name: '湖南省',
    cities: [
      {
        id: '430100',
        name: '长沙市',
        districts: [
          { id: '430102', name: '芙蓉区' },
          { id: '430103', name: '天心区' },
          { id: '430104', name: '岳麓区' },
          { id: '430105', name: '开福区' },
        ],
      },
      {
        id: '430200',
        name: '株洲市',
        districts: [
          { id: '430202', name: '荷塘区' },
          { id: '430203', name: '芦淞区' },
          { id: '430204', name: '石峰区' },
        ],
      },
      {
        id: '430300',
        name: '湘潭市',
        districts: [
          { id: '430302', name: '雨湖区' },
          { id: '430304', name: '岳塘区' },
          { id: '430321', name: '湘潭县' },
        ],
      },
      {
        id: '430400',
        name: '衡阳市',
        districts: [
          { id: '430405', name: '珠晖区' },
          { id: '430406', name: '雁峰区' },
          { id: '430407', name: '石鼓区' },
        ],
      },
    ],
  },
  {
    id: '350000',
    name: '福建省',
    cities: [
      {
        id: '350100',
        name: '福州市',
        districts: [
          { id: '350102', name: '鼓楼区' },
          { id: '350103', name: '台江区' },
          { id: '350104', name: '仓山区' },
          { id: '350105', name: '马尾区' },
        ],
      },
      {
        id: '350200',
        name: '厦门市',
        districts: [
          { id: '350203', name: '思明区' },
          { id: '350205', name: '海沧区' },
          { id: '350206', name: '湖里区' },
          { id: '350211', name: '集美区' },
        ],
      },
      {
        id: '350300',
        name: '莆田市',
        districts: [
          { id: '350302', name: '城厢区' },
          { id: '350303', name: '涵江区' },
          { id: '350304', name: '荔城区' },
        ],
      },
    ],
  },
];

export default provinces;
