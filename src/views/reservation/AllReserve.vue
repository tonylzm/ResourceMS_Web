<template>
  <div>
    <a-tabs default-active-key="applying" @change="onChange">
      <!--申请中标签页-->
      <a-tab-pane key="applying" tab="申请中">
        <div>

          <a-table :columns="columns" :data-source="applyingList" :scroll="{ y: 350 }">

            <a slot="resourceName" slot-scope="resourceName" v-if="resourceName.carName">{{ resourceName.carName}}</a>
            <a slot="resourceName" slot-scope="resourceName" v-else>{{ resourceName.roomName}}</a>

            <span slot="resourcePic" slot-scope="resourcePic">
              <img v-if="resourcePic.carPic" :src="resourcePic.carPic" height="100px">
              <img v-else :src="resourcePic.roomPic" height="100px">
            </span>

            <span slot="reason" slot-scope="scope" v-if="scope.applyReason">{{scope.applyReason}}</span>
            <span slot="reason"  v-else>未填写</span>
          </a-table>

        </div>
      </a-tab-pane>


      <!--申请通过标签页-->
      <a-tab-pane key="passed" tab="已通过" force-render>
        <div>

          <a-table :columns="columns" :data-source="passedList">

            <a slot="resourceName" slot-scope="resourceName" v-if="resourceName.carName">{{ resourceName.carName}}</a>
            <a slot="resourceName" slot-scope="resourceName" v-else>{{ resourceName.roomName}}</a>

            <span slot="resourcePic" slot-scope="resourcePic">
              <img v-if="resourcePic.carPic" :src="resourcePic.carPic" height="100px">
              <img v-else :src="resourcePic.roomPic" height="100px">
            </span>

            <span slot="reason" slot-scope="scope" v-if="scope.applyReason">{{scope.applyReason}}</span>
            <span slot="reason"  v-else>未填写</span>

          </a-table>
        </div>
      </a-tab-pane>

      <!--申请驳回标签页-->
      <a-tab-pane key="rejected" tab="已驳回">
        <div>

          <a-table :columns="rejColumns" :data-source="rejectedList">

            <a slot="resourceName" slot-scope="resourceName" v-if="resourceName.carName">{{ resourceName.carName}}</a>
            <a slot="resourceName" slot-scope="resourceName" v-else>{{ resourceName.roomName}}</a>

            <span slot="resourcePic" slot-scope="resourcePic">
              <img v-if="resourcePic.carPic" :src="resourcePic.carPic" height="100px">
              <img v-else :src="resourcePic.roomPic" height="100px">
            </span>

            <span slot="action" slot-scope="scope">
              <a @click="reApply(scope)">重新申请</a>
            </span>

            <span slot="applyReason"  slot-scope="applyReason" v-if="applyReason">{{reason.applyReason}}</span>
            <span slot="applyReason"  v-else>未填写</span>

            <span slot="rejectReason"  slot-scope="rejectReason" v-if="rejectReason">{{rejectReason.rejectReason}}</span>
            <span slot="rejectReason"  v-else>无</span>

          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!--预约申请对话框-->
    <a-modal
        title="提交预约申请"
        :visible="reReserveVisible"
        :footer="false"
        @cancel="handleCancel"
    >

      <a-form v-bind="formItemLayout" :form="form" @submit="handleSubmit">

        <a-form-item label="预约时间">
          <time-picker @timeSelect="timeSelect"></time-picker>
          <a-input v-show="false" v-decorator="['startTime',{rules:[{required: true,message:'请输入预约时间',whitespace: true}]}]"/>
          <a-input v-show="false" v-decorator="['endTime',{rules:[{required: true,message:'请输入预约时间',whitespace: true}]}]"/>
        </a-form-item>

        <!--申请理由-->
        <a-form-item label="申请理由" >
          <a-textarea placeholder="填写申请理由提高申请通过率(非必填)" :rows="4" v-decorator="['applyReason',{  initialValue:'' }]"/>
        </a-form-item>

        <!--按钮-->
        <a-form-item
            :wrapper-col="{
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      }"
        >
          <a-button @click="handleCancel" style="margin-right: 10px">
            取消
          </a-button>
          <a-button type="primary" html-type="submit" :loading="submitLoading">
            提交
          </a-button>
        </a-form-item>
      </a-form>


    </a-modal>
  </div>
</template>

<script>
import TimePicker from "@/views/common/TimePicker";
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
    dataIndex: 'startTime',
  },
  {
    title: '申请理由',
    key: 'applyReason',
    scopedSlots: {customRender: 'reason'}
  },
];
const rejColumns = [
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
    dataIndex: 'startTime',
  },
  {
    title: '申请理由',
    key: 'applyReason',
    dataIndex: 'applyReason',
    scopedSlots: {customRender: 'applyReason'}
  },
  {
    title: '驳回理由',
    key: 'rejectReason',
    dataIndex: 'rejectReason',
    scopedSlots: {customRender: 'rejectReason'}
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'}
  },
];

const applyingList = [];
const passedList = [];
const rejectedList = [];

export default {
  components: {TimePicker},
  name: "AllReserve",
  data() {
    return {
      columns,
      rejColumns,
      applyingList,
      passedList,
      rejectedList,
      defaultKey: '申请中',
      userId: '',
      reReserveVisible: false,

      form: this.$form.createForm(this),

      submitLoading: false,
      formItemLayout: {
        labelCol: {
          xs: {span: 24},
          sm: {span: 6},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16},
        },
      },

      reserveId: '',
    }
  },
  methods: {

    timeSelect(e) {
      console.log(e);
      this.form.setFieldsValue({startTime: e[0],endTime: e[1]})
    },

    //处理表单提交
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async (err,valueField) =>{
        if (err) return
        this.submitLoading = true;
        const values = {
          applyReason: valueField['applyReason'],
          startTime: valueField['startTime'],
          endTime: valueField['endTime']
        }
        try {
          const {data: res} = await this.$http.put(`/api/reserve/${this.reserveId}`, values);
          if (res.status!==200) throw Error;
          this.$message.success("申请成功，请留意申请结果！")
        }catch (e) {
          this.$message.warning("服务器繁忙，请稍后再试");
          console.log(e);
        }finally {
          this.submitLoading = false;
        }
      })

    },

    handleCancel() {
      this.reReserveVisible = false;
      this.form.resetFields();
    },

    //tabs onchange
    async onChange(e) {
      try {
        if (e === "applying") {
          await this.getApplyingList();
        }else if (e === "passed") {
          await this.getPassedList();
        }else if (e === "rejected") {
          await this.getRejectedList();
        }
      }catch (e) {
        console.log(e);
      }

    },
    async getApplyingList() {
      try {
        const {data: res} = await this.$http.get(`/reserve/${this.userId}?state=申请中`);
        if (res.status !== 200) return
        this.applyingList = res.data;
      } catch (e) {
        console.log(e);
      }
    },
    async getPassedList() {
      try {
        const {data: res} = await this.$http.get(`/reserve/${this.userId}?state=已通过`);
        if (res.status !== 200) return
        this.passedList = res.data;
      } catch (e) {
        console.log(e);
      }
    },
    async getRejectedList() {
      try {
        const {data: res} = await this.$http.get(`/reserve/${this.userId}?state=已驳回`);
        if (res.status !== 200) return
        this.rejectedList = res.data;
      } catch (e) {
        console.log(e);
      }
    },

    reApply(scope) {
      this.reReserveVisible = true;
      this.reserveId = scope.reserveId;
    }
  },
  created() {
    this.userId = window.sessionStorage.getItem("USER_ID")
    this.getApplyingList();
  }
}
</script>

<style scoped>

</style>
