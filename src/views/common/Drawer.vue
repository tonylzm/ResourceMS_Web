<template>
  <a-drawer width="640" placement="right" :closable="false" :visible="visible" @close="onClose">
    <div><h2>{{ title }}</h2></div>
    <div>
      <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="pagination"
      >
      </a-table>
    </div>
  </a-drawer>
</template>

<script>
const columns = [
  {
    title: '预约用户',
    dataIndex: 'loginName',
    width: '20%',
    scopedSlots: {customRender: 'loginName'},
  },
  {
    title: '预约时间',
    dataIndex: 'startTime',
    width: '200',
  },
  {
    title: '截止时间',
    dataIndex: 'endTime',
  },
];
export default {
  name: "Drawer",
  props: {
    title: String,
    resource: String,
    resourceId: Number,
    pagination: {
      curren: 1,
      pageSize: 5,
      total: 1,
    }
  },
  data() {
    return {
      columns,
      visible: false,
      dataList: [],
    }
  },
  methods: {
    async showDrawer() {
      console.log(this.resourceId);
      try {
        const {data: res} = await this.$http.get(`/reserve/${this.resource}/${this.resourceId}`);
        if (res.status !== 200) throw Error
        this.dataList = res.data;
        this.visible = true;
      } catch (e) {
        console.log(e)
      }


    },
    onClose() {
      this.dataList = [];
      this.visible = false;
      this.carId = 0;
    },
  },
}
</script>

<style scoped>

</style>
