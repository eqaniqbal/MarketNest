import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, X, MessageCircle, Check, CheckCheck } from 'lucide-react'
import { io } from 'socket.io-client'
import api from '../utils/api'
import { getUser } from '../utils/auth'

let socket = null
function getSocket() {
  if (!socket) socket = io('http://localhost:5000', { transports:['websocket','polling'] })
  return socket
}

export default function ChatBox({ receiverId, receiverName, onClose }) {
  const user = getUser()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const roomId = [user.id, receiverId].sort((a,b)=>a-b).join('_')

  useEffect(() => {
    const sock = getSocket()
    sock.emit('join_room', roomId)
    api.get(`/chat/${receiverId}`)
      .then(res => { setMessages(res.data); setLoading(false) })
      .catch(() => setLoading(false))
    const onMsg = msg => {
      if (
        (msg.sender_id===receiverId && msg.receiver_id===user.id) ||
        (msg.sender_id===user.id && msg.receiver_id===receiverId)
      ) {
        setMessages(prev => {
          const exists = prev.some(m => m.created_at===msg.created_at && m.sender_id===msg.sender_id && m.content===msg.content)
          return exists ? prev : [...prev, msg]
        })
      }
    }
    sock.on('receive_message', onMsg)
    return () => sock.off('receive_message', onMsg)
  }, [receiverId])

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    const now = new Date().toISOString()
    const msgData = { room:roomId, sender_id:user.id, sender_name:user.full_name, receiver_id:receiverId, content:text.trim(), created_at:now, is_seen:false }
    setMessages(p => [...p, msgData])
    const sentText = text.trim()
    setText('')
    getSocket().emit('send_message', msgData)
    try { await api.post('/chat/send', { receiver_id:receiverId, content:sentText }) }
    catch(e) { console.error(e) }
    setSending(false)
  }

  return (
    <motion.div
      initial={{opacity:0,scale:0.92,y:16}}
      animate={{opacity:1,scale:1,y:0}}
      exit={{opacity:0,scale:0.92,y:16}}
      style={{
        position:'fixed', bottom:164, right:24,
        width:340, height:460,
        background:'white', borderRadius:18,
        boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
        display:'flex', flexDirection:'column',
        border:'1px solid var(--border)', zIndex:1000, overflow:'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding:'0.9rem 1.2rem',
        background:'linear-gradient(135deg, var(--accent) 0%, var(--accent-mid) 100%)',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'0.65rem'}}>
          <div style={{
            width:38, height:38, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,var(--primary),var(--primary-dark))',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontWeight:800, fontSize:'0.95rem',
            boxShadow:'0 2px 8px rgba(200,151,58,0.35)'
          }}>
            {receiverName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{color:'white',fontWeight:700,fontSize:'0.9rem'}}>{receiverName}</p>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'0.7rem',display:'flex',alignItems:'center',gap:'0.3rem'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#22C55E',display:'inline-block'}}/>
              Online
            </p>
          </div>
        </div>
        <button onClick={onClose}
          style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'0.4rem',cursor:'pointer',color:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center'}}>
          <X size={15} />
        </button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'0.9rem',display:'flex',flexDirection:'column',gap:'0.55rem',background:'#FAFAF8'}}>
        {loading && <p style={{textAlign:'center',color:'var(--text-muted)',fontSize:'0.83rem',padding:'2rem'}}>Loading messages…</p>}
        {!loading && messages.length===0 && (
          <div style={{textAlign:'center',marginTop:'2.5rem'}}>
            <MessageCircle size={36} color="var(--border)" style={{margin:'0 auto 0.5rem'}}/>
            <p style={{color:'var(--text-muted)',fontSize:'0.83rem'}}>No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg,i) => {
          const mine = msg.sender_id===user.id
          return (
            <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
              style={{display:'flex',justifyContent:mine?'flex-end':'flex-start'}}>
              <div style={{
                maxWidth:'78%', padding:'0.6rem 0.9rem',
                borderRadius: mine?'14px 14px 4px 14px':'14px 14px 14px 4px',
                background: mine
                  ? 'linear-gradient(135deg,var(--accent),var(--accent-mid))'
                  : 'white',
                color: mine?'white':'var(--text-main)',
                fontSize:'0.87rem', lineHeight:1.5,
                boxShadow: mine
                  ? '0 2px 12px rgba(26,26,46,0.25)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
                border: mine ? 'none' : '1px solid var(--border)'
              }}>
                <p>{msg.content}</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:'0.25rem',marginTop:'0.2rem'}}>
                  <span style={{fontSize:'0.68rem',opacity:0.6}}>
                    {new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  </span>
                  {mine && (msg.is_seen
                    ? <CheckCheck size={11} color="var(--primary)" />
                    : <Check size={11} style={{opacity:0.5}} />
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{padding:'0.7rem 0.9rem',borderTop:'1px solid var(--border)',display:'flex',gap:'0.5rem',alignItems:'center',background:'white',flexShrink:0}}>
        <input
          className="input-field"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if(e.key==='Enter')sendMessage() }}
          style={{flex:1,padding:'0.6rem 0.85rem',fontSize:'0.86rem',borderRadius:10}}
        />
        <button onClick={sendMessage} disabled={!text.trim()||sending}
          style={{
            width:38, height:38, borderRadius:'50%', border:'none', flexShrink:0,
            background: text.trim()&&!sending
              ? 'linear-gradient(135deg,var(--primary),var(--primary-dark))'
              : 'var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor: text.trim()&&!sending?'pointer':'default',
            boxShadow: text.trim()&&!sending?'0 2px 10px rgba(200,151,58,0.35)':'none'
          }}>
          <Send size={15} color="white" />
        </button>
      </div>
    </motion.div>
  )
}
