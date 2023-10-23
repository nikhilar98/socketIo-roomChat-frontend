import { useState,useRef,useEffect} from "react";
import {io} from 'socket.io-client'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const socket = io.connect('https://socketio-roomchat-backend.onrender.com') //http://localhost:3500

function App() {

  const [message,setMessage] = useState("")
  const [room,setRoom]= useState("")
  const [name,setName] = useState("")
  const [enableSend,setEnableSend] = useState(false)
  const [members,setMembers] = useState(0)
  const [receivedMsgs,setReceivedMsgs] = useState([])
  const [formErrors,setFormErrors] = useState({})
  const div = useRef(null)

  useEffect(()=>{
      div.current.scrollIntoView({ behavior: "smooth"})
  },[receivedMsgs])

  const errors = {} 

  const runValidations = () => { 
    if(room===''){
      errors.room = 'Room id is required.'
    }
    if(name===''){
      errors.name = 'name is required.'
    }
  }

  console.log(socket.id)


  function joinRoom(){
    runValidations() 
    if(Object.keys(errors).length===0){
      setFormErrors({})
      setEnableSend(true)
      setReceivedMsgs([])
      setMessage('')
      socket.emit('joinroom',room)
    }
    else { 
      setFormErrors(errors)
    }
  }

  function leaveRoom(){
    socket.emit('leave-room',{room,name})
    setEnableSend(false)
    setReceivedMsgs([])
    setMessage('')
    setName('')
    setRoom('')
    setMembers(0)
  }
  
  function sendMessage(e){
      e.preventDefault()
      if(message){
        socket.emit('send-message',{message,room,name})
        setMessage("")
      }
  }

  socket.on('receive-rooms',(data)=>{
      setMembers(data)
  })
  
  socket.on('receive-message',(data)=>{
        setReceivedMsgs([...receivedMsgs,data])
  })

  return (
    <div className="container">
        <fieldset>
          <h1>BlazeText
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-1 h-1" width="40px">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
          </h1> 
          <Box component="form" sx={{'& > :not(style)': { m: 1, width: '18ch' }}} noValidate autoComplete="on">
              <TextField error={Boolean(formErrors.room)} label={formErrors.room ? "Error":"enter room number"} variant="filled" type="number" value={room} onChange={(e)=>{setRoom(e.target.value)}} size="small" helperText={formErrors.room && formErrors.room}color="success"/>
              <TextField error={Boolean(formErrors.name)} label={formErrors.name ?"Error":"enter your name"} variant="filled" type="text" value={name} onChange={(e)=>{setName(e.target.value)}} size="small" helperText={formErrors.name && formErrors.name} color="success"/>
          </Box>{ Boolean(members) && <span> Members in room : <button className='count' disabled={true}>{members}</button> </span>}<br/><br/>
          <Button variant="contained" size="small" onClick={joinRoom} style={{backgroundColor:"green"}}>join</Button>
          <Button variant="contained" size="small" onClick={leaveRoom} style={{backgroundColor:"red",color:"black",marginLeft:"10px"}}>leave</Button>
          <hr />
            <ul>
              {  
                receivedMsgs.map((ele,i)=>{
                  return <li key={i} style={socket.id===ele.id ? {textAlign:'right'} : {textAlign:'left'}}>
                      <span className='username'>{ele.name}</span><br/>
                      <span className='message'>{ele.message}</span><br/>
                      <span className='time'>{ele.time}</span>
                    </li>
                })
              }
              <div ref={div}></div>
            </ul>
          <div className="send-box"> 
            <form onSubmit={sendMessage}>
                <TextField label="your message goes here..." variant="outlined" type="text" value={message} onChange={(e)=>{setMessage(e.target.value)}} size="small" autoComplete="off"/>

                <Button variant="contained" size="medium" type='submit' disabled={!(enableSend&&room&&name)} style={{marginLeft:"10px"}}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </Button>
            </form>
          </div>
        </fieldset>
    </div>
  )
}

export default App;
