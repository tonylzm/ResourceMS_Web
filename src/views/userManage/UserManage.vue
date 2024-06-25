<template>
  <div>
    <a-button class="editable-add-btn" @click="handleAdd" style="margin-bottom: 10px">
      添加用户
    </a-button>


    <a-table :columns="columns" :data-source="data" :pagination="false">
      <template
          v-for="col in ['loginName','password', 'age', 'sex','mobile','email']"
          :slot="col"
          slot-scope="text, record"
      >
        <div :key="col">
          <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, record.key, col)"
          />
          <template v-else>
            {{ text }}
          </template>
        </div>
      </template>

      <template slot="operation" slot-scope="text, record">
        <div class="editable-row-operations">
        <span v-if="record.editable">
          <a @click="() => save(record.key)">Save</a>
          <a-popconfirm title="取消不会保存任何数据?" @confirm="() => cancel(record.key)">
            <a>Cancel</a>
          </a-popconfirm>
        </span>
          <span v-else>
          <a :disabled="editingKey !== ''" @click="() => edit(record.key)">Edit</a>
        </span>

          <a-divider type="vertical"/>

          <a-popconfirm
              v-if="data.length"
              title="是否永久删除用户?"
              @confirm="() => onDelete(record.key)"
          >
            <a href="javascript:;">Delete</a>
          </a-popconfirm>
        </div>
      </template>
    </a-table>

    <!--分页器-->
    <div>
      <a-pagination v-model="pagination.current"
                    :show-total="total => `总数 ${pagination.total} 条`"
                    :total="pagination.total"
                    :page-size="pagination.pageSize"
                    @change="pageNumChange"
                    show-less-items
                    style="margin-top: 15px;text-align: right"/>
    </div>
  </div>

</template>
<script>
const columns = [
  {
    title: '用户登录名',
    dataIndex: 'loginName',
    width: '20%',
    scopedSlots: {customRender: 'loginName'},
  },
  {
    title: '登录密码',
    dataIndex: 'password',

    scopedSlots: {customRender: 'password'},
  },
  {
    title: '邮箱',
    dataIndex: 'email',

    scopedSlots: {customRender: 'email'},
  },
  {
    title: '手机号',
    dataIndex: 'mobile',

    scopedSlots: {customRender: 'mobile'},
  },
  {
    title: '年龄',
    dataIndex: 'age',

    scopedSlots: {customRender: 'age'},
  },
  {
    title: '性别',
    dataIndex: 'sex',

    scopedSlots: {customRender: 'sex'},
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: {customRender: 'operation'},
  },
];

const data = [];
export default {
  name: 'UserManage',
  data() {
    this.cacheData = data.map(item => ({...item}))
    return {
      pagination: {
        pageSize: 7,
        current: 1,
        total: 0,
      },
      data,
      columns,
      editingKey: '',

    };
  },
  methods: {


    async handleAdd() {
      this.$message.success("添加用户成功,请修改用户信息");
      const newData = {
        loginName: `请修改登录名 `,
        password: '请输入登录密码',
      };
      try {
        const {data: res} = await this.$http.post('/regist', newData);
        if (res.status!==200) throw  Error;
        await this.getUserList();
      } catch (e) {
        console.log(e)
      }
    },

    async onDelete(key) {
      const data = [...this.data];
      const user = data.filter(item => item.key === key);
      try {
        const {data: res} = await this.$http.delete(`/user/${user[0].userId}`);
        if (res.status !== 200) throw Error
        this.$message.success("操作成功");
        await this.getUserList();
      } catch (e) {
        console.log(e)
      }
    },

    //分页数据改变
    pageNumChange(page, pageSize) {
      console.log(page);
      this.pagination.current = page;
      this.pagination.pageSize = pageSize;
      this.getUserList();
    },

    async getUserList() {
      try {
        const {data: res} = await this.$http.get(`/UserList?pageNum=${this.pagination.current}&pageSize=${this.pagination.pageSize}`);
        if (res.status !== 200) throw Error
        const userList = res.data;
        for (let i = 0; i < userList.length; i++) {
          userList[i].key = i + 1;
        }
        this.data = userList;
        this.pagination.total = res.total;
      } catch (e) {
        console.log(e)
      }
    },


    handleChange(value, key, column) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      if (target) {
        target[column] = value;
        this.data = newData;
      }
    },
    edit(key) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      this.editingKey = key;
      if (target) {
        target.editable = true;
        this.data = newData;
      }
    },
    async save(key) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      console.log(target);
      if (target) {
        delete target.editable;
        try {
          const {data: res} = await this.$http.put(`/user/${target.userId}`, target);
          if (res.status !== 200) throw Error
          await this.getUserList();
        } catch (e) {
          console.log(e)
        }
        this.editingKey = '';
      }
    },
    cancel(key) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      this.editingKey = '';
      if (target) {
        Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
        delete target.editable;
        this.data = newData;
      }
    },
  },
  created() {
    this.getUserList();
  }
};
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>


<!--
<template>
  <div>
    <a-table :columns="columns" :data-source="userList"  :pagination="false">
      <template
          v-for="col in ['loginName', 'age', 'sex','mobile','email']"
          :slot="col"
          slot-scope="text, record"
      >
        <div :key="col">
          <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, record.key, col)"
          />
          <template v-else>
            {{ text }}
          </template>
        </div>
      </template>
      <template slot="operation" slot-scope="text, record">
        <div class="editable-row-operations">
        <span v-if="record.editable">
          <a @click="() => save(record.key)">Save</a>
          <a-popconfirm title="Sure to cancel?" @confirm="() => cancel(record.key)">
            <a>Cancel</a>
          </a-popconfirm>
        </span>
          <span v-else>
          <a :disabled="editingKey !== ''" @click="() => edit(record.key)">Edit</a>
        </span>
        </div>
      </template>
    </a-table>

    &lt;!&ndash;分页器&ndash;&gt;
    <div>
      <a-pagination v-model="pagination.current"
                    :show-total="total => `总数 ${pagination.total} 条`"
                    :total="pagination.total"
                    :page-size="pagination.pageSize"
                    @change="pageNumChange"
                    show-less-items
                    style="margin-top: 15px;text-align: right"/>
    </div>
  </div>
</template>

<script>
const columns = [
  {
    title: '用户名',
    dataIndex: 'loginName',
    width: '20%',
    scopedSlots: { customRender: 'loginName' },
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: '20%',
    scopedSlots: { customRender: 'email' },
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    width: '20%',
    scopedSlots: { customRender: 'mobile' },
  },
  {
    title: '年龄',
    dataIndex: 'age',
    width: '20%',
    scopedSlots: { customRender: 'age' },
  },
  {
    title: '性别',
    dataIndex: 'sex',
    width: '20%',
    scopedSlots: { customRender: 'sex' },
  },
  {
    title: 'operation',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
];

const userList = [];
export default {
  name: "UserManage",
  data() {
    this.cacheData = userList.map(item => ({ ...item }));
    return{
      editingKey: '',
      pagination: {
        pageSize: 7,
        current: 1,
        total: 0,
      },
      userList,
      columns,
    }
  },
  methods:{

    //分页数据改变
    pageNumChange(page, pageSize) {
      this.pagination.current = page;
      this.pagination.pageSize = pageSize;
      this.getCarList();
    },

    handleChange(value, key, column) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      if (target) {
        target[column] = value;
        this.data = newData;
      }
    },
    edit(key) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      this.editingKey = key;
      if (target) {
        target.editable = true;
        this.data = newData;
      }
    },
    save(key) {
      const newData = [...this.data];
      const newCacheData = [...this.cacheData];
      const target = newData.filter(item => key === item.key)[0];
      const targetCache = newCacheData.filter(item => key === item.key)[0];
      if (target && targetCache) {
        delete target.editable;
        this.data = newData;
        Object.assign(targetCache, target);
        this.cacheData = newCacheData;
      }
      this.editingKey = '';
    },
    cancel(key) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.key)[0];
      this.editingKey = '';
      if (target) {
        Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
        delete target.editable;
        this.data = newData;
      }
    },
    async getUserList() {
      try {
        const {data: res} = await this.$http.get(`/userList?pageNum=${this.pagination.current}&pageSize=${this.pagination.pageSize}`);
        if (res.status!==200) throw Error
        this.userList = res.data;
        this.pagination.total = res.total
      } catch (e) {
        console.log(e)
      }
    }
  },
  created() {
    this.getUserList();
  }
}
</script>

<style scoped>

</style>
-->
