<template>
  <div>
    <a-table :columns="columns" :data-source="roomList" :pagination="false">

      <!--车辆名称，没什么用，单纯加个没用的a标签-->
      <a slot="name" slot-scope="text">{{ text }}</a>

      <!--车辆图片-->
      <span slot="roomPic" slot-scope="src">
        <img :src="require(`D:/temp/upload/imag/${src}`)" style="width: 100px">
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
      <span slot="roomDesc" slot-scope="descs">
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
        :visible="roomReserveVisible"
        :confirm-loading="confirmLoading"
        :footer="false"
        @cancel="handleCancel"
    >

      <a-form v-bind="formItemLayout" :form="form" @submit="handleSubmit">
        <!-- 选择日期 -->
        <a-form-item label="预约日期">
          <a-date-picker
              v-decorator="['selectDate', { rules: [{ required: true, message: '请选择日期' }] }]"
              format="YYYY-MM-DD"
              :disabled-date="disabledDate"
              @change="handleDateChange"
          />
        </a-form-item>

        <!-- 选择时间段 -->
        <a-form-item label="预约时间">
          <div>
            <a-tag
                v-for="(hour, index) in availableHours"
                :key="index"
                :color="getTagColor(hour)"
                @click="handleTagClick(hour)"
                :disabled="!isSelectable(hour)"
            >
              {{ hour }}
            </a-tag>
          </div>
        </a-form-item>

        <!-- 申请理由 -->
        <a-form-item label="申请理由" v-bind="formItemLayout">
          <a-textarea
              placeholder="填写申请理由提高申请通过率(非必填)"
              :rows="4"
              v-decorator="['applyReason', { initialValue: '' }]"
          />
        </a-form-item>

        <!-- 按钮 -->
        <a-form-item
            :wrapper-col="{
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      }"
        >
          <a-button @click="handleCancel" style="margin-right: 10px">取消</a-button>
          <a-button type="primary" html-type="submit" :loading="submitLoading">提交</a-button>
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
    dataIndex: 'roomName',
    title: '房间名称',
    key: 'roomName',
    scopedSlots: {customRender: 'name'},
    width: 100,

  },
  {
    title: '房间图片',
    dataIndex: 'roomPic',
    key: 'roomPic',
    scopedSlots: {customRender: 'roomPic'},
  },
  {
    title: '房间状态',
    dataIndex: "isActive",
    key: "isActive",
    scopedSlots: {customRender: 'isActive'}
  },
  {
    title: '房间描述',
    key: 'roomDesc',
    dataIndex: 'roomDesc',
    scopedSlots: {customRender: 'roomDesc'},
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  },

];
const roomList = []
export default {
  name: "RoomReserve",
  data() {
    return{
      columns,
      moment,
      roomList,
      roomReserveVisible: false,
      confirmLoading: false,
      submitLoading: false,

      form: this.$form.createForm(this),
      availableHours: this.generateAvailableHours(),
      selectedHours: [],
      disabledHours: [], // 假设一些不可选时间段
      formattedDate: '',
      maxSelectableHours: 4,

      pagination: {
        pageSize: 7,
        current: 1,
        total: 0,
      },

      //预约车辆id
      roomId: 0,

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
    }
  },
  methods:{
    disabledDate(current) {
      // 禁用今天之前的日期
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (current && current < moment().endOf('day')) return true;
    },
    async handleDateChange(date) {
      // 假设 date 是一个字符串，比如 "2024-06-26"
      const parsedDate = new Date(date);
      const formattedDate = `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate.getDate().toString().padStart(2, '0')}`;
      console.log(formattedDate);
      this.formattedDate = formattedDate;

      try {
        // 向后端发送GET请求，获取当前日期的预约情况
        const { data: res } = await this.$http.get(`/reserveroomtime/?roomId=${this.roomId}&date=${formattedDate}`);
        if (res.status !== 200) {
          this.$message.warning("服务器繁忙，请稍后再试");
          return;
        }
        // 检查 res.data 是否存在
        if (res.data && res.data.length > 0) {
          const disabledHours = new Set();

          res.data.forEach(timeRange => {
            const [start, end] = timeRange.split('-').map(t => t.trim());

            // 生成小时区间并加入到 disabledHours 集合中
            let startHour = parseInt(start.split(':')[0]);
            let endHour = parseInt(end.split(':')[0]);

            for (let hour = startHour; hour <= endHour; hour++) {
              const hourStr = hour.toString().padStart(2, '0');
              disabledHours.add(`${hourStr}:00:00 - ${hourStr}:59:59`);
            }
          });

          this.disabledHours = Array.from(disabledHours);
        } else {
          this.disabledHours = [];
        }

        console.log('Disabled Hours:', this.disabledHours);
      } catch (error) {
        this.$message.error("请求失败，请稍后再试");
        console.error(error);
      }
    },



    generateAvailableHours() {
      const hours = [];
      for (let i = 9; i < 18; i++) {
        const hour = i.toString().padStart(2, '0');
        hours.push(`${hour}:00:00 - ${hour}:59:59`);
      }
      return hours;
    },

    handleTagClick(hour) {
      //如果选中的hour是在被禁止的时间段内，则不做任何操作
      if (this.disabledHours.includes(hour)) {
        this.$message.error('该时间段不可选');
        return;
      }
      if (this.isSelectable(hour)) {
        if (this.selectedHours.includes(hour)) {
          const index = this.selectedHours.indexOf(hour);
          console.log(this.selectedHours.length)
          if(index != 0 && index != this.selectedHours.length - 1) {
            console.log('index:', index, "不允许")
            this.$message.error('不允许删除中间时间段');
            return
          }else {
            this.selectedHours.splice(index, 1);
            console.log(this.selectedHours)
            this.$message.success('删除成功');
          }
        } else {
          // 添加当前选择的时间段
          this.selectedHours.push(hour);
          // 根据当前选择的时间段，合并连续的时间段
          this.mergeContinuousHours();
        }
      }
    },

    mergeContinuousHours() {
      if (this.selectedHours.length < 2) return;

      // 提取并排序时间段
      const sortedHours = this.selectedHours.map(hour => {
        const hourStart = parseInt(hour.split(':')[0]);
        return { hourStart, hour };
      }).sort((a, b) => a.hourStart - b.hourStart).map(entry => entry.hour);

      const mergedHours = [sortedHours[0]];

      for (let i = 1; i < sortedHours.length; i++) {
        const prevHourEnd = parseInt(mergedHours[mergedHours.length - 1].split(':')[1]);
        const currentHourStart = parseInt(sortedHours[i].split(':')[0]);

        if (currentHourStart === prevHourEnd) {
          // 如果当前时间段与前一个时间段连续，则合并
          mergedHours[mergedHours.length - 1] = `${mergedHours[mergedHours.length - 1].split(':')[0]}:${currentHourStart + 1}:00`;
        } else {
          // 否则将当前时间段加入合并数组
          mergedHours.push(sortedHours[i]);
        }
      }

      this.selectedHours = mergedHours;
      console.log('合并后的时间段:', this.selectedHours);
    },

    getTagColor(hour) {
      if (this.selectedHours.includes(hour)) {
        return 'green';
      } else if (this.disabledHours.includes(hour)) {
        return 'grey';
      } else if (this.isSelectable(hour)) {
        return 'blue';
      } else {
        return 'default';
      }
    },
    isSelectable(hour) {
      if (this.selectedHours.length === 0) return true;

      const { hourStart, hourEnd } = this.parseHourRange(hour);

      for (let i = 0; i < this.selectedHours.length; i++) {
        const selected = this.parseHourRange(this.selectedHours[i]);
        // 判断当前时间段与已选时间段是否重叠或相邻
        if (
            (hourStart >= selected.hourStart && hourStart <= selected.hourEnd + 1) ||
            (hourEnd >= selected.hourStart - 1 && hourEnd <= selected.hourEnd)
        ) {
          return true; // 只要存在一个重叠或相邻的情况，就返回可选
        }
      }

      return false; // 如果没有重叠或相邻情况，返回不可选
    },

    parseHourRange(hour) {
      const parts = hour.split(' - ');
      const hourStart = parseInt(parts[0].split(':')[0]);
      const hourEnd = parseInt(parts[1].split(':')[0]);
      return { hourStart, hourEnd };
    },
    //监听分页数据改变
    pageNumChange(page, pageSize) {
      this.pagination.current = page;
      this.pagination.pageSize = pageSize;
      this.getRoomList();
    },

    //初始化获取房间列表
    async getRoomList() {
      try {
        const {data: res} = await this.$http.get('/roomList',{
          params: {
            pageNum: this.pagination.current,
            pageSize: this.pagination.pageSize
          }
        });
        if (res.status!==200) throw Error;
        this.pagination.total = res.total;
        const data = res.data;
        for (let i = 0; i < data.length; i++) {
          if (data[i].roomDesc) {
            data[i].roomDesc = data[i].roomDesc.split(",");
          }
        }
        this.roomList = data;
      } catch (e){
        console.log(e);
      }
    },

    //处理申请预约单击事件
    async handleReserve(row) {
      if(await this.getapplystate() === false) return this.$message.warning("您有未处理的预约申请，请等待处理！");
      this.roomId = row.roomId;
      this.roomReserveVisible = true;
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

    //监听关闭对话框事件
    handleCancel() {
      this.roomReserveVisible = false;
      this.$message.info("已取消操作");
      this.form.resetFields();
    },

    //开始-结束时间范围
    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) {
        result.push(i);
      }
      return result;
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
      if (this.selectedHours.length === 0) {
        this.$message.error('请选择至少一个时间段');
        return;
      }
      this.form.validateFields(async (err, fieldsValue) => {
        if (err) {
          return;
        }
        let startTime = this.selectedHours[0].split(' - ')[0];
        let endTime = this.selectedHours[this.selectedHours.length - 1].split(' - ')[1];
        let start = this.formattedDate + ' ' + startTime;
        let end = this.formattedDate + ' ' + endTime;
        this.submitLoading = true;
        const values = {
          roomId: this.roomId,
          applyReason: fieldsValue['applyReason'],
          startTime: start,
          endTime: end,
        }

        try {
          const {data: res} = await this.$http.post(`reserve/room/${window.sessionStorage.getItem("USER_ID")}`, values)
          if (res.status !== 200) return this.$message.warning("服务器繁忙，请稍后再试");

          setTimeout(()=>{
            this.roomReserveVisible = false
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
    this.getRoomList();
  }
}
</script>

<style scoped>

</style>
