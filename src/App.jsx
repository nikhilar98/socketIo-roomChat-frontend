import { useState } from "react";
import {io} from 'socket.io-client'

const socket = io.connect('https://socketio-roomchat-backend.onrender.com')

function App() {

  const [message,setMessage] = useState("")
  const [room,setRoom]= useState("")
  const [receivedMsgs,setReceivedMsgs] = useState([])

  // useEffect(()=>{
  //   setReceivedMsgs([])
  //   setMessage('')
  // },[room])


  function joinRoom(){
    setReceivedMsgs([])
    setMessage('')
    socket.emit('joinroom',room)
  }

  function leaveRoom(){
    setReceivedMsgs([])
    setMessage('')
    setRoom('')
  }
  
  function sendMessage(e){
      e.preventDefault()
      socket.emit('send-message',{message,room})
      setMessage("")
  }

  
  socket.on('receive-message',(data)=>{
        setReceivedMsgs([...receivedMsgs,data])
  })
  
  console.log(socket.id)

  return (
    <div>
        <fieldset style={{width:"400px",marginTop:"70px"}}>
          <h1>Messages</h1> 
          <input type="text" value={room} onChange={(e)=>{setRoom(e.target.value)}}/>
          <button onClick={joinRoom}>join room</button> <button onClick={leaveRoom}>leave room</button>
          <hr />
          <ul style={{listStyle:"none"}}>
            {
              receivedMsgs.map((ele,i)=>{
                return <li key={i} style={socket.id===ele.id ? {textAlign:'right'} : {textAlign:'left'}}><span class='message'>{ele.message}</span><br/><span class='time'>{ele.time}</span></li>
              })
            }
          </ul>
          <form onSubmit={sendMessage}>
            <input type="text" value={message} onChange={(e)=>{setMessage(e.target.value)}}/>
            <input type='submit' value='send' disabled={!room}/>
          </form>
        </fieldset>
    </div>
  )
}

export default App;
