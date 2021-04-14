var rows;
var count = 0;
var mazeFlag = false; //indicates maze completion
var cols;
var grid = new Array(cols);
var openSet = []; //stuff you're yet to visit
var closedSet = [];//stuff you've already visited
var w,h; //this is for scaling stuff out properly. Width and height
var start; //begin here
var end; //this is your destination
var path = [];
w=40;
h=40;
var current1;
var stack = [];

function removeFromArray(arr,elt)
{
  for(var i = arr.length-1;i>=0;i--)
  {
    if(arr[i]==elt)
    {
      arr.splice(i,1);
    }
  }
}

function heuristic(a,b)
{
  //var d = abs(a.i-b.i)+abs(a.j-b.j); //Manhattan distance, use if there are no diagonals
  var d = dist(a.i,a.j,b.i,b.j); //Euclidean distance, use if diagonals are allowed
  return d;
}


function setup()
{
createCanvas(500,500);
rows = floor(width/w);
cols = floor(height/h);

for(var i=0;i<rows;i++)
  {
    grid[i] = new Array(rows);
  }

//initialise spots
  for(var i=0;i<rows;i++)
  {
    for(var j=0;j<cols;j++)
    {
      grid[i][j] = new Spot(i,j);
    }
  }
  current1=grid[0][0];

  //add Neighbours

  for(var i=0;i<rows;i++)
  {
    for(var j=0;j<cols;j++)
    {
      grid[i][j].addNeighbours(grid);
    }
  }

  start = grid[0][0];
  end = grid[rows-1][cols-1];
  start.wall=false;

    openSet.push(start); //this is where you start the a* algo, so push it onto openSet first

 }

 function removeWalls(a, b) {
   let x = a.i - b.i;
   if (x === 1) {
     a.walls[3] = false;
     b.walls[1] = false;
   } else if (x === -1) {
     a.walls[1] = false;
     b.walls[3] = false;
   }
   let y = a.j - b.j;
   if (y === 1) {
     a.walls[0] = false;
     b.walls[2] = false;
   } else if (y === -1) {
     a.walls[2] = false;
     b.walls[0] = false;
   }
}

function draw()
{
  background(51);
  for(var i=0;i<rows;i++)
  {
    for(var j=0;j<cols;j++)
    {
      grid[i][j].gshow();
    }
  }

  current1.visited=true;
  current1.highlight();
  //part 1 //get one of the unvisited maze neighbour randomly
  var next = current1.checkMazeNeighbours();
  if(next)
  {
    next.visited = true;

    //part 2 //stack the current cell
    stack.push(current1);

    //part 3 //remove walls
    removeWalls(current1,next);
    //part 4 //current = next
    current1 = next;
    count = count + 1;
  }
  else if(stack.length>0)
  { //backtracking begins here
    current1 = stack.pop();
    count = count + 1;
  }
  if(stack.length==0 && count>0 && current1 == start)
  {
    //noLoop();
    mazeFlag = true;
  }
  console.log(current1);
  //start the pathfinding algo here
  if(mazeFlag == true)
  {
    //console.log('a* starts here');
    if(openSet.length > 0)
  {
    //keep looping

    var winner = 0; //the spot with the lowest f. assume it is at the 0th index.
    for(var  i=0;i < openSet.length;i++)
    {
      if(openSet[i].f < openSet[winner].f) //compare cost functions here, select the min
      {
        winner = i;
      }
    }
    var current = openSet[winner];

    if(current === end) //check if you have reached the destinantion
    {
      //find path

      noLoop();
      console.log("DONE!");
    }

    removeFromArray(openSet,current);//remove current from openSet
    closedSet.push(current); //push current spot into closedSet

    var neighbours = current.neighbours;
    for(var i =0; i< neighbours.length; i++)
    {
      var neighbour = neighbours[i];
      if(!closedSet.includes(neighbour) && wallCheck(current,neighbour)===false) //check if neighbour is present in closedSet, and check if it is a wall
      {
      var tempG = current.g+1; //store temporary new dist
      var newPath = false;
        if(openSet.includes(neighbour))
          {
            if(tempG<neighbour.g)
            {
              neighbour.g=tempG; //if it's already a part of the openSet, compare g values and pick the min one
              newPath=true; //better update for the prvious spot
            }
          }
          else
          {
            neighbour.g=tempG;// if not present, we update it
            newPath=true;
            openSet.push(neighbour);
          }
          if(newPath)
          {
          neighbour.h = heuristic(neighbour,end);// we'll use Manhattan distance here, see function
          neighbour.f = neighbour.g + neighbour.h; //we saw this earlier...
          neighbour.previous = current;
        }

      }

    }

  }
  else
  {
  console.log("No solution");
  noLoop();
  return;

  //no solution

  }
  /*
  for(var i=0;i<openSet.length;i++)
  {
    openSet[i].show(color(0,255,0)); //openset green stuff
  }

  //closedSet stuff, red cells
  for(var i=0;i<closedSet.length;i++)
  {
    closedSet[i].show(color(255,0,0));
  }
*/
  //find path

 path = [];
 var temp = current;
 //path.push(temp); //push it into the array
 while(temp.previous) //as long as temp has a previous, think Hansel and Gretel, we retrace our steps
 {
   path.push(temp);
   temp=temp.previous;
 }

//trace final path, blue cells
 for(var i=0;i<path.length;i++)
 {
   //noFill();
   //path[i].show(color(0,0,255));
 }
 noFill();
 stroke(255,0,0);
 beginShape();
for(var i =0;i<path.length;i++)
{
  vertex(path[i].i*w+w/2, path[i].j*h+h/2);
}
 endShape();


  }

}

function index(i,j)
{
  if(i<0 || j<0 || i>rows-1 || j>cols-1)
  {
    return false;
  }
}

function wallCheck(a, b)
{
  let x = a.i - b.i;
  let y = a.j - b.j;
// 0 --> top;  1 --> right;  2 --> bottom ; 3 --> left; 
  if (x === 1) { // b on left of a
    if(a.walls[3] == false && b.walls[1] == false)
    {
      return false;
    }
  }
  else if (x === -1) {// b on right of a
    if(a.walls[1] == false && b.walls[3] == false)
    {
      return false;
    }
  }

  if (y === 1) {//b on top of a
    if(a.walls[0] == false && b.walls[2] == false)
    {
      return false;
    }
  }
  else if (y === -1) {//b below a
    if(a.walls[2] == false && b.walls[0] == false)
    {
      return false;
    }
  }
  else
  {
    return true;
  }
}

function Spot(i,j)
{
  this.i=i;
  this.j=j;
  this.f=0; //cost function, f = g + h
  this.g=0; //dist from starting point
  this.h=0; //heuristics, estimated distance from destination
  this.neighbours = []; //every spot will keep track of its neighbours
  this.previous = undefined;
  this.walls = [true, true, true, true]; //top, right, bottom, left
  this.visited = false;


  this.addNeighbours = function(grid){ // function to add neighbour spots to the neigbours array
    var i = this.i;
    var j = this.j;
    if(i<cols-1)
    {
    this.neighbours.push(grid[i+1][j]);
    }
    if(i>0)
    {
    this.neighbours.push(grid[i-1][j]);
    }
    if(j<rows-1)
    {
    this.neighbours.push(grid[i][j+1]);
    }
    if(j>0)
    {
    this.neighbours.push(grid[i][j-1]);
    }
    //diagonals. comment if you don't want these
    /*
    if(i>0 && j>0)
    {
      this.neighbours.push(grid[i-1][j-1]);
    }
    if(i<cols-1 && j>0)
    {
      this.neighbours.push(grid[i+1][j-1]);
    }
    if(i>0 && j<rows-1)
    {
      this.neighbours.push(grid[i-1][j+1]);
    }
    if(i<cols-1 && j<rows-1)
    {
      this.neighbours.push(grid[i+1][j+1]);
    }
*/

  }

  this.show = function(col){
    fill(col);
    if(this.wall)
    {
      fill(0);
    }
    noStroke();
    rect(this.i * w,this.j * h,w,h);
  }

  this.checkMazeNeighbours = function()
  {
    var mazeNeighbours = new Array();

    this.i=i;
    this.j=j;
      if(i<cols-1)
      {
        if(!grid[i+1][j].visited)
        {
      mazeNeighbours.push(grid[i+1][j]);
        }
      }
      if(i>0)
      {
        if(!grid[i-1][j].visited)
        {
      mazeNeighbours.push(grid[i-1][j]);
        }
      }
      if(j<rows-1)
      {
        if(!grid[i][j+1].visited)
        {
      mazeNeighbours.push(grid[i][j+1]);
        }
      }
      if(j>0)
      {
        if(!grid[i][j-1].visited)
        {
      mazeNeighbours.push(grid[i][j-1]);
        }
      }

      if(mazeNeighbours.length > 0)
      {
        var r = floor(random(0,mazeNeighbours.length));
        return mazeNeighbours[r];
      }
      else {
        return undefined;
      }
  }

  this.highlight = function() {
    let x = this.i * w;
    let y = this.j * w;
    noStroke();
    fill(0, 0, 255, 100);
    rect(x, y, w, w);
  };
  this.gshow = function()
  {
    let x = this.i * w;
    let y = this.j * w;
    stroke(255);
    if (this.walls[0]) {
      line(x, y, x + w, y);
    }
    if (this.walls[1]) {
      line(x + w, y, x + w, y + w);
    }
    if (this.walls[2]) {
      line(x + w, y + w, x, y + w);
    }
    if (this.walls[3]) {
      line(x, y + w, x, y);
    }
    if(this.visited)
    {
      noStroke();
      fill(255,255,255,100);
      rect(x,y,w,w);
    }
  }
}
