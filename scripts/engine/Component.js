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
        if (go !== null) {
            this.transform = go.transform;
        } else {
            this.transform = null;
        }
    }

    onCollisionEnter (collision)
    {
    }

}