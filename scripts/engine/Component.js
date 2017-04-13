/**
 * Created by Accipiter Chalybs on 4/5/2017.
 */
class Component
{

    constructor ()
    {
        this.gameObject = null;
        this.transform = null;
        this.visible = true;
        this.active = true;
    }

    update (deltaTime)
    {
    }

    draw ()
    {
    }

    setGameObject(go)
    {
        this.gameObject = go;
        this.transform = this.gameObject.transform;
    }

    onCollisionEnter (collision)
    {
    }

}