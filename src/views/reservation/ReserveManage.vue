<template>
  <div>

    <a-tabs @change="handleChange">
      <a-tab-pane key="申请中" tab="申请中">
        <div>
          <a-table :columns="columns" :data-source="reserveList" :pagination="false">

            <a slot="loginName" slot-scope="loginName">{{ loginName }}</a>

            <a slot="resourceName" slot-scope="resourceName" v-if="resourceName.carName">{{ resourceName.carName }}</a>
            <a slot="resourceName" slot-scope="resourceName" v-else>{{ resourceName.roomName }}</a>


            <span slot="resourcePic" slot-scope="resourcePic">
              <img v-if="resourcePic.carPic" :src="resourcePic.carPic" height="100px">
              <img v-else :src="resourcePic.roomPic" height="100px">
            </span>

            <span slot="reason" slot-scope="scope" v-if="scope.applyReason">{{ scope.applyReason }}</span>

            <span slot="reason" v-else>未填写</span>
            <!--操作列-->
            <span slot-scope="scope" slot="operation">
          <a @click="handlePass(scope)">通过</a>
          <a-divider type="vertical"/>
          <a @click="handleReject(scope)">驳回</a>
      </span>
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
      </a-tab-pane>
      <a-tab-pane key="已通过" tab="已通过">
        <div>
          <a-table :columns="columns" :data-source="reserveList" :pagination="false">

            <a slot="loginName" slot-scope="loginName">{{ loginName }}</a>

            <a slot="resourceName" slot-scope="resourceName" v-if="resourceName.carName">{{ resourceName.carName }}</a>
            <a slot="resourceName" slot-scope="resourceName" v-else>{{ resourceName.roomName }}</a>


            <span slot="resourcePic" slot-scope="resourcePic">
              <img v-if="resourcePic.carPic" :src="resourcePic.carPic" height="100px">
              <img v-else :src="resourcePic.roomPic" height="100px">
            </span>

            <span slot="reason" slot-scope="scope" v-if="scope.applyReason">{{ scope.applyReason }}</span>

            <span slot="reason" v-else>未填写</span>


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

      </a-tab-pane>
      <a-tab-pane key="已驳回" tab="已驳回">
        <div>
          <a-table :columns="columns" :data-source="reserveList" :pagination="false">

            <a slot="loginName" slot-scope="loginName">{{ loginName }}</a>

            <a slot="resourceName" slot-scope="resourceName" v-if="resourceName.carName">{{ resourceName.carName }}</a>
            <a slot="resourceName" slot-scope="resourceName" v-else>{{ resourceName.roomName }}</a>


            <span slot="resourcePic" slot-scope="resourcePic">
              <img v-if="resourcePic.carPic" :src="resourcePic.carPic" height="100px">
              <img v-else :src="resourcePic.roomPic" height="100px">
            </span>

            <span slot="reason" slot-scope="scope" v-if="scope.applyReason">{{ scope.applyReason }}</span>

            <span slot="reason" v-else>未填写</span>

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
      </a-tab-pane>
    </a-tabs>


    <!--编辑车辆对话框-->
    <a-modal
        title="拒绝理由"
        :visible="rejectDialogVisible"
        @ok="handleSubmit"
        @cancel="handleDialogCancel">
      <div>
        <a-textarea
            v-model="rejectReason"
            placeholder="Controlled autosize"
            :auto-size="{ minRows: 3, maxRows: 5 }"/>
      </div>
    </a-modal>
  </div>
</template>

<script>
const columns = [
  {
    key: 'resourceName',
    title: "资源名称",
    scopedSlots: {customRender: 'resourceName'}
  },
  {
    title: '资源图片',
    key: 'resourcePic',
    scopedSlots: {customRender: 'resourcePic'}
  },
  {
    title: '申请用户名称',
    key: 'username',
    dataIndex: 'loginName',
    scopedSlots: {customRender: 'loginName'}
  },
  {
    title: '申请时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '预约开始时间',
    key: 'startTime',
    dataIndex: 'startTime',
  },
  {
    title: '预约结束时间',
    key: 'endTime',
    dataIndex: 'endTime',
  },
  {
    title: '申请理由',
    key: 'applyReason',
    scopedSlots: {customRender: 'reason'}
  },
  {
    title: '操作',
    key: 'operation',
    scopedSlots: {customRender: 'operation'}

  }
];
export default {
  name: "ReserveManage",
  data() {
    return {
      columns,
      reserveList: [],
      rejectDialogVisible: false,
      rejectReason: '',
      reserveId: '',
      reserveStatus: '申请中',


      pagination: {
        pageSize: 7,
        current: 1,
        total: 0,
      },

    }
  },
  methods: {

    handleChange(e) {
      this.reserveStatus = e;
      this.getReserveList();

    },


    //分页数据改变
    pageNumChange(page, pageSize) {
      this.pagination.current = page;
      this.pagination.pageSize = pageSize;
      //如果是申请中
      if(this.reserveStatus === '申请中') {
        this.getReserveList();
      }
      else if(this.reserveStatus === '已通过') {
        this.getReserveList();
      }
      else {
        this.getReserveList();
      }
      
    },

    async handleSubmit() {
      try {
        const {data: res} = await this.$http.put(`/reserve/reject/${this.reserveId}`, {
          rejectReason: this.rejectReason
        });
        if (res.status !== 200) throw Error
        this.rejectDialogVisible = false;
        await this.getReserveList();
        this.$message.success("操作成功");
      } catch (e) {
        this.$message.warning("服务器繁忙，请稍后再试");
      }
    },

    //取消拒绝理由对话框
    handleDialogCancel() {
      this.rejectDialogVisible = false;
      this.rejectReason = ''
    },

    // 处理预约通过
    async handlePass(e) {
      try {
        const {data: res} = await this.$http.put(`/reserve/pass/${e.reserveId}`,{
          rejectReason: this.rejectReason
        });
        if (res.status !== 200) throw Error
        this.$message.success("处理成功");
        await this.getReserveList();
      } catch (e) {
        this.$message.warning("服务器繁忙，请稍后再试")
      }
    },


    handleReject(e) {
      this.reserveId = e.reserveId;
      this.rejectDialogVisible = true;
    },

    async getReserveList() {
      const {data: res} = await this.$http.get(`/reserves/${this.reserveStatus}?pageNum=${this.pagination.current}&pageSize=${this.pagination.pageSize}`);
      if (res.status === 200) {
        console.log(res);
        this.reserveList = res.data;
        this.pagination.total = res.total;
      }
    }
  },
  created() {
    this.getReserveList();
  }
}
</script>

<style scoped>

</style>
