<template>
  <div>
    <!--表格头部搜索区域-->
    <div>
      <a-button class="editable-add-btn" @click="handleAdd" style="margin-right: 10px">添加车辆</a-button>
      <a-input-search placeholder="搜索车辆" style="width: 200px" @search="onSearch" allowClear v-model="searchMsg"/>
    </div>

    <!--表格区域-->
    <div>
      <a-table :columns="columns" :data-source="carList" style="padding-top: 10px;" :pagination="false" :scroll="{ y: 350 }">
        <!--车辆名称，点击查看使用情况-->
        <a slot="name" slot-scope="scope" @click="showCarInfo(scope)">{{ scope.carName }}</a>

        <!--车辆图片-->
        <span slot="carPic" slot-scope="scope">
        <img :src="require(`D:/temp/upload/imag/${scope}`)" style="width: 100px" alt="">
      </span>

        <!--车辆状态-->
        <span slot="scope" slot-scope="scope">
          <a-switch checked-children="可用"
                    un-checked-children="不可用"
                    @change="checked => handleChange(checked, scope.carId)"
                    :default-checked="scope.isActive === true"
          />
        </span>

        <!--车辆描述-->
        <span slot="carDesc" slot-scope="descs">
      <a-tag
          v-for="desc in descs"
          :key="desc"
          color="geekblue"
      >
        {{ desc }}
      </a-tag>
      </span>


        <!--操作列-->
        <span slot="action" slot-scope="scope">
          <a @click="handleEdit(scope)">Edit</a>
          <a-divider type="vertical"/>

          <a-popconfirm
              v-if="carList.length"
              title="Sure to delete?"
              @confirm="() => onDelete(scope)"
          >
          <a>Delete</a>
        </a-popconfirm>

        </span>

      </a-table>
    </div>
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


    <!--添加车辆对话框-->
    <a-modal
        title="添加车辆"
        :visible="addCarVisible"
        :footer="false"
        @cancel="handleCancel"
    >

      <a-form v-bind="formItemLayout" :form="addCarForm" @submit="handleSubmit">

        <!--车辆名称-->
        <a-form-item label="车辆名称" v-bind="formItemLayout">
          <a-input v-decorator="['carName',{rules:[{required: true,message:'请输入车辆名称',whitespace: true}]}]"/>
        </a-form-item>


        <a-form-item label="车辆描述" v-bind="formItemLayout">
          <div>
            <template v-for="(tag, index) in tags">
              <a-tooltip v-if="tag.length > 20" :key="tag" :title="tag">
                <a-tag :key="tag" :closable="index !== -1" @close="() => handleClose(tag)">
                  {{ `${tag.slice(0, 20)}...` }}
                </a-tag>
              </a-tooltip>
              <a-tag v-else :key="tag" :closable="index !== -1" @close="() => handleClose(tag)" color="blue">
                {{ tag }}
              </a-tag>
            </template>
            <a-input
                v-if="inputVisible"
                ref="input"
                type="text"
                size="small"
                :style="{ width: '78px' }"
                :value="inputValue"
                @change="handleInputChange"
                @blur="handleInputConfirm"
                @keyup.enter="handleInputConfirm"
            />
            <a-tag v-else style="background: #fff; borderStyle: dashed;" @click="showInput">
              <a-icon type="plus"/>
              添加描述
            </a-tag>
          </div>
        </a-form-item>


        <a-form-item label="Upload">
          <a-upload
              :defaultFileList="fileList"
              name="picture"
              action="/api/upload"
              list-type="picture"
              @change="handleUploadChange"
          >
            <a-button>
              <a-icon type="upload"/>
              上传车辆图片
            </a-button>
          </a-upload>
          <a-input v-show="false"
                   v-decorator="['carImage',{rules: [{ required: true, message: '请上传车辆图片', whitespace: true}]}]"></a-input>
        </a-form-item>


        <!--按钮-->
        <a-form-item
            :wrapper-col="{
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      }"
        >
          <a-button @click="handleCancel" style="margin-right: 10px">
            取消
          </a-button>
          <a-button type="primary" html-type="submit" :loading="submitLoading">
            提交
          </a-button>
        </a-form-item>
      </a-form>


    </a-modal>


    <!--编辑车辆对话框-->
    <a-modal
        title="编辑车辆"
        :visible="editCarVisible"
        :footer="false"
        @cancel="handleEditCancel"
    >

      <a-form v-bind="formItemLayout" :form="editCarForm" @submit="handleEditSubmit">

        <!--车辆名称-->
        <a-form-item v-bind="formItemLayout">
          <a-input v-show="false" v-decorator="['editCarId']"/>
        </a-form-item>

        <!--车辆名称-->
        <a-form-item label="车辆名称" v-bind="formItemLayout">
          <a-input v-decorator="['editCarName',{rules:[{required: true,message:'请输入车辆名称',whitespace: true}]}]"/>
        </a-form-item>


        <a-form-item label="车辆描述" v-bind="formItemLayout">
          <div>
            <template v-for="(tag, index) in tags">
              <a-tooltip v-if="tag.length > 20" :key="tag" :title="tag">
                <a-tag :key="tag" :closable="index !== -1" @close="() => handleClose(tag)">
                  {{ `${tag.slice(0, 20)}...` }}
                </a-tag>
              </a-tooltip>
              <a-tag v-else :key="tag" :closable="index !== -1" @close="() => handleClose(tag)" color="blue">
                {{ tag }}
              </a-tag>
            </template>
            <a-input
                v-if="inputVisible"
                ref="input"
                type="text"
                size="small"
                :style="{ width: '78px' }"
                :value="inputValue"
                @change="handleInputChange"
                @blur="handleInputConfirm"
                @keyup.enter="handleInputConfirm"
            />
            <a-tag v-else style="background: #fff; borderStyle: dashed;" @click="showInput">
              <a-icon type="plus"/>
              添加描述
            </a-tag>
          </div>
        </a-form-item>


        <a-form-item label="Upload">
          <a-upload
              :defaultFileList="fileList"
              name="picture"
              action="/upload"
              list-type="picture"
              @change="handleUploadChange"
          >
            <a-button>
              <a-icon type="upload"/>
              上传车辆图片
            </a-button>
          </a-upload>
          <a-input v-show="false" v-decorator="['carImage']"></a-input>
        </a-form-item>


        <!--按钮-->
        <a-form-item
            :wrapper-col="{
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 8 },
      }"
        >
          <a-button @click="handleEditCancel" style="margin-right: 10px">
            取消
          </a-button>
          <a-button type="primary" html-type="submit" :loading="submitLoading">
            提交
          </a-button>
        </a-form-item>
      </a-form>


    </a-modal>

    <drawer ref="drawer" :title="title" resource="car" :resource-id="carId" v-if="carId"></drawer>
  </div>
</template>

<script>
const columns = [
  {
    title: '#',
    dataIndex: 'index',
    key: 'index',
    align: 'center',
    width: 50,
    customRender: (text, record, index) => `${index + 1}`,
  },
  {
    title: '车辆名称',
    key: 'carName',
    scopedSlots: {customRender: 'name'},
    width: 200,
  },
  {
    title: '车辆图片',
    dataIndex: 'carPic',
    key: 'carPic',
    scopedSlots: {customRender: 'carPic'},
  },
  {
    title: '车辆状态',
    key: "isActive",
    scopedSlots: {customRender: 'scope'}
  },
  {
    title: '车辆描述',
    key: 'carDesc',
    dataIndex: 'carDesc',
    scopedSlots: {customRender: 'carDesc'},
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  },

];

const carList = [];
import Drawer from "@/views/common/Drawer";
export default {
  components:{Drawer},
  name: "Car",
  data() {
    return {
      //抽屉参数
      carId: '',
      title: '',


      carList,
      columns,
      searchMsg: '',

      pagination: {
        pageSize: 7,
        current: 1,
        total: 0,
      },
      submitLoading: false,
      addCarVisible: false,

      addCarForm: this.$form.createForm(this),
      editCarForm: this.$form.createForm(this),

      //添加车辆表单布局
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
      inputVisible: false,
      inputValue: '',

      //车辆描述标签
      tags: [],
      fileList: [],

      editCarVisible: false
    }
  },
  methods: {

    showCarInfo(scope) {
      this.carId = scope.carId;
      console.log(this.carId);
      this.title = '车辆使用情况';
      this.$refs.drawer.showDrawer();
    },

    handleEditCancel() {
      this.editCarVisible = false;
      this.tags = [];
      this.editCarForm.resetFields();
    },

    //车辆编辑事件表单提交
    handleEditSubmit(e) {
      e.preventDefault();
      this.editCarForm.validateFields(async (err, fieldsValue) => {
        if (err) {
          return;
        }
        this.submitLoading = true;
        const values = {
          carName: fieldsValue['editCarName'],
          carPic: fieldsValue['carImage'],
          carDesc: this.tags
        }
        try {
          const {data: res} = await this.$http.put(`/car/${fieldsValue['editCarId']}`, values);
          if (res.status !== 200) throw Error
          this.$message.success("更新车辆信息成功");
          await this.getCarList();
          this.submitLoading = false;
          this.editCarVisible = false;
        } catch (e) {
          this.submitLoading = false;
          console.log(e);
        }


      })

    },

    //车辆编辑操作
    handleEdit(scope) {
      this.editCarVisible = true;
      console.log(scope);
      setTimeout(() => {
        this.editCarForm.setFieldsValue({"editCarName": scope.carName});
        this.editCarForm.setFieldsValue({"editCarId": scope.carId});
        this.editCarForm.setFieldsValue({"editCarImage": scope.carPic});
      }, 100);
      this.tags = scope.carDesc;
    },

    //车辆删除操作
    async onDelete(scope) {
      try {
        const {data: res} = await this.$http.delete(`/car/${scope.carId}`);
        if (res.status !== 200) throw Error
        this.$message.success("删除车辆操作成功");
        await this.getCarList();
      } catch (e) {
        console.log(e);
      }

    },

    //处理移除车辆描述标签事件
    handleClose(removedTag) {
      const tags = this.tags.filter(tag => tag !== removedTag);
      this.tags = tags;
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(function () {
        this.$refs.input.focus();
      });
    },
    handleInputChange(e) {
      this.inputValue = e.target.value;
    },
    handleInputConfirm() {
      const inputValue = this.inputValue;
      let tags = this.tags;
      if (inputValue && tags.indexOf(inputValue) === -1) {
        tags = [...tags, inputValue];
      }
      Object.assign(this, {
        tags,
        inputVisible: false,
        inputValue: '',
      });
    },


    //车辆添加操作
    handleAdd() {
      this.addCarVisible = true;
    },

    //添加车辆对话框取消事件
    handleCancel() {
      this.addCarForm.resetFields();
      this.addCarVisible = false;
      this.fileList = [];
      this.tags = []
    },

    //文件上传状态改变
    async handleUploadChange(e) {
      console.log(e);
      if (e.file.status === "done") {
        this.fileList = e.fileList;
        this.addCarForm.setFieldsValue({"carImage": e.file.response.data})
        console.log("上传文件", this.addCarForm.getFieldValue('carImage'));

      } else if (e.file.status === "removed") {
        const {data: res} = await this.$http.delete(`/img/${this.addCarForm.getFieldValue('carImage')}`);
        if (res.status === 200) console.log("移除文件成功，文件名: ", this.addCarForm.getFieldValue('carImage'));
      }
    },

    //添加车辆表单提交事件
    handleSubmit(e) {
      e.preventDefault();
      this.addCarForm.validateFields(async (err, fieldsValue) => {
        if (err) {
          return;
        }
        this.submitLoading = true;
        const values = {
          carName: fieldsValue['carName'],
          carPic: fieldsValue['carImage'],
          carDesc: this.tags
        }
        try {
          const {data: res} = await this.$http.post(`/addcar`, values)
          if (res.status !== 200) throw Error

          setTimeout(() => {
            this.addCarVisible = false
            this.submitLoading = false;
            this.$message.success("添加车辆成功");
            this.addCarForm.resetFields();
            this.tags = []
            this.fileList = []
            this.getCarList();
          }, 500);

        } catch (e) {
          this.submitLoading = false;
          return this.$message.warning("服务器繁忙，请稍后再试");
        }
      })
    },


    //获取车辆列表
    async getCarList() {
      try {
        const {data: res} = await this.$http.get(`/carList?pageNum=${this.pagination.current}&pageSize=${this.pagination.pageSize}`);
        if (res.status !== 200) throw Error
        this.pagination.total = res.total
        const data = res.data;
        for (let i = 0; i < data.length; i++) {
          if (data[i].carDesc) {
            data[i].carDesc = data[i].carDesc.split(",");
          }
        }
        this.carList = data;
      } catch (e) {
        console.log(e);
      }
    },

    //车辆搜索
    async onSearch() {
      try {
        const {data: res} = await this.$http.get('/api/searchCar', {
          params: {
            search: this.searchMsg,
            pageNum: this.pagination.current,
            pageSize: this.pagination.pageSize
          }
        });
        if (res.status !== 200) throw Error;

        if (res.data) {
          const data = res.data;
          this.pagination.total = res.total
          for (let i = 0; i < data.length; i++) {
            if (data[i].carDesc) {
              data[i].carDesc = data[i].carDesc.split(",");
            }
          }
         return  this.carList = data;
        }
        this.$message.warning("暂无查询车辆")
      } catch (e) {
        this.$message.warning("服务器异常,请稍后重试");
      }

    },

    //分页数据改变
    pageNumChange(page, pageSize) {
      this.pagination.current = page;
      this.pagination.pageSize = pageSize;
      this.getCarList();
    },

    //更新车辆状态
    async handleChange(checked, carId) {
      const {data: res} = await this.$http.put(`/car/${carId}/${checked}`);
      if (res.status !== 200) throw Error;
      await this.getCarList();
      this.$message.success("更新车辆状态成功");
    }
  },

  created() {
    this.getCarList();
  }
}
</script>

<style scoped>
</style>
