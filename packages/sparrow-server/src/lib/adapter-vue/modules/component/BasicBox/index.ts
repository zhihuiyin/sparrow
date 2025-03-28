const uuid = require('@lukeed/uuid');
import * as cheerio from 'cheerio';

export default class BasicBox{
  public uuid = '';
  $fragment = null;
  public components = [];
  name: string = 'BasicBox';
  type: string  = 'box';
  unique: string | number = '';
  constructor (name: string, unique: string | number) {
    this.name = name;
    this.unique = unique;
    this.uuid = uuid().split('-')[0];
  }
  

  public renderFragment (type: number) {
    let LogicBox = `
      <div style="margin-top: 20px;">
        <logic-box  
          :uuid="'${this.uuid}'"
          :label="'${this.name}'"
        ></logic-box>
      </div>
    `;
    if (type === 1) {
      LogicBox = `
      <div style="margin-top: 20px;">
        <div class="comp-box"></div>
      </div>
      `
    }

    this.$fragment = cheerio.load(LogicBox, {
      xmlMode: true,
      decodeEntities: false,
    });

  }

  public setConfig (config: any) {};


  
  public getFragment (type: number) {
    this.renderFragment(type);
    this.renderBox(type);
    return this.$fragment;
  }

  private renderBox (type) {
    this.components.forEach((component, index) => {
      if (type === 0) {
        this.$fragment('logic-box').append(
          `<component-box indexcomp="${index}" uuid="${component.uuid}">
            ${component.getFragment(type).html()}
          </component-box>`
        );
      } else {
        this.$fragment('.comp-box').append(component.getFragment(type).html());
      }
    });
  }

  public getConfig() {
    return null
  }

}