<template>

  <a-layout id="components-layout-demo-side" style="min-height: 100vh">
    <!--side menu-->
    <a-layout-sider v-model="collapsed" :trigger="null" collapsible style="background-color: white">
      <!--logo area-->
      <div class="logo">
        <img src="../../static/img/logo.png">
        <span :class="[collapsed?'hidden':'sysName']">资源预约系统</span>
      </div>
      <!--menu area-->
      <a-menu theme="light"
              :default-selected-keys="selectKey"
              :selectedKeys="selectKey"
              mode="inline"
              :defaultOpenKeys="defaultOpenKeys">
        <a-menu-item key="首页">
          <router-link to="/welcome" tag="div">
            <a-icon type="pie-chart"/>
            <span>主界面</span>
          </router-link>
        </a-menu-item>

        <a-sub-menu key="预约中心" v-if="roleName==='员工'">
          <span slot="title">
            <a-icon type="user"/>
            <span>预约中心</span>
          </span>
          <a-menu-item key="车辆预约">
            <router-link tag='div' to="/car">
              <a-icon type="pie-chart"/>
              <span>预约车辆</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="会议室预约">
            <router-link tag='div' to="/room">
              <a-icon type="pie-chart"/>
              <span>预约会议室</span>
            </router-link>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="资源管理" v-if="roleName==='管理员'">
          <span slot="title">
            <a-icon type="user"/>
            <span>资源管理</span>
          </span>
          <a-menu-item key="车辆管理">
            <router-link tag='div' to="/carManage">
              <a-icon type="pie-chart"/>
              <span>车辆管理</span>
            </router-link>
          </a-menu-item>

          <a-menu-item key="会议室管理">
            <router-link tag='div' to="/roomManage">
              <a-icon type="pie-chart"/>
              <span>会议室管理</span>
            </router-link>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="预约管理" v-if="roleName==='管理员'">
          <span slot="title">
            <a-icon type="user"/>
            <span>预约管理</span>
          </span>
          <a-menu-item key="预约管理">
            <router-link tag='div' to="/reserveManage">
              <a-icon type="pie-chart"/>
              <span>全部预约</span>
            </router-link>
          </a-menu-item>
        </a-sub-menu>


          <a-menu-item key="我的预约" v-if="roleName==='员工'">
            <router-link tag='div' to="/allReserve">
              <a-icon type="pie-chart"/>
              <span>我的预约</span>
            </router-link>
          </a-menu-item>
        <a-menu-item key="用户管理" v-if="roleName==='管理员'">
          <router-link tag='div' to="/userManage">
            <a-icon type="pie-chart"/>
            <span>用户管理</span>
          </router-link>
        </a-menu-item>

        <a-sub-menu key="账号">
          <span slot="title">
            <a-icon type="team"/>
            <span>账号设置</span>
          </span>
          <a-menu-item key="个人信息">
            <router-link tag='div' to="/profile">
              <a-icon type="pie-chart"/>
              <span>个人信息</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="密码管理">
            <router-link tag='div' to="/passwordChange">
              <a-icon type="pie-chart"/>
              <span>密码管理</span>
            </router-link>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!--header area-->
      <a-layout-header style="background: #fff; padding: 0">
        <a-icon
            class="trigger"
            :type="collapsed ? 'menu-unfold' : 'menu-fold'"
            @click="() => (collapsed = !collapsed)"
        />
        <div style="float: right;margin-right: 15px">
          <a-avatar :src="avatar"/>
          <span class="curr-user"></span>
          <a-dropdown>
            <a class="ant-dropdown-link" @click="e => e.preventDefault()">
              <span>{{ username }}</span>
              <a-icon type="down"/>
            </a>
            <a-menu style="width: 150px" slot="overlay">
              <a-menu-item @click="openProfile">
                <a-icon type="user"/>
                <span>个人中心</span>
              </a-menu-item>
              <a-menu-item @click="updatePassword">
                <a-icon type="key"/>
                <span>密码修改</span>
              </a-menu-item>
              <a-menu-divider></a-menu-divider>
              <a-menu-item @click="logout">
                <a-icon type="logout"/>
                <span>退出登录</span>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!--main content area-->
      <a-layout-content style="margin: 0 16px">
        <Bread></Bread>
        <a-card :style="{ padding: '24px', background: '#fff', minHeight: '480px' }">
          <router-view/>
        </a-card>
      </a-layout-content>

    </a-layout>
  </a-layout>
</template>
<script>
import Bread from "@/components/Bread";

export default {
  components: {Bread},
  data() {
    return {
      avatar: "http://ww1.sinaimg.cn/large/0061FODigy1gs9amil74sj60b40b4aao02.jpg",
      roleName: '',
      username: '',
      collapsed: false,
      selectKey: ["/welcome"],
      defaultOpenKeys: ["预约中心"]
    };
  },
  methods: {
    updatePassword() {

    },
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    openProfile() {
      console.log(this.selectKey[0]);
      if (this.selectKey[0] === "个人信息") return;
      this.$router.push('/profile')
    },
  },
  watch: {
    $route() {
      this.selectKey = [this.$route.meta.title]
      this.$forceUpdate()
    }
  },
  created() {
    if (this.$route.meta.title) {
      this.selectKey = [this.$route.meta.title];
    }
    this.username = sessionStorage.getItem("USER_NAME");
    this.roleName = sessionStorage.getItem("ROLE_NAME");
  },
};
</script>

<style lang="less">
.logo {
  height: 32px;
  background: white;
  margin: 16px;
  padding-left: 10px;
}

.sysName {
  font-size: 18px;
  font-weight: bold;
  width: 50px;
  padding-left: 8px;
  color: deepskyblue;
  overflow: hidden;
}

.a-dropdown {
  height: 100%;
  margin-left: 5px;
  font-size: 10px;
}

.curr-user {
  font-weight: 600;
  margin-left: 6px
}

.ant-layout-sider-trigger {
  background: white;
  color: #2eabff;
}

.hidden {
  visibility: hidden;
}
</style>
