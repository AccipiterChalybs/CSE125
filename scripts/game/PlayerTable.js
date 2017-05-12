const PlayerTable = {
  currentPlayer: 0,
  players: [],
  addPlayer: function (gameObject) {
    PlayerTable.players.push(gameObject);
  },

  getPlayer: function () {
    return PlayerTable.players[PlayerTable.currentPlayer];
  },

  serialize: function () {
    let data = {};
    for (let i = 0; i < PlayerTable.players.length; i++) {
      data[i] = {};
      let pController = PlayerTable.players[i].getComponent('PlayerController');
      data[i].a = pController.action;
      data[i].s = pController.singing;
      data[i].st = pController._nextSingTime;
      data[i].i = pController.injured;
      data[i].k = pController.keys;
    }

    return data;
  },

  applySerialize: function (data) {
    for (let i = 0; i < PlayerTable.players.length; i++) {
      let pController = PlayerTable.players[i].getComponent('PlayerController');
      // Debug.log(pController);
      pController.action = data[i].a;
      pController.singing = data[i].s;
      pController.injured = data[i].i;
      pController.keys = data[i].k;
      pController._nextSingTime = data[i].st;
    }
  },
};
