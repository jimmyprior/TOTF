import express from "express"
import {Server} from "socket.io"
import {createServer} from "http"
import cors from "cors"
import fs from "fs"
import * as path from 'path'

function generateRandomHex() {
  /*
  generates a random hex.
  */
  let string = "#"
  for (let i = 0; i < 3; i++) {
    string += Math.round(Math.random() * 255).toString(16);
    if (string.length % 2 !== 1) {
      string += "0";
    }
  }
  return string
}

function getRandomData(width, height) {
  /*
  width : int 
  height : int 

  generates a nested array of width * height of random hexidecimal values 
  */
  const matrix = []
  for(let i = 0; i < height; i++) {
    let row = []
    for (let x = 0; x < width; x++) {
      row.push(generateRandomHex())
    }
    matrix.push(row)
  }
  return matrix;
}


function updateMatrix(data) {
  /*
  update the matrix
  save the new matrix to the output file
  */
  try {
    matrix[data.row][data.col] = data.color;
  } catch (error) {
    console.log("failed to update")
    return false
  }

  //write the updated matrix to the output file
  fs.writeFile(saveFile, JSON.stringify(matrix), () => {})
  return true;
}




const saveFile = "matrix.json" //file to save the matrix to.
const app = express()


app.use(cors())
app.use(express.static('build'));

app.get('/', function (req, res) {
  res.sendFile(path.join('build', 'index.html'));
});



if (!fs.existsSync(saveFile)) {
  /*
  create save file and add data to it if it does not already exist.
  */
  const matrix = getRandomData(32, 32);
  fs.writeFileSync(saveFile, JSON.stringify(matrix))
}


const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
})

//load the save file 
const matrix = JSON.parse(fs.readFileSync(saveFile, "utf8"))


app.get('/', (req, res) => {
  //for testing right now 
  res.send("hello world")
});

io.on('connection', (socket) => {
  console.log("NEW CONNECTION")
  //send the inital start data matrix data
  socket.emit("start", matrix);
  
  socket.on("update", (data) => {
    console.log(data)
    /*
    when the colros update 
    broadcast out to every other socket except sender 
    */
    if (updateMatrix(data)) {
      socket.broadcast.emit("update", data);
    }
  });


});


server.listen(4000, () => {
  console.log('listening on *:4000');
});