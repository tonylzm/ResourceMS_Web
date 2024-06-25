<template>
  <div>
    <a-form :form="form" @submit="handleSubmit" style="width: 50%">

      <a-form-item v-bind="formItemLayout" label="登录名">
        <a-input :disabled="true" v-model="userInfo.loginName"></a-input>
      </a-form-item>

      <a-form-item v-bind="formItemLayout" label="角色名">
        <a-input :disabled="true" v-model="userInfo.userName"></a-input>
      </a-form-item>

      <a-form-item label="性别"  v-bind="formItemLayout">
        <a-select v-decorator="['sex',{ rules: [{ required: true, message: '请选择性别' }] },]"
            placeholder="请选择性别">
          <a-select-option value="男">
            男
          </a-select-option>
          <a-select-option value="女">
            女
          </a-select-option>
        </a-select>
      </a-form-item>


      <a-form-item v-bind="formItemLayout" label="年龄" >
        <a-input-number v-decorator="['age', { rules: [{ required: true, message: '请选择年龄' }] }]" :min="18" :max="80" />
        <span class="ant-form-text">
      </span>
      </a-form-item>


      <a-form-item  v-bind="formItemLayout" label="E-mail">
        <a-input
            v-decorator="[
          'email',
          {
            rules: [
              {
                type: 'email',
                message: '请输入正确的邮箱格式！',
              },
              {
                required: true,
                message: '请输入邮箱！',
              },
            ],
          },
        ]"
        />
      </a-form-item>
      <a-form-item  v-bind="formItemLayout" label="手机号">
        <a-input
            v-decorator="[
          'phone',
          {
            rules: [{ required: true, message: '请输入你的手机号' }],
          },
        ]"
            style="width: 100%"
        >
          <a-select
              slot="addonBefore"
              v-decorator="['prefix', { initialValue: '86' }]"
              style="width: 70px"
          >
            <a-select-option value="86">
              +86
            </a-select-option>
            <a-select-option value="87">
              +87
            </a-select-option>
          </a-select>
        </a-input>
      </a-form-item>


      <a-form-item
          :wrapper-col="{
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      }"
      >
        <a-button type="primary" html-type="submit">
          修改
        </a-button>
      </a-form-item>
    </a-form>
  </div>

</template>
<script>
export default {
  name: "Profile",
  data() {
    return {
      form: this.$form.createForm(this),
      formItemLayout: {
        labelCol: {
          xs: {span: 24},
          sm: {span: 8},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16},
        },
      },
      userId: '',

      userInfo: {
        loginName: "hello"
      }
    }
  },
  methods: {

    async getUserInfo() {
      try {
        const {data: res} = await this.$http.get(`/user/${this.userId}`);
        if (res.status !== 200) throw Error
        this.userInfo = res.data;
        this.form.setFieldsValue({
          sex: this.userInfo.sex,
          age: this.userInfo.age,
          email: this.userInfo.email,
          phone: this.userInfo.mobile

        })
        console.log(this.userInfo);
      } catch (e) {
        console.log(e)
      }


    },

    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFieldsAndScroll(async (err, values) => {
        console.log(values);
        if (!err) {
          try {
            const {data:res} = await this.$http.put(`/user/${this.userId}`, {
              email: values.email,
              mobile: values.phone,
              sex : values.sex,
              age: values.age
            });
            if (res.status!==200) throw Error
            this.$message.success("修改个人信息成功");
          } catch (e) {
            console.log(e)
          }

        }
      });
    },


    handleConfirmBlur(e) {
      const value = e.target.value;
      this.confirmDirty = this.confirmDirty || !!value;
    },
    compareToFirstPassword(rule, value, callback) {
      const form = this.form;
      if (value && value !== form.getFieldValue('password')) {
        callback('两次输入的密码不一致');
      } else {
        callback();
      }
    },
    validateToNextPassword(rule, value, callback) {
      const form = this.form;
      if (value && this.confirmDirty) {
        form.validateFields(['confirm'], {force: true});
      }
      callback();
    },
  },
  created() {
    this.userId = sessionStorage.getItem("USER_ID")
    this.getUserInfo();
  }
}
</script>

<style scoped>

</style>
