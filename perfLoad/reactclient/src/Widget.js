import React, { Component } from 'react';
import Cpu from './Cpu';
import Mem from './Mem';
import Info from './Info';

class Widget extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const { freeMem, totalMem, usedMem, memUseage, osType, upTime, cpuType, coreNum, cpuSpeed, cpuLoad } = this.props.data;
    const cpu = { cpuLoad };
    const mem = { freeMem, totalMem, usedMem, memUseage };
    const info = { osType, upTime, cpuType, coreNum, cpuSpeed };
    return (
      <div>
        <h1>Widget!!</h1>
        <p>{cpuLoad}</p>
        <Cpu cpuData={cpu} />
        <Mem memData={mem} />
        <Info infoData={info} />
      </div>
    );
  }
}

export default Widget;
