<template>
  <div>
    <a-table :columns="columns" :data-source="carList" :pagination="false">

      <!--车辆名称，没什么用，单纯加个没用的a标签-->
      <a slot="name" slot-scope="text">{{ text }}</a>

      <!--车辆图片-->
      <span slot="carPic" slot-scope="scope">
       <img :src="require(`D:/temp/upload/imag/${scope}`)" style="width: 100px">
      </span>

      <!--车辆状态-->
      <span slot="isActive" slot-scope="isActive">
        <span v-if="isActive===true">
          <a-badge status="success"/>可预约
        </span>
        <span v-else>
           <a-badge status="error"/>暂不可用
        </span>
      </span>

      <!--车辆描述-->
      <span slot="carDesc" slot-scope="descs">
      <a-tag
          v-for="desc in descs"
          :key="desc"
          :color="desc.length > 5 ? 'geekblue' : 'green'"
      >
        {{ desc }}
      </a-tag>
      </span>


      <!--操作列-->
      <span slot="action" slot-scope="scope">
        <a @click="handleReserve(scope)" :disabled="scope.isActive===false">立即预约</a>
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


    <!--预约申请对话框-->
    <a-modal
        title="预约申请"
        :visible="carReserveVisible"
        :footer="false"
        @cancel="handleCancel"
    >

      <a-form v-bind="formItemLayout" :form="form" @submit="handleSubmit">

        <a-form-item label="预约时间">
          <a-range-picker
              :disabled-date="disabledDate"
              :disabled-time="disabledRangeTime"
              :show-time="{
                hideDisabledOptions: true,
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],}"
              v-decorator="['selectTime', rangeConfig]"
              format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>

        <!--申请理由-->
        <a-form-item label="申请理由" v-bind="formItemLayout">
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
import moment from 'moment';
const columns =[
  {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    align: 'center',
    width: 50,
    customRender: (text, record, index) => `${index + 1}`,
  },
  {
    dataIndex: 'carName',
    title: '车辆名称',
    key: 'carName',
    scopedSlots: {customRender: 'name'},
    width: 100,

  },
  {
    title: '车辆图片',
    dataIndex: 'carPic',
    key: 'carPic',
    scopedSlots: {customRender: 'carPic'},
  },
  {
    title: '车辆状态',
    dataIndex: "isActive",
    key: "isActive",
    scopedSlots: {customRender: 'isActive'}
  },
  {
    title: '车辆描述',
    key: 'carDesc',
    dataIndex: 'carDesc',
    scopedSlots: {customRender: 'carDesc'},
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  },

];
export default {
  name: "CarReserve",
  beforeCreate() {
  },
  data() {
    return {
      moment,
      columns,
      carList: [],

      carReserveVisible: false,
      submitLoading: false,

      form: this.$form.createForm(this),

      //预约车辆id
      carId: 0,

      //申请预约布局
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

      //预约时间范围配置
      rangeConfig: {
        rules: [{type: 'array', required: true, message: '请选择预约时间!'}],
      },

      pagination: {
        pageSize: 7,
        current: 1,
        total: 0,
      }

    }
  },
  methods: {

    //分页数据改变
    pageNumChange(page, pageSize) {
      this.pagination.current = page;
      this.pagination.pageSize = pageSize;
      this.getCarList();
    },

    //获取车辆列表
    async getCarList() {
      try {
        const {data: res} = await this.$http.get("/carList",{
          params:{
            pageNum: this.pagination.current,
            pageSize: this.pagination.pageSize
          }
        });
        if (res.status !== 200) throw Error;
        const data = res.data;
        this.pagination.total = res.total;
        for (let i = 0; i < data.length; i++) {
          if (data[i].carDesc) {
            data[i].carDesc = data[i].carDesc.split(",");
          }
        }
        this.carList = data;

      } catch (e){
        console.log(e);
      }

    },
    //点击预约事件处理
    async handleReserve(scope) {
      if(await this.getapplystate() === false) return this.$message.warning("您有未处理的预约申请，请等待处理！");
      this.carId = scope.carId;
      this.carReserveVisible = true;
    },

    async getapplystate(){
      try {
        const {data: res} = await this.$http.get(`reserved/${window.sessionStorage.getItem("USER_ID")}`)
        if (res.status !== 200) return this.$message.warning("服务器繁忙，请稍后再试");
        //输出返回的数据
        return res.data;
      }catch (e) {
        this.submitLoading = false;
        return this.$message.warning("服务器繁忙，请稍后再试");
      }
    },

    //对话框关闭事件
    handleCancel() {
      this.form.resetFields();
      this.$message.info("已取消操作");
      this.carReserveVisible = false;
    },


    //开始-结束时间范围
    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) {
        result.push(i);
      }
      return result;
    },

    //禁用日期范围
    disabledDate(current) {
      // Can not select days before today and today
      return current && current < moment().endOf('day');
    },
    //禁用时间范围
    disabledRangeTime(_, type) {
      if (type === 'start') {
        return {
          disabledHours: () => this.range(0, 60).splice(4, 20),
          disabledMinutes: () => this.range(30, 60),
          disabledSeconds: () => [55, 56],
        };
      }
      return {
        disabledHours: () => this.range(0, 60).splice(20, 4),
        disabledMinutes: () => this.range(0, 31),
        disabledSeconds: () => [55, 56],
      };
    },

    //对话框提交事件
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async (err, fieldsValue) => {
        if (err) {
          return;
        }
        this.submitLoading = true;
        const values = {
          carId: this.carId,
          applyReason: fieldsValue['applyReason'],
          startTime: fieldsValue['selectTime'][0].format('YYYY-MM-DD HH:mm:ss'),
          endTime: fieldsValue['selectTime'][1].format('YYYY-MM-DD HH:mm:ss'),
        }

        try {
          const {data: res} = await this.$http.post(`reserve/car/${window.sessionStorage.getItem("USER_ID")}`, values)
          if (res.status !== 200) return this.$message.warning("服务器繁忙，请稍后再试");

          setTimeout(()=>{
            this.carReserveVisible = false
            this.submitLoading = false;
            this.$message.success("预约申请成功");
          },500);

        } catch (e) {
          this.submitLoading = false;
          return this.$message.warning("服务器繁忙，请稍后再试");
        }
      })
    }
  },
  created() {
    this.getCarList();
  }
}
</script>

<style scoped>

</style>
