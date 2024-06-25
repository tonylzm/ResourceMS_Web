<template>
  <div>
    <a-range-picker
        @change="onchange"
        :disabled-date="disabledDate"
        :disabled-time="disabledRangeTime"
        :show-time="{
        hideDisabledOptions: true,
        defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
      }"
        format="YYYY-MM-DD HH:mm:ss"
    />
  </div>
</template>
<script>
import moment from 'moment';
export default {
  name:'timePicker',
  data() {
    return{
      selectTime: [],
    }
  },
  methods: {
    onchange(value,dateString) {
      console.log(value);
      this.$emit('timeSelect', dateString);
    },
    moment,
    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) {
        result.push(i);
      }
      return result;
    },

    disabledDate(current) {
      // Can not select days before today and today
      return current && current < moment().endOf('day');
    },


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
  },
};
</script>
