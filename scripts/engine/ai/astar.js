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
            if(this.data[i][0].index===index) {// && this.data[i][1]<=priority){
                //already inside
                return true;
            }
            return false;
        }
    }
}

class aStar{
    constructor(){
        this.path;
    }
    distance(pos0,pos1){
        let dist1=Math.abs(pos1.x-pos0.x);
        let dist2=Math.abs(pos1.y-pos0.y);
        let dist3=Math.abs(pos1.z-pos0.z);
        return dist1+dist2+dist3;
    }
    search(faceIndex,endingFace, startPos, endPos){
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
                    let path=[];
                    let parent=currNode.parent;
                    path.unshift(currNode.index,child);
                    while(parent!==-1){
                        path.unshift(totalList[parent].index);
                        parent=totalList[parent].parent;
                    }
                    console.log("path",path);
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
                openList.push(childNode);
            }
            //add currNode to close list
            //closeList.push(currNode,currNode.fValue);
            totalList[currNode.index]=currNode;
        }
        console.log("false");
        return false;
    }
}

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
 // A*
 initialize the open list
 initialize the closed list
 put the starting node on the open list (you can leave its f at zero)

 while the open list is not empty
 find the node with the least f on the open list, call it "q"
 pop q off the open list
 generate q's 8 successors and set their parents to q
 for each successor
 if successor is the goal, stop the search
 successor.g = q.g + distance between successor and q
 successor.h = distance from goal to successor
 successor.f = successor.g + successor.h

 if a node with the same position as successor is in the OPEN list \
 which has a lower f than successor, skip this successor
 if a node with the same position as successor is in the CLOSED list \
 which has a lower f than successor, skip this successor
 otherwise, add the node to the open list
 end
 push q on the closed list
 end
 */