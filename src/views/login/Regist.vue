<template>
  <div class="user-layout-register">
    <a-form ref="formRegister" :form="form" id="formRegister">
      <a-form-item>
        <a-input size="large" type="text" placeholder="账号"
                 v-decorator="['username',{rules: [{ required: true, message: '请输入注册账号' }, { validator: this.handleUsernameCheck }], validateTrigger: ['change', 'blur']}]"></a-input>
      </a-form-item>
      <a-popover placement="rightTop" trigger="click" :visible="state.passwordLevelChecked">
        <template slot="content">
          <div :style="{ width: '240px' }">
            <div :class="['user-register', passwordLevelClass]">强度：<span>{{ passwordLevelName }}</span></div>
            <a-progress :percent="state.percent" :showInfo="false" :strokeColor=" passwordLevelColor "/>
            <div style="margin-top: 10px;">
              <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
            </div>
          </div>
        </template>
        <a-form-item>
          <a-input size="large" type="password" @click="handlePasswordInputClick" autocomplete="false"
                   placeholder="至少6位密码"
                   v-decorator="['password',{rules: [{ required: true, message: '至少6位密码'}, { validator: this.handlePasswordLevel }], validateTrigger: ['change', 'blur']}]"></a-input>
        </a-form-item>
      </a-popover>

      <a-form-item>
        <a-input size="large" type="password" autocomplete="false" placeholder="确认密码"
                 v-decorator="['password2',{rules: [{ required: true, message: '至少6位密码' }, { validator: this.handlePasswordCheck }], validateTrigger: ['change', 'blur']}]"></a-input>
      </a-form-item>

      <a-form-item>
        <a-button
            size="large"
            type="primary"
            htmlType="submit"
            class="register-button"
            :loading="registerBtn"
            @click.stop.prevent="handleSubmit"
            :disabled="registerBtn">立即注册
        </a-button>
        <a class="login" @click="returnLogin">使用已有账户登录</a>
      </a-form-item>

    </a-form>
  </div>
</template>

<script>
const levelNames = {
  0: '低',
  1: '低',
  2: '中',
  3: '强'
}
const levelClass = {
  0: 'error',
  1: 'error',
  2: 'warning',
  3: 'success'
}
const levelColor = {
  0: '#ff0000',
  1: '#ff0000',
  2: '#ff7e05',
  3: '#52c41a'
}
export default {
  beforeCreate() {
    this.form = this.$form.createForm(this)
  },
  name: 'Regist',
  components: {},
  data() {
    return {
      username: '',
      password: '',
      state: {
        time: 60,
        smsSendBtn: false,
        passwordLevel: 0,
        passwordLevelChecked: false,
        percent: 10,
        progressColor: '#FF0000'
      },
      registerBtn: false
    }
  },
  computed: {
    passwordLevelClass() {
      return levelClass[this.state.passwordLevel]
    },
    passwordLevelName() {
      return levelNames[this.state.passwordLevel]
    },
    passwordLevelColor() {
      return levelColor[this.state.passwordLevel]
    }
  },
  methods: {
    handlePasswordLevel(rule, value, callback) {
      let level = 0

      // 判断这个字符串中有没有数字
      if (/[0-9]/.test(value)) {
        level++
      }
      // 判断字符串中有没有字母
      if (/[a-zA-Z]/.test(value)) {
        level++
      }
      // 判断字符串中有没有特殊符号
      if (/[^0-9a-zA-Z_]/.test(value)) {
        level++
      }
      this.state.passwordLevel = level
      this.state.percent = level * 30
      if (level >= 2) {
        if (level >= 3) {
          this.state.percent = 100
        }
        callback()
      } else {
        if (level === 0) {
          this.state.percent = 10
        }
        callback(new Error('密码强度不够'))
      }
    },

    handlePasswordCheck(rule, value, callback) {
      let password = this.form.getFieldValue('password')
      if (value === undefined) {
        callback(new Error('请输入密码'))
      }
      if (value && password && value.trim() !== password.trim()) {
        callback(new Error('两次密码不一致'))
      }
      callback()
    },

    handleUsernameCheck(rule, value, callback) {
      let username = this.form.getFieldValue('username')
      username = typeof username === 'undefined' ? '' : username.trim()
      if (username.length) {
        if (username.length > 10) {
          callback(new Error('用户名不能超过10个字符'))
        } else if (username.length < 4) {
          callback(new Error('用户名不能少于4个字符'))
        } else {
          this.$http.get(`/user/check/${username}`).then((r) => {
            if (r.data.status===200) {
              callback()
            } else {
              callback(new Error('抱歉，该用户名已存在'))
            }
          })
        }
      } else {
        callback()
      }
    },

    // handlePhoneCheck (rule, value, callback) {
    //   callback()
    // },

    handlePasswordInputClick() {
      this.state.passwordLevelChecked = false
    },

    handleSubmit() {
      console.log("hello");
      this.form.validateFields((errors, values) => {
        console.log(values);
        if (!errors) {
          this.$http.post('/regist', {
            username: this.form.getFieldValue('username'),
            password: this.form.getFieldValue('password')
          }).then(() => {
            this.$message.success('注册成功')
            this.returnLogin()
          }).catch(() => {
            this.$message.error('抱歉，注册账号失败')
          })
        }
      })
    },

    returnLogin() {
      this.$emit('regist', 'Login')
    }
  }
}
</script>
<style lang="less">
.user-register {
  &.error {
    color: #ff0000;
  }

  &.warning {
    color: #ff7e05;
  }

  &.success {
    color: #52c41a;
  }
}

.user-layout-register {
  .ant-input-group-addon {
    &:first-child {
      background-color: #fff;
    }
  }

  & > h3 {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .register-button {
    width: 50%;
  }

  .login {
    float: right;
    line-height: 40px;
  }
}
</style>
