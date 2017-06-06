/**
 * Created by Accipiter Chalybs on 6/4/2017.
 */
class Floor extends Component {
  constructor(params = {surfaceType: "hard"}) {
    super();
    this.componentType = "Floor";

    this.surfaceType = params.surfaceType;
  }
}