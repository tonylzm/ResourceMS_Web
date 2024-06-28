<template>
  <a-drawer width="640" placement="right" :closable="false" :visible="visible" @close="onClose">
    <div><h2>{{ title }}</h2></div>
  <div>
  <label>选择日期：</label>
  <a-date-picker
      v-model="selectedDate"
      :disabled-date="disabledDate"
      format="YYYY-MM-DD"
      @change="onDateChange"
  />
</div>
    <div>
      <a-table
          :columns="columns"
          :data-source="dataList"
          :pagination="false"
      >
      </a-table>
    </div>
    <br/>
<h3>当日剩余可预约时间段(灰色表示已经被预约)</h3>
<br/>
    <div>
    <a-tag
        v-for="(hour, index) in availableHours"
        :key="index"
        :color="getTagColor(hour)"
    >
      {{ hour }}
    </a-tag>
  </div>
  </a-drawer>
</template>

<script>
import { DatePicker } from 'ant-design-vue';
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
  components: {
    'a-date-picker': DatePicker,
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    resource: {
      type: String,
      default: ''
    },
    resourceId: {
      type: Number,
      default: 0
    },
    pagination: {
      type: Object,
      default: () => ({
        current: 1,
        pageSize: 5,
        total: 1,
      })
    }
  },
  data() {
    return {
      columns,
      visible: false,
      dataList: [],
      availableHours: this.generateAvailableHours(),
      disabledHours: [],
      selectedDate: null,
    }
  },
  methods: {
    generateAvailableHours() {
      const hours = [];
      for (let i = 8; i < 19; i++) {
        const hour = i.toString().padStart(2, '0');
        hours.push(`${hour}:00:00 - ${hour}:59:59`);
      }
      return hours;
    },
    getTagColor(hour) {
     if (this.disabledHours.includes(hour)) {
        return 'grey';
     } else {
        return 'blue';
     }
    },
    async handleDateChange(carId,date) {
      // 假设 date 是一个字符串，比如 "2024-06-26"
      const parsedDate = new Date(date);
      const formattedDate = `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate.getDate().toString().padStart(2, '0')}`;
      console.log(formattedDate);
      this.formattedDate = formattedDate;
      try {
        // 向后端发送GET请求，获取当前日期的预约情况
        const { data: res } = await this.$http.get(`/${this.resource}/${carId}/?date=${formattedDate}`);
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
    showDrawer(resourceId) {
      this.resourceId = resourceId;
      this.visible = true;
    },
    async fetchData() {
      if (!this.selectedDate) {
        console.log("请选择日期");
        return;
      }
      try {
        const date = this.selectedDate.format("YYYY-MM-DD");
        const {data: res} = await this.$http.get(`/reserve/${this.resource}/${this.resourceId}?date=${date}`);
        await this.handleDateChange(this.resourceId,date);
        if (res.status !== 200) throw Error;
        this.dataList = res.data;
      } catch (e) {
        console.log(e);
      }
    },
    onClose() {
      this.dataList = [];
      this.visible = false;
      this.resourceId = 0;
      this.selectedDate = null;
      this.disabledHours = [];
    },
    onDateChange(date) {
      this.selectedDate = date;
      this.fetchData();
    },
    disabledDate(current) {
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + 7);
      return current && (current < today || current > end);
    },
  },
}
</script>

<style scoped>
/* Your styles here */
</style>
