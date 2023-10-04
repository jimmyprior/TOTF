import {useState, useEffect} from 'react';
import { ChromePicker } from 'react-color';

const width = 200;

function ColorSelector(props) {
    //need to know where the click was from x and y to display 
    //need a callback to handle on close behvaior
  
    const [color, setColor] = useState(props.color)
    
    useEffect(() => {
      setColor(props.color)
    }, [props.color] )
  
    function handleChange(newColor, event) {
      setColor(newColor);
    }
  
    //fix the trashy logic in the two funcitons below
    function getXPos() {
      //10 is the width of the img
      
      if ((props.xPos + width + 10) > window.innerWidth) {
        return props.xPos - width
      }
      return props.xPos
    }
  
    function getImagePosition() {
      if ((props.xPos + width + 10) > window.innerWidth) {
        return ["-10px", null]
      }
      return [null, "-10px"]
    }
  
    function updateColor(color) {
      /*
      updates the color of the matrix.
      */
      props.setColorCallback(color.hex)
      //use props callback to pass new color to be set 
    }
  
    //n
    let [leftX, rightX] = getImagePosition()
    return (
      <div className="editor" style={{top:props.yPos, left:getXPos()}}>
        <img className="x-icon" style={{left:leftX, right:rightX}} onClick={() => {props.closeEditorCallback()}} src="data:image/png;base64,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"/>
        <ChromePicker width={`${width}px`} disableAlpha={true} color={color} onChangeComplete={updateColor} onChange={handleChange} />
      </div>
    )
}


export default ColorSelector;