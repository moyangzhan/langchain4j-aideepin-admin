import { Random } from 'mockjs';
import { resultSuccess, doCustomTimes } from '../_util';

const tableList = (pageSize) => {
  const result: any[] = [];
  doCustomTimes(pageSize, () => {
    result.push({
      uuid: '@uuid()',
      id: '@integer(10,999999)',
      createTime: '@datetime',
      activeTime: '@datetime',
      email: '@email()',
      name: '@cname()',
      avatar: Random.image('400x400', Random.color(), Random.color(), Random.first()),
      updateTime: '@datetime',
      'no|100000-10000000': 100000,
      'status|1': [true, false],
    });
  })
  return result;
}

export default [
  //表格数据列表
  {
    url: '/api/admin/table/list',
    timeout: 1000,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10, name } = query;
      const list = tableList(Number(pageSize));
      //并非真实，只是为了模拟搜索结果
      const count = name ? 30 : 60;
      return resultSuccess({
        page: Number(page),
        pageSize: Number(pageSize),
        pageCount: count,
        itemCount: count * Number(pageSize),
        list,
      });
    },
  },
  {
    url: '/api/admin/user/list',
    timeout: 1000,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10, name } = query;
      const list = tableList(Number(pageSize));
      //并非真实，只是为了模拟搜索结果
      const count = name ? 30 : 60;
      return resultSuccess({
        page: Number(page),
        pageSize: Number(pageSize),
        pageCount: count,
        itemCount: count * Number(pageSize),
        list,
      });
    },
  },
];
