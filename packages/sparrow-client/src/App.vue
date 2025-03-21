<template>
  <div id="app">
    <el-container class="container">
      <el-header height="45px">
        <top-toolbar></top-toolbar>
      </el-header>

      <el-container style="height: calc(100% - 45px);">
        <div>
          <comp-box></comp-box>
        </div>
        <el-main>
          <div class="main">
            <div class="editor-box">
              <iframe
                id="viewContent"
                ref="viewContent"
                class="view-content"
                src="http://localhost:9000/"
              />
            </div>
          </div>
        </el-main>
        <div>
          <setting setting-data="settingData"></setting>
        </div>
      </el-container>
    </el-container>
    <div class="dashboard-box" v-if="showDashboard">
      <dashboard
        @on-selected="selectedHandler(data)"
        :tab-index="dashboardTabIndex"
      ></dashboard>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Logo from '@/components/logo.vue';
import Dashboard from '@/components/materiel/Dashboard.vue';
import socket from '@/util/socket.js';
import TopToolbar from '@/components/TopToolbar.vue';
import Loading from '@/util/loading';
import Setting from '@/components/setting/index.vue';
import { AppModule } from '@/store/modules/app';
import { SettingModule } from '@/store/modules/setting';
import CompBox from '@/components/materiel/CompBox/index.vue';
import JsonEditor from '@/components/JsonEditor/index.vue';
@Component({
  components: {
    Logo,
    Dashboard,
    TopToolbar,
    Setting,
    CompBox,
    JsonEditor,
  }
})
export default class App extends Vue {
  private dashboardTabIndex = '0';
  private settingData = null;
  private settingWidth = '80px';
  private formIndex = 0;

  get showDashboard() {
    return AppModule.showDashboard;
  }

  get showComponentBox() {
    return AppModule.showComponentBox;
  }

  get showSetting() {
    return SettingModule.showSetting;
  }

  get boxIndex() {
    return AppModule.boxIndex;
  }

  get boxUuid() {
    return AppModule.boxUuid;
  }

  async created() {
    await socket.emit('home.index.init');

    window.addEventListener('message', async event => {
      const { data } = event;
      if (!data.handler) return;
      console.log(data);
      const handlerArr = data.handler.split('.');
      const handlerFirst = handlerArr[0];
      if (handlerFirst === 'client') {

        // 触发区块集
        if (data.handler === 'client.dashboard.show') {
          AppModule.InsertData(data);
          AppModule.SetShowDashboard(true);
        }

        // 展示设置
        if (data.handler === 'client.setting.show') {
          const { box, setting } = data;
          SettingModule.setSettingData(setting.data);
          const handler = setting.data.handler;
          if (handler === 'form') {
            SettingModule.setSettingComponent({
              compName: 'FormSetting',
              forceRefresh: data.uuid && this.boxUuid !== data.uuid ? true : false
            });
          } else if (handler === 'table') {
            SettingModule.setSettingComponent({
              compName: 'TableSetting',
              forceRefresh: data.uuid && this.boxUuid !== data.uuid ? true : false
            });
          } else if (handler === 'tabs') {
            SettingModule.setSettingComponent({
              compName: 'TabsSetting',
              forceRefresh: data.uuid && this.boxUuid !== data.uuid ? true : false
            });
          } else if (handler === 'common') {
            SettingModule.setSettingComponent({
              compName: 'CommonSetting',
              forceRefresh: data.uuid && this.boxUuid !== data.uuid ? true : false
            });
          } 
        }

        // 触发组件集
        if (data.handler === 'client.component.show') {
          const { type } = data.data;
          AppModule.setBoxUuid(data.uuid);
          // AppModule.InsertData(data);
          AppModule.SetComponentIs(type);
          AppModule.SetShowComponent(true);
          AppModule.setActiveTreeIndex(1)
        }

        // 插入组件label
        if (data.handler === 'client.component.insertLabel') {
          const params = {
            boxIndex: this.boxIndex,
            boxUuid: this.boxUuid,
            data: {
              ...data.data.params,
              handler: 'addLabel'
            }
          };

          const result = await socket.emit('generator.scene.setting', params);
        }

        if (data.handler === 'client.component.insertFormComp') {
          console.log('***********', data);
         AppModule.InsertData(data);
        }

        if (data.handler === 'client.component.insertTableComp') {
          console.log('asdjasdas', data);
          AppModule.InsertData(data);
        }


        if (data.boxIndex !== undefined) {
          AppModule.SetDoxIndex(data.boxIndex);
        }
        // 延迟同步uuid
        setTimeout(() => {
          if (data.uuid !== undefined) {
            AppModule.setBoxUuid(data.uuid);
          }

        }, 200)

      }
    });

    // block 进度
    socket.on('generator.scene.block.status', data => {
      Loading.close();
    });

    socket.on('generator.force.refresh',data => {
      const viewContent:any = document.querySelector('#viewContent')
      setTimeout(() => {
        viewContent.contentWindow.location.reload(true)
      }, 1000)
    })
    

    this.settingData = {};
  }

  mounted() {
    const viewContent: any = this.$refs.viewContent;
    viewContent.addEventListener('click', e => {
      e.stopPropagation();
    });
  }

  private async selectedHandler(data) {}
}
</script>

<style lang="scss">
html,
body {
  height: 100%;
}
body {
  padding: 0;
  box-sizing: border-box;
  background: #fff;
}
#app {
  height: 100%;
}

.el-aside {
  background-color: #fafaff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 2px 0px;
}
.el-header {
  border-bottom: 1px solid #eaeefb;
}

#app .el-main {
  color: #333;
  text-align: center;
  padding-top: 0;
}
.container {
  height: 100%;
}
.main {
  text-align: left;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.editor-box {
  border-top: 1px solid #eee;
  flex: 1;
}
.dashboard-box {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 60vw;
  transform: translate(-50%, -50%);
}
.view-content {
  width: 100%;
  height: 100%;
  border: none;
}
.ali-icon {
  width: 1.125em;
  display: inline-block;
  font-size: inherit;
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
}
.is-drop-inner>.el-tree-node__content .custom-tree-node{
  background: #409EFF;
}
</style>
