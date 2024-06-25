<template>
  <div class="login">
    <a-form @submit.prevent="doLogin" :form="form">
      <a-tabs size="large" :tabBarStyle="{textAlign: 'center'}" style="padding: 0 2px;" :activeKey="activeKey"
              @change="handleTabsChange">
        <a-tab-pane tab="账户密码登录" key="1">
          <a-alert type="error" :closable="true" v-show="error" :message="error" showIcon
                   style="margin-bottom: 24px;"></a-alert>
          <a-form-item>
            <a-input size="large"  v-decorator="['name',{rules: [{ required: true, message: '请输入账户名', whitespace: true}]}]">
              <a-icon slot="prefix" type="user"></a-icon>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input size="large" type="password" v-decorator="['password',{rules: [{ required: true, message: '请输入密码', whitespace: true}]}]">
              <a-icon slot="prefix" type="lock"></a-icon>
            </a-input>
          </a-form-item>
        </a-tab-pane>
        <a-tab-pane tab="手机号登录" key="2">
          <a-form-item>
            <a-input size="large">
              <a-icon slot="prefix" type="mobile"></a-icon>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-row :gutter="8" style="margin: 0 -4px">
              <a-col :span="16">
                <a-input size="large">
                  <a-icon slot="prefix" type="mail"></a-icon>
                </a-input>
              </a-col>
              <a-col :span="8" style="padding-left: 4px">
                <a-button style="width: 100%" class="captcha-button" size="large" @click="getCaptcha">获取验证码</a-button>
              </a-col>
            </a-row>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
      <a-form-item>
        <a-button :loading="loading" style="width: 100%; margin-top: 4px" size="large" htmlType="submit" type="primary">
          登录
        </a-button>
      </a-form-item>
      <div>
        <a style="float: right" @click="regist">注册账户</a>
      </div>
    </a-form>
  </div>
</template>

<script>
export default {

  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  name: 'Login',
  data () {
    return {
      loading: false,
      error: '',
      activeKey: '1',
    }
  },
  computed: {
  },
  created () {
    this.$db.clear();
  },
  methods: {
    doLogin () {
      if (this.activeKey === '1') {
        // 用户名密码登录
        // eslint-disable-next-line no-unused-vars
        this.form.validateFields(['name', 'password'], (errors, values) => {
          if (!errors) {
            this.loading = true
            let username = this.form.getFieldValue('name')
            let password = this.form.getFieldValue('password')

            this.$http.post('/login', {
              username: username,
              password: password
            }).then((r) => {
              console.log(r);
              if (r.data.status === 400) {
                this.loading = false;
                return this.$message.warning("用户名或账号错误");
              }
              let data = r.data.data
              this.savaLoginData(data);
              setTimeout(() => {
                this.loading = false
              }, 500)
              this.$message.success("登录,欢迎使用");
              this.$router.push('/home')
            }).catch((e) => {
              this.$message.warning("服务器繁忙，请稍后再试");
              console.error(e)
              setTimeout(() => {
                this.loading = false
              }, 500)
            })
          }
        })
      }
      if (this.activeKey === '2') {
        // 手机验证码登录
        this.$message.warning('暂未开发')
      }
    },
    regist () {
      this.$emit('regist', 'Regist')
    },
    getCaptcha () {
      this.$message.warning('暂未开发')
    },
    handleTabsChange (val) {
      this.activeKey = val
    },
    savaLoginData(data) {
      window.sessionStorage.setItem("TOKEN", data.token);
      window.sessionStorage.setItem("USER_NAME", data.username);
      window.sessionStorage.setItem("ROLE_NAME", data.roleName);
      window.sessionStorage.setItem("USER_ID", data.userId);
      if (!data.loginTime) {
        data.loginTime = "第一次登录"
      }
      window.sessionStorage.setItem("LOGIN_TIME", data.loginTime);
      window.sessionStorage.setItem("USER_IP",data.userIp)
      window.sessionStorage.setItem("TODAY_COUNT", data.todayCount);
      window.sessionStorage.setItem("TOTAL_COUNT", data.totalCount);
    }
  }
}
</script>

<style lang="less" scoped>
  .login {
    .icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }
  }
</style>
