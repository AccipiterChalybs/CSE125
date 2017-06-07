/**
 * Created by Stephen on 4/25/2017.
 */

const EVIL_MOVEMENTSPEED = 2;
const ATTACK_RANGE = 1.0;
const ATTACK_COOLDOWN = 3.0;
const LISTEN_RANGE = 3.0;
const TARGET_PLAYER_INITIAL_HATE = 50;

class EvilController extends AIController{
  constructor() {
    super();
    this.componentType = 'EvilController';
    this.movementSpeed = EVIL_MOVEMENTSPEED;

    this.data = {
      destination: vec3.create(),
      player: null,
      playerToTarget: null
    };

    let pt0 = vec3.create(); vec3.set(pt0, -27, 0, -9);
    this.patrolPath = [[-27, 0, -9],
      [-6.5, 0, -9],
      [-6.5, 0, 9],
      [0, 0, 9],
      [-6.5, 0, 9],
      [-6.5, 0, -5],
      [22, 0, -5],
      [22, 0, 15],];
  }

  start() {
    super.start();
  }

  updateComponent() {
    super.updateComponent();
  }

  _buildBehaviorTree() {
    let root = new PrioritySelector("root");

    let attackClosest = new ConcurrentSelector("Attack closest player");

    attackClosest.addNode(new CountdownTimer(this, 1));
    attackClosest.addNode(new CheckForPlayerWithinRange(this, ATTACK_RANGE));
    attackClosest.addNode(new TargetPlayer(this));
    attackClosest.addNode(new AttackPlayer(this, ATTACK_COOLDOWN));

    root.addNode(attackClosest);

    /*
    let moveNearby = new ConcurrentSelector("Move to nearby player");

    moveNearby.addNode(new CheckForPlayerWithinRange(this, LISTEN_RANGE+300));
    moveNearby.addNode(new TargetPlayer(this));
    moveNearby.addNode(new CountdownTimer(this, 0.25));
    moveNearby.addNode(new RayCastPlayer(this));
    moveNearby.addNode(new SetDestinationPlayer(this));
    moveNearby.addNode(new Inverter(new DestinationCheck(this, ATTACK_RANGE)));
    moveNearby.addNode(new MoveToDestination(this, EVIL_MOVEMENTSPEED));
    root.addNode(moveNearby);
    */

      let moveNearby = new ConcurrentSelector("Move to nearby player");
      let checkVision = new PrioritySelector("Check Vision");
      let seePlayer = new ConcurrentSelector("SeePlayer");
      seePlayer.addNode(new RayCastPlayer(this));
      seePlayer.addNode(new CountdownTimer(this, 0.25));
      seePlayer.addNode(new SetDestinationPlayer(this));
      let missPlayer = new ConcurrentSelector("MissPlayer");
      missPlayer.addNode(new CheckDestination(this));
      missPlayer.addNode(new Inverter(new DestinationCheck(this,ATTACK_RANGE)));
      checkVision.addNode(seePlayer);
      checkVision.addNode(missPlayer);

      moveNearby.addNode(new CheckForPlayerWithinRange(this, LISTEN_RANGE+300));
      moveNearby.addNode(new TargetPlayer(this));
      moveNearby.addNode(checkVision);
      //moveNearby.addNode(new RayCastPlayer(this));
      //moveNearby.addNode(new SetDestinationPlayer(this));
      //moveNearby.addNode(new Inverter(new DestinationCheck(this, ATTACK_RANGE)));
      moveNearby.addNode(new MoveToDestination(this, EVIL_MOVEMENTSPEED/5));
      root.addNode(moveNearby);

    // let pickPlayer = new ConcurrentSelector('pickPlayer');
    // pickPlayer.addNode(new CountdownTimer(this, 5));
    // pickPlayer.addNode(new PickRandomPlayer(this));
    //
    // let goGo = new PrioritySelector('goGo');
    //
    // let setPlayerDest = new ConcurrentSelector('setPlayerDest');
    // setPlayerDest.addNode(new CountdownTimer(this, 0.25));
    // setPlayerDest.addNode(new SetDestinationPlayer(this));
    //
    // let pathToPlayer = new PathToPoint(this, EVIL_MOVEMENTSPEED);
    // let findPath = new FindPath(this, pathToPlayer);
    //
    // let moveToPlayer = new ConcurrentSelector('moveToPlayer');
    // moveToPlayer.addNode(findPath);
    // moveToPlayer.addNode(new Inverter(new DestinationCheck(this)));
    // moveToPlayer.addNode(pathToPlayer);
    //
    // goGo.addNode(setPlayerDest);
    // goGo.addNode(moveToPlayer);
    //
    // root.addNode(pickPlayer);
    // root.addNode(goGo);

    // Debug.log(root);

    return root;
  }

  setDestination(destination) {
    this.data['destination'] = destination;
    this.serializeDirty = true;
  }

  setPlayer(player) {
    this.data['player'] = player;
    this.serializeDirty = true;
  }
  getPlayer(){
    return this.data['player'];
  }

  // _buildBehaviorTree(){
  //   let root = new ConcurrentSelector("patrol");
  //
  //   let dest2 = vec3.fromValues(this.patrolPath[7][0], this.patrolPath[7][1], this.patrolPath[7][2]);
  //   let dest1 = vec3.fromValues(this.patrolPath[3][0], this.patrolPath[3][1], this.patrolPath[3][2]);
  //   let dest0 = vec3.fromValues(this.patrolPath[0][0], this.patrolPath[0][1], this.patrolPath[0][2]);
  //
  //   let determineDest = new PrioritySelector("DetermineDestination");
  //   let goToDest = new ConcurrentSelector("goToDest");
  //   goToDest.addNode(new ProximityCheck(this, dest0, 0.1));
  //   goToDest.addNode(new SetDestination(this, dest2));
  //   let goToDest1 = new ConcurrentSelector("goToDest1");
  //   goToDest1.addNode(new ProximityCheck(this, dest2, 0.1));
  //   goToDest1.addNode(new SetDestination(this, dest1));
  //   let goToDest2 = new ConcurrentSelector("goToDes2");
  //   goToDest2.addNode(new ProximityCheck(this, dest1, 0.1));
  //   goToDest2.addNode(new SetDestination(this, dest0));
  //   determineDest.addNode(goToDest);
  //   determineDest.addNode(goToDest1);
  //   determineDest.addNode(goToDest2);
  //   determineDest.addNode(new ReturnTrue());
  //
  //   let pathToPt = new PathToPoint(this, EVIL_MOVEMENTSPEED);
  //   let findPath = new FindPath(this, pathToPt);
  //
  //   // add determine dest
  //   root.addNode(determineDest);
  //   root.addNode(findPath);
  //   root.addNode(new Inverter(new DestinationCheck(this)));
  //   root.addNode(pathToPt);
  //
  //   //console.log(root);
  //
  //   return root;
  // }

  // serialize() {
  //   if (this.serializeDirty) {
  //     let retVal = {};
  //     if (this.data.player !== null) retVal.pid = this.data.player.id;
  //     retVal.d = this.data.destination;
  //     this.serializeDirty = false;
  //     return retVal;
  //   }
  //
  //   return null;
  // }
  //
  // applySerializedData(data) {
  //   this.data.destination = [data.d[0], data.d[1], data.d[2]];
  //   if (data.pid && data.pid !== null)
  //     this.data.player = GameObject.prototype.SerializeMap[data.pid];
  //
  // }
}
