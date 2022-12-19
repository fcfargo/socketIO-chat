const { Schema, default: mongoose } = require('mongoose');

const MachinesSchema = new Schema(
  {
    macA: String,
    freeMem: Number,
    totalMem: Number,
    memUseage: Number,
    osType: String,
    upTime: Number,
    cpuType: String,
    coreNum: Number,
    cpuSpeed: Number,
    cpuLoad: Number,
  },
  {
    timestamps: true,
  },
);

const Machines = mongoose.model('Machines', MachinesSchema);

module.exports = {
  Machines,
};
