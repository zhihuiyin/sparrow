<template>
  <div class="comp-box">
    <div class="comp-nav">
      <div class="comp">
        <div class="comp__title">容器</div>
        <div class="comp-content__list">
          <div
            class="comp-content__item"
            v-for="(item, index) in list.list"
            :key="index"
          >
            <el-popover
              v-if="item.id === 'Form'"
              placement="right"
              trigger="hover"
              width="170"
            >
              <div class="box-form">
                <el-input
                  class="box-form-input"
                  v-model="form.blockName"
                  size="mini"
                  placeholder="名称"
                ></el-input>
                <el-button
                  size="mini"
                  type="primary"
                  round
                  @click="sureHandler(item)"
                  >确定</el-button
                >
              </div>
              <span class="comp-content__label" slot="reference">{{
                item.label
              }}</span>
            </el-popover>

            <el-popover
              v-if="item.id === 'Table'"
              placement="bottom"
              trigger="hover"
              width="230"
            >
              <div class="box-form">
                <el-input
                  class="box-form-input"
                  v-model="form.blockName"
                  size="mini"
                  placeholder="名称"
                ></el-input>
                <el-input
                  class="box-layout-input"
                  v-model="form.col"
                  size="mini"
                  placeholder="col"
                ></el-input>
                <el-button
                  size="mini"
                  type="primary"
                  round
                  @click="sureHandler(item)"
                  >确定</el-button
                >
              </div>
              <span class="comp-content__label" slot="reference">{{
                item.label
              }}</span>
            </el-popover>

            <span
              class="comp-content__label"
              @click="compClick(item, $event)"
              v-if="!['Form', 'Layout', 'Table'].includes(item.id)"
              >{{ item.label }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import socket from '@/util/socket.js';
import { AppModule } from '@/store/modules/app';
import Loading from '@/util/loading';

@Component({})
export default class CompBox extends Vue {
  @Prop({ default: () => [] }) private list: any;
  private compDialogPosition = '';
  private isActiveComp = null;
  private form = {
    blockName: '',
    col: ''
  };

  get insertData() {
    return AppModule.insertData;
  }
  get insertPosition() {
    return AppModule.insertPosition;
  }

  get boxUuid() {
    return AppModule.boxUuid;
  }

  private compClick(comp, event) {
    this.isActiveComp = comp;
    const params = {
      boxUuid: this.boxUuid,
      data: {
        key: this.isActiveComp.key,
        id: this.isActiveComp.id
      },
      params: {
        ...this.isActiveComp.params
      }
    };
    this.addComponent(params);
  }

  private async sureHandler(comp) {
    this.isActiveComp = comp;

    const params = {
      boxUuid: this.boxUuid,
      data: {
        key: this.isActiveComp.key,
        id: this.isActiveComp.id,
        params: {
          ...this.form,
          ...this.isActiveComp.params
        }
      }
    };

    this.addComponent(params);
  }

  private async addComponent(params) {
    Loading.open();
    await socket.emit('generator.scene.addBox', params);
    Loading.close();
  }
}
</script>
<style lang="scss" scoped>
.comp {
  &__title {
    padding: 5px 0;
    margin: 0 5px;
    border-bottom: 1px solid #409eff;
    color: #409eff;
    font-size: 16px;
  }

  &-content__title {
    border-bottom: 1px solid #dcdfe6;
    padding: 5px 0;
    margin: 0 10px;
    color: #303133;
    font-size: 14px;
    font-weight: normal;
  }

  &-content__list {
    padding-left: 5px;
  }

  &-content__item {
    background: #ecf5ff;
    margin-top: 10px;
    margin-right: 10px;
    text-align: center;
    font-size: 12px;
    color: #606266;
    cursor: pointer;
  }
  &-content__item:hover {
    color: #409eff;
  }
  &-content__label {
    display: block;
    width: 100%;
    height: 100%;
    padding: 10px 0;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,.1);
    border-radius: 3px;
  }
}

.comp-box {
  background: #ffffff;
  padding-top: 10px;
  padding-bottom: 80px;
}

.comp-category {
  &__header {
    padding: 5px 0;
    margin: 0 5px;
    border-bottom: 1px solid #409eff;
    color: #409eff;
    font-size: 16px;
  }
  &__item {
    padding: 6px 10px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
  }
  .isActive {
    color: #409eff;
  }
}

.dialog {
  position: fixed;
  top: 10px;
  left: 120px;
  background: #ffffff;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
}
.add-component__operate {
  display: flex;
  justify-content: center;
  align-items: center;
}
.box-layout-input {
  width: 40px;
  margin-right: 10px;
}
.box-form-input {
  width: 100px;
  margin-right: 10px;
}
</style>
