const PlayerTable = {
  currentPlayer: 0,
  players: [],
  addPlayer: function (gameObject) {
    PlayerTable.players.push(gameObject);
  },

  getPlayer: function () {
    return PlayerTable.players[PlayerTable.currentPlayer];
  },


};
