<template>
  <div>
    <a-row :gutter="8">
      <a-card>
        <!--登录信息区域-->
        <a-col :span="12">
          <!--头像-->
          <div class="avatar">
            <img alt="头像" :src="require('../../assets/avatar/BiazfanxmamNRoxxVxka.png')">
          </div>

          <!--欢迎语-->
          <div class="head-info-count">
            <div class="head-info-welcome">
              {{welcomeMessage}}
            </div>
            <!--部门角色信息-->
            <div class="head-info-desc">
              <p>{{user.deptName ? user.deptName : '暂无部门'}} | {{user.roleName ? user.roleName : '暂无角色'}}</p>
            </div>
            <!--上次登录时间-->
            <div class="head-info-time">
              上次登录时间：{{user.lastLoginTime ? user.lastLoginTime : '第一次访问系统'}}
            </div>
          </div>
        </a-col>

        <a-col :span="12">
          <div>
            <a-row class="more-info">
              <a-col :span="4"></a-col>
              <a-col :span="4"></a-col>
              <a-col :span="4"></a-col>
              <a-col :span="4">
                <head-info title="今日IP" :content="todayIp" :center="false" :bordered="false"/>
              </a-col>
              <a-col :span="4">
                <head-info title="今日访问" :content="todayVisitCount" :center="false" :bordered="false"/>
              </a-col>
              <a-col :span="4">
                <head-info title="总访问量" :content="totalVisitCount" :center="false" />
              </a-col>
            </a-row>
          </div>
        </a-col>
      </a-card>
    </a-row>

  </div>
</template>
<script>
import HeadInfo from "@/views/common/HeadInfo";
export default {
  components:{HeadInfo},
  data() {
    return {
      user:{
        deptName: '',
        roleName: '',
        userName: '',
        lastLoginTime: '',
      },
      lastLoginTime: '',
      welcomeMessage: '',
      todayIp: "localhost",
      todayVisitCount: 1,
      totalVisitCount: 99,
    }
  },
  methods: {
    welcome() {
      const date = new Date()
      const hour = date.getHours()
      let time = hour < 6 ? '早上好' : (hour <= 11 ? '上午好' : (hour <= 13 ? '中午好' : (hour <= 18 ? '下午好' : '晚上好')))
      let welcomeArr = [
        '喝杯咖啡休息下吧☕',
        '要不要和朋友打局LOL',
        '要不要和朋友打局王者荣耀',
        '几天没见又更好看了呢😍',
        '今天又写了几个Bug🐞呢',
        '今天在群里吹水了吗',
        '今天吃了什么好吃的呢',
        '今天您微笑了吗😊',
        '今天帮助别人解决问题了吗',
        '准备吃些什么呢',
        '周末要不要去看电影？'
      ]
      let index = Math.floor((Math.random() * welcomeArr.length))
      return `${time}，${this.user.userName}，${welcomeArr[index]}`
    },
    getUserInfo() {
      this.user.userName = window.sessionStorage.getItem("USER_NAME")
      this.user.roleName = window.sessionStorage.getItem("ROLE_NAME");
      this.user.lastLoginTime = window.sessionStorage.getItem("LOGIN_TIME");
      this.todayIp = window.sessionStorage.getItem("USER_IP")
      this.todayVisitCount = window.sessionStorage.getItem("TODAY_COUNT")
      this.totalVisitCount = window.sessionStorage.getItem("TOTAL_COUNT")
      },
  },
  created() {
    this.getUserInfo();

  },
  mounted() {
    this.welcomeMessage = this.welcome()
  }
}
</script>

<style scoped lang="less">
.avatar {
  display: inline-block;
  float: left;
  margin-right: 1rem;

  img {
    width: 5rem;
    border-radius: 2px;
  }
}

.head-info-count {
  display: inline-block;
  float: left;
  .head-info-welcome {
    font-size: 1.05rem;
    margin-bottom: .1rem;
  }
  .head-info-desc {
    color: rgba(0, 0, 0, 0.45);
    font-size: .8rem;
    padding: .2rem 0;
    p {
      margin-bottom: 0;
    }
  }
  .head-info-time {
    color: rgba(0, 0, 0, 0.45);
    font-size: .8rem;
    padding: .2rem 0;
  }
}
</style>
