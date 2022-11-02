class Namespace {
  constructor(id, nsTitle, img, endpoint) {
    this.id = id;
    this.img = img;
    this.nsTitle = nsTitle;
    this.endpoint = endpoint;
    this.room = [];
  }

  addRoom(roomObj) {
    this.room.push(roomObj);
  }
}

module.exports = Namespace;
