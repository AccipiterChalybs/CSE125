const PlayerTable = {
  currentPlayer: 0,
  requestId: -1,
  players: [],
  hate: [],
  addPlayer: function (gameObject) {
    PlayerTable.players.push(gameObject);
    PlayerTable.hate.push(0);
  },

  getPlayer: function () {
    return PlayerTable.players[PlayerTable.currentPlayer];
  },

  getPlayerID: function(playerObj){
    for(let i = 0; i < PlayerTable.players.length; ++i){
      if(PlayerTable.players[i] === playerObj) {
        return i;
      }
    }

    return -1;
  },

  increaseHate : function(playerID, amt){
    PlayerTable.hate[playerID] += amt;
  },

  resetHate : function(){
    for(let i = 0; i < PlayerTable.hate.length; ++i){
      PlayerTable.hate[i] = 0;
    }
  }
};
