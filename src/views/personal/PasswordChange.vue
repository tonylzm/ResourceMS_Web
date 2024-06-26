<template>
  <a-form @submit.prevent="submitChange" :form="form">
    <a-tabs size="large" :tabBarStyle="{textAlign: 'center'}" style="padding: 0 2px;" :activeKey="activeKey"
            @change="handleTabsChange">
      <a-tab-pane tab="密码更改" key="1">
        <a-alert type="error" :closable="true" v-show="error" :message="error" showIcon
                 style="margin-bottom: 24px;"></a-alert>
        <a-form-item>
          <a-input size="large"  type="password" v-decorator="['old_password',{rules: [{ required: true, message: '请输入旧密码', whitespace: true}]}]">
            <a-icon slot="prefix" type="lock"></a-icon>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input size="large" type="password" v-decorator="['new_password',{rules: [{ required: true, message: '请输入新密码', whitespace: true}]}]">
            <a-icon slot="prefix" type="lock"></a-icon>
          </a-input>
        </a-form-item>
      </a-tab-pane>
    </a-tabs>
    <a-form-item>
      <a-button :loading="loading" style="width: 100%; margin-top: 4px" size="large" htmlType="submit" type="primary">
        修改
      </a-button>
    </a-form-item>
  </a-form>
</template>
<script>
export default {
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  name: "PasswordChange",
  data() {
    return {
      loading: false,
      error: '',
      activeKey: '1',
    }
  },
  created () {
    this.$db.clear();
  },
  methods: {
    //废弃方法
    passwordInput () {
      if (this.activeKey === '1') {
        // 用户名密码登录
        // eslint-disable-next-line no-unused-vars
        this.form.validateFields(['old_password', 'new_password'], (errors, values) => {
          if (!errors) {
            this.loading = true
            let old_password = this.form.getFieldValue('old_password')
            let new_password = this.form.getFieldValue('new_password')

            this.$http.post('/changepassword', {// 此处应该填写对应的后端网址
              old_password: old_password,
              new_password: new_password
            }).then((r) => {
              console.log(r);
              if (r.data.status === 400) {
                this.loading = false;
                return this.$message.warning("未知错误");
              }

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

    handleTabsChange (val) {
      this.activeKey = val
    },
    submitChange(){
      this.form.validateFields(['old_password', 'new_password'], (errors, values) => {
        console.log(values)
        if (!errors) {
          this.loading = true
          let old_password = this.form.getFieldValue('old_password')
          let new_password = this.form.getFieldValue('new_password')

          this.$http.post('/changepassword', {// 此处应该填写对应的后端网址
            user_id:parseInt(sessionStorage.getItem("USER_ID")),
            old_password: old_password,
            new_password: new_password
          },
          ).then((r) => {
            console.log(r);
            if (r.data.status === 200) {

              setTimeout(() => {
                this.loading = false
              }, 500)
              this.$message.success("修改成功，请重新登录");
              this.$router.push('/login')
            }
            else if(r.data.status === 201){
              this.loading = false;
              return this.$message.warning("密码更改失败\n失败信息:"+r.data.msg);
            }else{
              this.loading = false;
              return this.$message.warning("发生错误\n失败信息:"+r.data.msg);
            }
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

  },
    // savaLoginData(data) {
    //   window.sessionStorage.setItem("TOKEN", data.token);
    //   window.sessionStorage.setItem("USER_NAME", data.username);
    //   window.sessionStorage.setItem("ROLE_NAME", data.roleName);
    //   window.sessionStorage.setItem("USER_ID", data.userId);
    //   if (!data.loginTime) {
    //     data.loginTime = "第一次登录"
    //   }
    //   window.sessionStorage.setItem("LOGIN_TIME", data.loginTime);
    //   window.sessionStorage.setItem("USER_IP",data.userIp)
    //   window.sessionStorage.setItem("TODAY_COUNT", data.todayCount);
    //   window.sessionStorage.setItem("TOTAL_COUNT", data.totalCount);
    // }
  // }
}
</script>

<style scoped>

</style>
