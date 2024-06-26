<template>
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
</template>

<script>


export default {
  data() {
    return {
      form: this.$form.createForm(this),
      availableHours: this.generateAvailableHours(),
      selectedHours: [],
      rebackHours: [],
      disabledHours: [], // 假设一些不可选时间段
      formattedDate: '',
      maxSelectableHours: 4
    };
  },
  created() {
    this.getCarList();
  },
  methods: {
    disabledDate(current) {
      // 禁用今天之前的日期
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (current && current < today) return true;
    },
    handleDateChange(date) {
      // 假设 date 是一个字符串，比如 "2024-06-26"
      const parsedDate = new Date(date);
      const formattedDate = `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate.getDate().toString().padStart(2, '0')}`;
      console.log(formattedDate);
      this.formattedDate = formattedDate;
      if(formattedDate == '2024-06-26') {
        this.disabledHours = ["14:00 - 14:59", "16:00 - 16:59"];
      }else {
        this.disabledHours = [];
      }
      // 现在可以使用 formattedDate 做进一步的处理
    },


    generateAvailableHours() {
      const hours = [];
      for (let i = 9; i < 18; i++) {
        hours.push(`${i}:00 - ${i}:59`);
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

    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
          console.log('Selected hours: ', this.selectedHours);
          let startTime = this.selectedHours[0].split(' - ')[0];
          let endTime = this.selectedHours[this.selectedHours.length - 1].split(' - ')[1];
          let start = this.formattedDate + ' ' + startTime;
          let end = this.formattedDate + ' ' + endTime;
          console.log('开始时间:', start, '结束时间:', end);

        }
      });
    },
    handleCancel() {
      this.form.resetFields();
      this.selectedHours = [];
    },
    getCarList() {
      // 假设这是获取汽车列表的方法
      console.log('获取汽车列表');
    },
  }
};
</script>

<style scoped>
.a-tag {
  margin-bottom: 8px;
  cursor: pointer;
}
</style>
