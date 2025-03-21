<template>
  <div class="component-box">
    <div class="tabs">
      <div
        @click="tabChange(2)"
        class="tabs-item"
        :class="{ active: activeTreeIndex === 2 }"
      >
        <i class="iconfont icon-suohuicaidan-"></i>
      </div>
      <div
        @click="tabChange(0)"
        class="tabs-item"
        :class="{ active: activeTreeIndex === 0 }"
      >
        <i class="iconfont icon-tree-table"></i>
      </div>
      <!-- <div
        @click="tabChange(1)"
        class="tabs-item"
        :class="{ active: activeTreeIndex === 1 }"
      >
        <i class="iconfont icon-zujian"></i>
      </div> -->
      <div
        @click="tabChange(3)"
        class="tabs-item"
        :class="{ active: activeTreeIndex === 3 }"
      >
        <i class="iconfont icon-changjing"></i>
      </div>
    </div>
    <div class="tabs-body" v-show="[0, 3].includes(activeTreeIndex)">
      <div class="tree" v-show="activeTreeIndex === 0">
        <!-- <el-scrollbar style="height:100%"> -->
        <el-tree
          :data="tree"
          node-key="id"
          :current-node-key="currentNodeKey"
          :highlight-current="true"
          default-expand-all
          draggable
          :allow-drop="allowDrop"
          @node-drop="handleDrop"
          @node-click="handleNodeClick"
          ref="componentTree"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }}</span>
            <div class="tree-tool" v-if="selectedNode.id && selectedNode.id === data.id">
              <span>
                <i
                  class="iconfont icon-delete1 icon-delete-comp"
                  @click="deleteComponent(data.id)"
                ></i>
              </span>
               <span class="icon-plus" v-if="data.label === 'column'">
                  <i
                    class="el-icon-circle-plus"
                    @click="addTableColumn(data.id, node)"
                  ></i>
                </span>
            </div>
      
          </span>
        </el-tree>
        <!-- </el-scrollbar> -->
      </div>
<!-- 
      <div v-show="activeTreeIndex === 1">
        <component
          v-if="componentIs"
          :list="componentList"
          :is="componentIs"
        ></component>
      </div> -->

      <div v-show="activeTreeIndex === 3">
        <div class="scene-list">
          <div class="scene-item" v-for="item in sceneList" :key="item.name">
            <div>
              <el-card>
                <div
                  :style="{ 'background-image': `url(${item.url})` }"
                  class="scene__preview"
                ></div>
              </el-card>
              <div class="scene-item__name">
                <span class="scene-item__title">{{ item.name }}</span>
              </div>
            </div>
            <div class="scene__operate">
              <div style="margin-bottom: 4px;">
                <el-button
                  type="primary"
                  style="margin-right: 10px"
                  size="mini"
                  @click="useScene(item.id)"
                  >
                  <i class="iconfont icon-shiyongxuzhi" />
                  <span>使用</span></el-button
                >
                <el-popconfirm
                  title="确定删除吗？"
                  @onConfirm="deleteScene(item.id)"
                >
                  <el-button slot="reference" type="danger" size="mini"
                    ><i class="iconfont icon-delete1 icon-delete-tree" /><span>删除</span></el-button
                  >
                </el-popconfirm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { AppModule } from '@/store/modules/app';
import FormBox from './FormBox';
import TableBox from './TableBox';
import CustominlineBox from './CustominlineBox';
import ContainerBox from './ContainerBox';
import EmptyBox from './EmptyBox';
import socket from '@/util/socket.js';

@Component({
  components: {
    formBox: FormBox,
    tableBox: TableBox,
    custominlineBox: CustominlineBox,
    ContainerBox: ContainerBox,
    EmptyBox
  }
})
export default class CompBox extends Vue {
  private componentList = [];
  private componentMap = {};
  private activeIndex = 2;
  private tree = [];
  private selectedNode = {};
  private currentNodeKey = '';
  private sceneList = [];

  get componentIs() {
    if (AppModule.componentIs) {
      return AppModule.componentIs + 'Box';
    } else {
      return '';
    }
  }

  get activeTreeIndex() {
    return AppModule.activeTreeIndex;
  }

  @Watch('componentIs', { immediate: true })
  private onjsonDataChange() {
    const { type, params } = this.insertData.data;
    if (type !== 'custominline') {
      this.componentList = this.componentMap[type];
    } else {
      this.componentList = this.componentMap[params.compBox];
    }
  }

  @Watch('uuid', { immediate: true })
  private uuidChange() {
    const componentTree: any = this.$refs.componentTree;
    componentTree && componentTree.setCurrentKey(this.uuid);
    this.selectedNode = {
      id: this.uuid
    };
  }

  get insertData() {
    return AppModule.insertData;
  }
  get uuid() {
    return AppModule.uuid;
  }

  async created() {
    const { type, params } = this.insertData.data;
    const componentMap = await socket.emit('generator.data.getCompList');
    this.componentMap = componentMap;
    if (type !== 'custominline') {
      this.componentList = componentMap[type];
    } else {
      this.componentList = componentMap[params.compBox];
    }

    this.getScene();
  }

  async getScene() {
    const res = await socket.emit('generator.scene.getScene');
    this.sceneList = res.list;
  }

  private async getSceneTree() {
    const tree = await socket.emit('generator.scene.getSceneTree');
    this.tree = [tree];
  }

  private tabChange(index) {
    AppModule.setActiveTreeIndex(index);
    this.getSceneTree();
    this.getScene();
  }

  private handleNodeClick(node) {
    const viewContent: any = document.querySelector('#viewContent');
    viewContent.contentWindow.postMessage(
      {
        handler: 'view.component.selected',
        uuid: node.id
      },
      '*'
    );
    this.selectedNode = node;
    AppModule.setUuid(node.id);
  }

  private async deleteComponent(id) {
    await socket.emit('generator.scene.deleteComponent', {
      id
    });
    this.getSceneTree();
  }

  allowDrop(draggingNode, dropNode, type) {
    if (draggingNode.parent.key === dropNode.parent.key && type !== 'inner') {
      return true;
    } else {
      return false;
    }
  }

  async useScene(id) {
    const res = await socket.emit('generator.toolbar.useScene', {
      id
    });
  }

  async deleteScene(id) {
    const res = await socket.emit('generator.toolbar.deleteScene', {
      id
    });
    this.getScene();
  }

  async addTableColumn(id, selectedNode) {
    let node = selectedNode.parent;
    while (node && !(node.label == 'box' || node.label == 'page')) {
      node = node.parent;
    }
    const params = {
      boxUuid: node.key,
      data: {
        id: id,
        type: 'column'
      }
    };

    await socket.emit('generator.scene.addComponent', params);
    this.getSceneTree();
  }

  async handleDrop(dragNode, dropNode) {
    const { childNodes } = dropNode.parent;
    const order = childNodes.reduce((total, item) => {
      total.push(item.key);
      return total;
    }, []);
    let node = dropNode.parent;
    while (node && !(node.label == 'box' || node.label == 'page')) {
      node = node.parent;
    }
    const res = await socket.emit('generator.scene.changePosition', {
      uuid: node.key,
      label: node.label,
      order
    });
    if (res && res.status === 1) {
      this.$message.error(res.message);
    }
  }
}
</script>
<style lang="scss" scoped>
.component-box {
  display: flex;
  flex-direction: row;
  height: 100%;
}
.tabs {
  margin-right: 5px;
  flex-shrink: 0;
  color: #909399;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  padding-top: 20px;
}
.tabs-item {
  padding: 10px;
  .iconfont {
    font-size: 20px;
  }
}
.active.tabs-item {
  background-color: #f0f9eb;
}
.active .iconfont {
  color: #409EFF;
}
.tabs-body {
  height: 100%;
  overflow: scroll;
  width: 100%;
  width: 200px;
  border-right: 1px solid #dcdfe6;
}
.icon-add {
  color: #409eff;
  margin-left: 10px;
}
.icon-delete-comp {
  color: #f56c6c;
  margin-left: 10px;
  font-size: 16px !important;
}

.tree {
  overflow-y: auto;
  overflow-x: scroll;
  background-color: #ffffff;
}
.el-tree {
  min-width: 100%;
  font-size: 14px;
  display: inline-block !important;
}
.scene-list {
  padding: 5px;
}
.scene-item__name {
  position: absolute;
  bottom: 0;
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
  background-color: #00000095;
}
.scene-item {
  position: relative;
  text-align: center;
  margin-bottom: 10px;
}
.scene-item__title {
  color: #fff;
}
.scene__operate {
  opacity: 0;
  background: rgba(0, 0, 0, 0.65);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
.scene__operate:hover {
  opacity: 1;
}
.scene__preview {
  width: 200px;
  height: 120px;
  background-position: top center;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-color: #fff;
}
.iconfont{
  font-size: 12px;
  margin-right: 5px;
}
.icon-delete-tree{
  color: #fff;
}
.tree-tool{
  display: inline-block;
}
.icon-plus{
  padding: 0 6px;
  color: #909399;
}
</style>
