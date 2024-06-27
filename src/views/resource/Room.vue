<template>
  <div>
    <div style="margin-bottom: 10px">
      <a-button class="editable-add-btn" @click="handleAdd" style="margin-right: 10px">添加会议室</a-button>
      <a-input-search placeholder="搜索房间" style="width: 200px" @search="onSearch" allowClear v-model="searchMsg"/>
    </div>

    <!--room table area-->
    <a-table :columns="columns" :data-source="roomList" style="margin-top: 10px" :pagination="false"  :scroll="{ y: 350 }">

      <!--会议室名称，点击打开详细信息-->
      <a slot="name" slot-scope="scope" @click="showRoomInfo(scope)">{{ scope.roomName }}</a>

      <!--会议室图片-->
      <span slot="roomPic" slot-scope="src">
        <img :src="require(`D:/temp/upload/imag/${src}`)" style="width: 100px">
      </span>

      <!--会议室状态-->
      <span slot="scope" slot-scope="scope">
          <a-switch checked-children="可用"
                    un-checked-children="不可用"
                    @change="checked=>handleChange(checked,scope)"
                    :default-checked="scope.isActive===true"
          />
       </span>

      <!--会议室描述-->
      <span slot="roomDesc" slot-scope="descs">
      <a-tag
          v-for="desc in descs"
          :key="desc"
          color='geekblue'
      >
        {{ desc }}
      </a-tag>
      </span>


      <!--操作列-->
      <span slot="action" slot-scope="scope">
          <a @click="handleEdit(scope)">编辑</a>
          <a-divider type="vertical"/>

          <a-popconfirm
              v-if="roomList.length"
              title="确定删除该会议室?"
              @confirm="() => onDelete(scope)"
          >
          <a>删除</a>
        </a-popconfirm>

        </span>

    </a-table>
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


    <!--添加会议室对话框-->
    <a-modal
        title="添加会议室"
        :visible="addRoomVisible"
        :footer="false"
        @cancel="handleCancel"
    >

      <a-form v-bind="formItemLayout" :form="addRoomForm" @submit="handleSubmit">

        <!--会议室名称-->
        <a-form-item label="会议室名称" v-bind="formItemLayout">
          <a-input v-decorator="['roomName',{rules:[{required: true,message:'请输入会议室名称',whitespace: true}]}]"/>
        </a-form-item>


        <a-form-item label="会议室描述" v-bind="formItemLayout">
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
              @change="handleUploadChange">
            <a-button>
              <a-icon type="upload"/>
              上传会议室图片
            </a-button>
          </a-upload>
          <a-input v-show="false"
                   v-decorator="['roomImage',{rules: [{ required: true, message: '请上传会议室图片', whitespace: true}]}]"></a-input>
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


    <!--编辑会议室对话框-->
    <a-modal
        title="编辑会议室"
        :visible="editRoomVisible"
        :footer="false"
        @cancel="handleEditCancel"
    >

      <a-form v-bind="formItemLayout" :form="editRoomForm" @submit="handleEditSubmit">

        <!--会议室ID-->
        <a-form-item v-bind="formItemLayout">
          <a-input v-show="false" v-decorator="['roomId']"/>
        </a-form-item>

        <!--会议室名称-->
        <a-form-item label="会议室名称" v-bind="formItemLayout">
          <a-input v-decorator="['roomName',{rules:[{required: true,message:'请输入会议室名称',whitespace: true}]}]"/>
        </a-form-item>


        <a-form-item label="会议室描述" v-bind="formItemLayout">
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
              @change="handleUploadChanges"
          >
            <a-button>
              <a-icon type="upload"/>
              上传会议室图片
            </a-button>
          </a-upload>
          <a-input v-show="false"
                   v-decorator="['editRoomImage',{rules: [{ required: true, message: '请上传会议室图片', whitespace: true}]}]"></a-input>
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

    <drawer title="会议室使用情况" :resource-id="roomId" resource="room" ref="drawer"></drawer>
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
    title: '房间名称',
    key: 'roomName',
    scopedSlots: {customRender: 'name'},
    width: 100,

  },
  {
    title: '房间图片',
    dataIndex: 'roomPic',
    key: 'roomPic',
    scopedSlots: {customRender: 'roomPic'},
  },
  {
    title: '房间状态',
    key: "isActive",
    scopedSlots: {customRender: 'scope'}
  },
  {
    title: '房间描述',
    key: 'roomDesc',
    dataIndex: 'roomDesc',
    scopedSlots: {customRender: 'roomDesc'},
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: {customRender: 'action'},
  },

];
const roomList = []
import Drawer from "@/views/common/Drawer";

export default {
  components: {Drawer},
  name: "Room",
  data() {
    return {

      roomId: '',
      columns,
      roomList,
      searchMsg: '',

      pagination: {
        total: 0,
        current: 1,
        pageSize: 7,
      },

      addRoomVisible: false,

      submitLoading: false,

      addRoomForm: this.$form.createForm(this),
      editRoomForm: this.$form.createForm(this),


      inputVisible: false,
      inputValue: '',
      tags: [],

      fileList: [],

      editRoomVisible: false,

      //添加会议室表单布局
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
    }
  },
  methods: {

    showRoomInfo(scope) {
      this.roomId = scope.roomId;
      this.$refs.drawer.showDrawer()
    },


    //会议室编辑事件表单提交
    handleEditSubmit(e) {
      e.preventDefault();
      this.editRoomForm.validateFields(async (err, fieldsValue) => {
        if (err) {
          return;
        }
        this.submitLoading = true;
        const values = {
          roomName: fieldsValue['editRoomName'],
          roomPic: fieldsValue['editRoomImage'],
          roomDesc: this.tags
        }
        try {
          const {data: res} = await this.$http.put(`/room/${fieldsValue['roomId']}`, values);
          if (res.status !== 200) throw Error
          this.$message.success("更新会议室信息成功");
          this.submitLoading = false;
          this.editRoomVisible = false;
          //更新列表
          await this.getRoomList();
          //重置表单
          this.editRoomForm.resetFields();
        } catch (e) {
          this.submitLoading = false;
          console.log(e);
        }


      })

    },

    //编辑会议室对话框关闭事件
    handleEditCancel() {
      this.editRoomVisible = false;
      this.tags = [];
      this.editRoomForm.resetFields();
    },

    async handleUploadChanges(e) {
      console.log(e);
      if (e.file.status === "done") {
        this.fileList = e.fileList;
        this.editRoomForm.setFieldsValue({"editRoomImage": e.file.response.data})
        console.log("上传文件", this.editRoomForm.getFieldValue('editRoomImage'));

      } else if (e.file.status === "removed") {
        const {data: res} = await this.$http.delete(`/img/${this.editRoomForm.getFieldValue('editRoomImage')}`);
        if (res.status === 200) console.log("移除文件成功，文件名: ", this.editRoomForm.getFieldValue('editRoomImage'));
      }
    },
    //文件上传状态改变
    async handleUploadChange(e) {
      console.log(e);
      if (e.file.status === "done") {
        this.fileList = e.fileList;
        this.addRoomForm.setFieldsValue({"roomImage": e.file.response.data})
        console.log("上传文件", this.addRoomForm.getFieldValue('roomImage'));

      } else if (e.file.status === "removed") {
        const {data: res} = await this.$http.delete(`/img/${this.addRoomForm.getFieldValue('roomImage')}`);
        if (res.status === 200) console.log("移除文件成功，文件名: ", this.addRoomForm.getFieldValue('roomImage'));
      }
    },


    //添加会议室表单提交事件
    handleSubmit(e) {
      e.preventDefault();
      this.addRoomForm.validateFields(async (err, fieldsValue) => {
        if (err) {
          return;
        }
        this.submitLoading = true;
        const values = {
          roomName: fieldsValue['roomName'],
          roomPic: fieldsValue['roomImage'],
          roomDesc: this.tags
        }
        try {
          const {data: res} = await this.$http.post(`/addrooms`, values)
          if (res.status !== 200) throw Error

          setTimeout(() => {
            this.addRoomVisible = false
            this.submitLoading = false;
            this.$message.success("添加会议室成功");
            this.addRoomForm.resetFields();
            this.tags = []
            this.fileList = []
            this.getRoomList();
          }, 500);

        } catch (e) {
          this.submitLoading = false;
          return this.$message.warning("服务器繁忙，请稍后再试");
        }
      })
    },

    //添加会议室对话框取消事件
    handleCancel() {
      this.addRoomForm.resetFields();
      this.addRoomVisible = false;
      this.fileList = [];
      this.tags = []
    },


    //处理会议室描述标签事件
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


    //房间编辑操作
    handleEdit(scope) {
      this.editRoomVisible = true;
      console.log(scope);
      setTimeout(() => {
        this.editRoomForm.setFieldsValue({"roomName": scope.roomName});
        this.editRoomForm.setFieldsValue({"roomId": scope.roomId});
        this.editRoomForm.setFieldsValue({"roomImage": scope.roomPic});
      }, 100);
      this.tags = scope.roomDesc;
    },


    //房间删除操作
    async onDelete(scope) {
      try {
        const {data: res} = await this.$http.delete(`/room/${scope.roomId}`);
        if (res.status !== 200) throw Error
        this.$message.success("删除会议室操作成功");
        await this.getRoomList();
      } catch (e) {
        console.log(e);
      }
    },

    //更新房间状态
    async handleChange(checked, scope) {
      console.log(scope);
      const {data: res} = await this.$http.put(`/room/${scope.roomId}/${checked}`);
      if (res.status !== 200) throw Error;
      await this.getRoomList();
      this.$message.success("更新会议室状态成功");
    },

    //会议室搜索
    async onSearch() {
      try {
        const {data: res} = await this.$http.get('/searchRoom', {
          params: {
            search: this.searchMsg,
            pageNum: this.pagination.current,
            pageSize: this.pagination.pageSize
          }
        });
        if (res.status !== 200) throw Error;
        this.pagination.total = res.total
        const data = res.data;
        for (let i = 0; i < data.length; i++) {
          if (data[i].roomDesc) {
            data[i].roomDesc = data[i].roomDesc.split(",");
          }
        }
        this.roomList = data;
      } catch (e) {
        this.$message.warning("服务器异常,请稍后重试");
      }

    },


    //获取房间列表
    async getRoomList() {
      const {data: res} = await this.$http.get(`/roomList`, {
        params: {
          pageNum: this.pagination.current,
          pageSize: this.pagination.pageSize
        }
      });
      if (res.status !== 200) return;
      this.pagination.total = res.total;
      const data = res.data;
      for (let i = 0; i < data.length; i++) {
        if (data[i].roomDesc) {
          data[i].roomDesc = data[i].roomDesc.split(",");
        }
      }
      this.roomList = data;
    },
    //监听页数改变
    pageNumChange(page, pageSize) {
      this.pagination.current = page;
      this.pagination.pageSize = pageSize;
      this.getRoomList();
    },


    //添加房间
    handleAdd() {
      this.addRoomVisible = true
      console.log(this.fileList);
    }
  },
  created() {
    this.getRoomList();
  }
}
</script>

<style scoped>

</style>
