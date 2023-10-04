import {useState, useEffect} from 'react';
import {io} from "socket.io-client";

import Pixel from "./Pixel.js";
import ColorSelector from "./ColorSelector";

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()


const socket = io(process.env.REACT_APP_SOCKET_URL);


//console.log(process.env.SOCKET_URL)


function FaviconEditor() {
  /*

  */

  //props: width, height

  //matrix stores all of the color data 
  //editor tells whether or not to show the editor and the data to show
  const [matrix, setMatrix] = useState(null);
  const [editor, setEditor] = useState(null);
  const [update, setUpdate] = useState(null);


  function updateMatrix(color, row, col) {
    /*
    color : hex
    row : int 
    col : int
    called when a color in changed in the editor
    send websocket message. 
    No useEffect because websocekt updates the matrix too 
    */
    //called when changeCompletd on color picker happens
    const newMatrix = [...matrix];
    newMatrix[row][col] = color;
    setMatrix(newMatrix);
  }

  useEffect(() => {
    if (update !== null) {
      updateMatrix(update.color, update.row, update.col)

    }
  }, [update])

  useEffect(() => {
    //connects to the websocket initially.
    socket.on("start", (data) => {
      setMatrix(data)
    })

    socket.on("update", (data) => setUpdate(data))

  }, [])


 

  function setFavicon() {
    /* 
    Creates canvas, inputs matrix data, retrieves base64 encoded image that sets favicon to.
    possible can just move this to the useEffect  if i am not going to be adding anything else to it
    */

    const favicon = document.getElementById("favicon");  //reference to the favicon 

    if (matrix === null) {
      return;
    }

    const canvas = document.createElement('canvas');
    //should always be 32 but why not make it dynamic 
    canvas.width = matrix[0].length;
    canvas.height = matrix.length;

    const ctx = canvas.getContext("2d");

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[0].length; col++) {
        ctx.fillStyle = matrix[row][col];
        ctx.fillRect(col, row, 1, 1);
      }
    }

    favicon.setAttribute("href", canvas.toDataURL());
  }

  useEffect(() => {
    /* 
    takes the matrix converts it to an image and sets the favicon to it.
    */
    //update the favicon when the matrix editor is changed
    setFavicon()
  }, [matrix]);


  function openEditor(clickEvent, rowIndex, colIndex, color) {
    /*
    opens a new editor. triggered by a block click
    */
   //need ot also pass the orignal color
    //set editor state to true {}
    //get clickEvent x and y position as props to pass 
    //send a callback with (color) => {updateMatrix(color, rowIndex, colIndex)}
    //an x on the editor to close it. callback () => setEditor({show : false})
    setEditor({
      x:clickEvent.pageX,
      y:clickEvent.pageY,
      setColorCallback: (color) => {
        /*
        on color changes update the matrix and then broadcast it to the other clients
        */
        updateMatrix(color, rowIndex, colIndex);
        socket.emit("update", {color : color, row : rowIndex, col : colIndex});
      },
      color:color,
      closeEditorCallback: () => {setEditor(null)}
    })
  }

  return (
    <div className="OurFavicon">
      {matrix !== null &&
        <div className="grid">
          {matrix.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((hex, colIndex) => (
                <Pixel width={100 / matrix[0].length} key={colIndex} onClick={(event) => openEditor(event, rowIndex, colIndex, hex)} hex={hex}/>
              ))}
            </div>
            )
          )}
        </div>
      }
      {editor !== null && 
        <ColorSelector 
          xPos={editor.x} 
          yPos={editor.y} 
          setColorCallback={editor.setColorCallback}
          closeEditorCallback={editor.closeEditorCallback}
          color={editor.color}
        ></ColorSelector>
      }
    </div>
  )
}


export default FaviconEditor;