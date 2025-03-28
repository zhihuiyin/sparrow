<template>
  <div class="setting">
    <div class="tabs-body">
      <div class="setting-comp" v-if="settingComponent">
        <component 
          v-bind:is="settingComponent"
          :config="config"
          :uuid="uuid"
        ></component>
      </div>
      <div v-else class="no-data">暂无配置</div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { SettingModule } from '@/store/modules/setting';
import { AppModule } from '@/store/modules/app';
import FormSetting from './FormSetting.vue';
import TableSetting from './TableSetting.vue';
import TabsSetting from './TabsSetting.vue';
import CommonSetting from './CommonSetting.vue'
import socket from '@/util/socket.js';
import Toolbox from './Toolbox';

@Component({
  name: 'Setting',
  components: {
    FormSetting,
    TableSetting,
    TabsSetting,
    CommonSetting,
    Toolbox
  }
})
export default class extends Vue {
  private config = null;
  private uuid = '';
  private innerDrawer = false;
  private dataCode = `var data = {}`
  private activeTreeIndex = 0;

  get showSetting() {
    return SettingModule.showSetting;
  }

  get showCodeDraw() {
    return SettingModule.showCodeDraw;
  }

  set showCodeDraw (value) {
    SettingModule.setShowCodeBraw(value);
  }
  
  private async created() {
    window.addEventListener('message', async event => {
      const { data } = event;
      if (!data.handler) return;
      if(data.handler === 'client.component.getConfig') {
        const {params} = data.data;
        this.uuid = params.uuid;
        const res = await socket.emit('generator.scene.getBoxChildConfig', {
          boxUuid: AppModule.boxUuid,
          uuid: params.uuid
        });
        this.config = res;
        AppModule.setUuid(this.uuid);
      }
    });
    this.$root.$on('setting-before-destroy', () => {
      this.config = null;
    });
  }

  get settingComponent() {
    return SettingModule.settingComponent;
  }

  private showSettingHandler() {
    SettingModule.setShowSettingHandler(!SettingModule.showSetting);
  }

}
</script>
<style lang="scss">
.setting {
  background: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  height: 100%;
  overflow: hidden;
   &__title {
    padding: 5px 0;
    margin: 0 5px;
    border-bottom: 1px solid #409eff;
    color: #409eff;
    font-size: 16px;
  }
}
.update-data {
  margin-left: 10px;
  color: #409eff;
  :hover {
    color: #66b1ff;
  }
}
.setting-comp{
  width: 200px;
}
.no-data{
  padding: 10px;
  color: #909399;
}

.tabs {
  margin-right: 5px;
  flex-shrink: 0;
  color: #909399;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
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
.tabs-body{
  flex: 1;
  width: 200px;
}
</style>
