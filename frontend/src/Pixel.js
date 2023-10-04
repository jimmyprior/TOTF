function Pixel(props) {
    /*
    Represents one pixle in the favicon. Rename to Pixle
    */
    return (
      <div 
        className="block" 
        style={
          {
            width: `${props.width}%`,
            backgroundColor: props.hex
          }
        }
        onClick={(event) => props.onClick(event)}
        >
      </div>
    )
  }
  


export default Pixel;