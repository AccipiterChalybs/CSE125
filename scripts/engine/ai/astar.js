class pQueue{
    constructor(){
        this.data=[];
    }
    push(element, priority){
        priority = -priority;
        for (var i = 0; i < this.data.length && this.data[i][1] > priority; i++);
        this.data.splice(i, 0, [element, priority])
    }
    pop(){
        return this.data.shift()[0];
    }
    size(){
        return this.data.length
    }
    search(index,priority){
        for(let i=0;i<this.data.length;i++){
            if(this.data[i][0].index===index && this.data[i][1]<=priority){
                //already inside
                return true;
            }
        }
        return false;
    }
}

const aStar = {
    distance: function(pos0,pos1){
        let dist1=Math.abs(pos1[0]-pos0[0]);
        let dist2=Math.abs(pos1[1]-pos0[1]);
        let dist3=Math.abs(pos1[2]-pos0[2]);
        return dist1+dist2+dist3;
    },

    search: function(faceIndex,endingFace, startPos, endPos, path){
        if(faceIndex === endingFace){
            path.push(startPos);
            path.push(endPos);
            return true;
        }
        //initialize the open and close list
        //console.log("aster started");
        let totalList = [];
        let openList = new pQueue();
        let vertList = NavMesh.prototype.currentNavMesh.vertList;
        for(let i=0; i<vertList.length;i++){
            totalList[i]=null;
        }
        //goals
        let finish = NavMesh.prototype.currentNavMesh.faceList[endingFace].indices;
        //intial list
        let startNode = new starNode();
        openList.push(startNode,startNode.fValue);
        while(openList.size()>0){
            //Debug.assert(i++<200);
            let currNode=openList.pop();

            if(currNode.index !== -1 && totalList[currNode.index]!==null){
              continue;
            }

            //console.log("size: ", openList.size());
            let successor=[];
            if(currNode.index===-1){
                successor=NavMesh.prototype.currentNavMesh.faceList[faceIndex].indices;
            }
            else{
                successor=NavMesh.prototype.currentNavMesh.vertList[currNode.index].adj;
            }
            for(let i=0;i<successor.length;i++){
                let child=successor[i];
                if(child===finish[0] || child===finish[1] || child===finish[2]){
                    // let path=[];
                      totalList[currNode.index]=currNode;
                      let parent=currNode.index;
                      let tmp1Vec3=vec3.fromValues(vertList[child].pos[0],vertList[child].pos[1],vertList[child].pos[2]);
                      path.unshift(tmp1Vec3,endPos);
                      while(parent!==-1){
                        let ind =totalList[parent].index;
                        let tmpVec3 = vec3.fromValues(vertList[ind].pos[0],vertList[ind].pos[1],vertList[ind].pos[2]);
                        path.unshift(tmpVec3);
                        parent=totalList[parent].parent;
                    }
                    path.unshift(vec3.copy(vec3.create(),startPos));
                    // console.log("path",path);
                    //console.log(vertList);
                    return true;
                }
                //make child node with values
                let childNode=new starNode();
                childNode.parent=currNode.index;
                childNode.index=child;
                if(currNode.parent===-1){
                    childNode.gValue=currNode.gValue+this.distance(startPos,vertList[child].pos);
                }
                else{
                    childNode.gValue=currNode.gValue+this.distance(vertList[currNode.index].pos,vertList[child].pos);
                }
                childNode.hValue=this.distance(vertList[child].pos,endPos);
                childNode.fValue=childNode.gValue+childNode.hValue;
                //check to add to list
                //if node already in list with lower f value
                if(openList.search(childNode.index,childNode.fValue)){
                    continue;
                }
                //if node is in the closed list with lower f value
                if(totalList[childNode.index]!==null){
                    continue;
                }
                //else add to the open list
                openList.push(childNode, childNode.fValue);
            }
            //add currNode to close list
            //closeList.push(currNode,currNode.fValue);
            totalList[currNode.index]=currNode;
        }
        // console.log("false");
        return false;
    }
};

class starNode{
    constructor(){
        this.parent=-1; //number in nav mesh index
        this.index=-1;  //index of vertice
        //f=g+h
        this.fValue=0;  //total = hValue
        this.hValue=0; //heuristic value
        this.gValue=0; //cost to get to node
    }
}

/*
 let myvec3 = vec3.fromValues(x,y,z);
 let altvec3 = vec3.create(); vec3.set(altvec3,x,y,z);
 */