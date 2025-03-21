import * as fsExtra from 'fs-extra';
import VueParse from '../../../generator/VueParse';
import * as path from 'path';
import Base from '../Base';
import Config from '../../../../config';

export default class CreateButton extends Base{
  name: string = 'CreateButton';
  params: any;
  vueParse: any;
  uuid: string;
  constructor () {
    super()
    this.init();
  }
  
  private init () {
    const fileStr = fsExtra.readFileSync(path.join(Config.templatePath, 'component/BasicTable/CreateButton', 'comp.vue'), 'utf8');
    this.vueParse = new VueParse(this.uuid, fileStr);
  }

  public fragment () {    
    return `
      <router-link :to="'/example/create'" style="margin-right: 10px;">
        <el-button type="primary">
          创建
        </el-button>
      </router-link>
    `;
  }
}