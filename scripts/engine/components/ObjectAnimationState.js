class ObjectAnimationState extends Component {
  constructor() {
    super();

    this.animation = null; // set it!

    this.state = null;
    // if nextState exists, after animation finishes, go to next state
    this.nextState = null;
    // this.currentTime = 0; // animation comp has current time
  }
}
