import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Bot, User, RefreshCw, Sparkles, Zap } from 'lucide-react'
import { getUser } from '../utils/auth'

const quickQuestions = [
  { text: 'Where is my order?',               emoji: '📦' },
  { text: 'How do I return a product?',       emoji: '🔄' },
  { text: 'What are the delivery charges?',   emoji: '🚚' },
  { text: 'How do I contact a seller?',       emoji: '💬' },
  { text: 'What payment methods accepted?',   emoji: '💳' },
  { text: 'How do I start selling?',          emoji: '🏪' },
]

const SYSTEM = `You are Nesty, the friendly AI support assistant for MarketNest — Pakistan's trusted online marketplace.

Help users with: orders, returns, delivery, payments, contacting sellers, coupons, account issues, and how to shop or sell.

Key platform facts:
- Standard delivery: Rs.150, 3-5 business days. Express: Rs.300, 1-2 days.
- Free shipping on orders above Rs.2,000
- Return window: 7 days from delivery (unused, original packaging)
- Refunds processed in 5-7 business days
- Payment: Credit/Debit Card (Visa, Mastercard), Digital Wallet
- Cancel orders before shipping only
- Support: support@marketnest.com | Mon-Sat 9am-6pm PKT
- Sellers create coupons from Seller Dashboard → Coupons
- Buyers apply coupons in Cart before checkout

Guidelines:
- Be warm, concise, helpful — keep replies under 180 words
- Use **bold** for key info
- Respond in same language as user (Urdu or English)
- If issue can't be resolved, direct to support@marketnest.com`

async function askNesty(message, history) {
  const msgs = [
    ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ]
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM,
      messages: msgs,
    })
  })
  const data = await res.json()
  if (data?.content?.[0]?.text) return data.content[0].text
  throw new Error(data?.error?.message || 'No response')
}

function TypingDots() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.45rem',
      padding: '0.65rem 1rem', background: 'white',
      borderRadius: '14px 14px 14px 4px', width: 'fit-content',
      border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      {[0,1,2].map(i => (
        <motion.div key={i}
          animate={{ y: [0,-5,0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i*0.14 }}
          style={{ width:7, height:7, borderRadius:'50%', background:'var(--primary)' }} />
      ))}
      <span style={{ fontSize:'0.77rem', color:'var(--text-muted)', marginLeft:'0.15rem' }}>Nesty is typing…</span>
    </div>
  )
}

function Bubble({ msg }) {
  const bot = msg.role === 'assistant'
  const renderText = t => t.split('\n').map((line, li, arr) => {
    const parts = line.split(/(\*\*.*?\*\*)/g)
    return (
      <span key={li}>
        {parts.map((p, pi) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={pi}>{p.slice(2,-2)}</strong>
            : <span key={pi}>{p}</span>
        )}
        {li < arr.length-1 && <br />}
      </span>
    )
  })

  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.18}}
      style={{ display:'flex', justifyContent: bot?'flex-start':'flex-end', alignItems:'flex-end', gap:'0.45rem' }}>
      {bot && (
        <div style={{
          width:28, height:28, borderRadius:'50%', flexShrink:0, marginBottom:2,
          background:'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <Bot size={14} color="white" />
        </div>
      )}
      <div style={{ maxWidth:'80%' }}>
        <div style={{
          padding:'0.7rem 1rem',
          borderRadius: bot ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
          background: bot ? 'white' : 'linear-gradient(135deg, var(--accent), var(--accent-mid))',
          color: bot ? 'var(--text-main)' : 'white',
          fontSize:'0.86rem', lineHeight:1.65,
          boxShadow: bot ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 12px rgba(26,26,46,0.25)',
          border: bot ? '1px solid var(--border)' : 'none',
          wordBreak:'break-word'
        }}>
          {renderText(msg.content)}
        </div>
        <p style={{
          fontSize:'0.66rem', color:'var(--text-muted)', marginTop:'0.22rem',
          textAlign: bot?'left':'right',
          paddingLeft: bot?'0.3rem':0, paddingRight: bot?0:'0.3rem'
        }}>
          {msg.time?.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
        </p>
      </div>
      {!bot && (
        <div style={{
          width:28, height:28, borderRadius:'50%', flexShrink:0, marginBottom:2,
          background:'var(--primary-light)', border:'1.5px solid var(--primary)',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <User size={13} color="var(--primary)" />
        </div>
      )}
    </motion.div>
  )
}

export default function AIChatbot({ onClose }) {
  const [messages, setMessages] = useState([{
    role:'assistant',
    content:`Hi there! 👋 I'm **Nesty**, your MarketNest AI assistant.\n\nI can help with **orders, returns, delivery, payments** and more — 24/7.\n\nWhat can I help you with today?`,
    time: new Date()
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const bottomRef = useRef(null)
  const taRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages, loading])

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto'
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 80) + 'px'
    }
  }, [input])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    const history = messages.map(m => ({ role:m.role, content:m.content }))
    setMessages(p => [...p, { role:'user', content:msg, time:new Date() }])
    setInput('')
    setLoading(true)
    setShowQuick(false)
    try {
      const reply = await askNesty(msg, history)
      setMessages(p => [...p, { role:'assistant', content:reply, time:new Date() }])
    } catch(e) {
      setMessages(p => [...p, {
        role:'assistant',
        content:`Sorry, I'm having a little trouble right now 😅\n\nPlease try again in a moment, or email **support@marketnest.com** for help.`,
        time:new Date()
      }])
    } finally { setLoading(false) }
  }

  const clear = () => {
    setMessages([{role:'assistant',content:'Chat cleared! 👋 How can I help you?',time:new Date()}])
    setShowQuick(true); setInput('')
  }

  return (
    <motion.div
      initial={{opacity:0,scale:0.88,y:20}}
      animate={{opacity:1,scale:1,y:0}}
      exit={{opacity:0,scale:0.88,y:20}}
      transition={{type:'spring',damping:24,stiffness:300}}
      style={{
        position:'fixed', bottom:100, right:24,
        width:370, height:580,
        background:'white', borderRadius:20,
        boxShadow:'0 24px 80px rgba(0,0,0,0.2)',
        display:'flex', flexDirection:'column',
        border:'1px solid var(--border)', zIndex:1001, overflow:'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding:'1rem 1.2rem',
        background:'linear-gradient(135deg, var(--accent) 0%, var(--accent-mid) 100%)',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0,
        borderBottom:'1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <div style={{
            width:42, height:42, borderRadius:'50%', flexShrink:0, position:'relative',
            background:'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 12px rgba(200,151,58,0.4)'
          }}>
            <Bot size={21} color="white" />
            <div style={{
              position:'absolute', bottom:1, right:1,
              width:11, height:11, borderRadius:'50%',
              background:'#22C55E', border:'2px solid var(--accent)'
            }} />
          </div>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
              <p style={{color:'white',fontWeight:700,fontSize:'0.97rem'}}>Nesty</p>
              <span style={{
                background:'rgba(200,151,58,0.25)', padding:'0.1rem 0.45rem',
                borderRadius:99, display:'flex', alignItems:'center', gap:'2px',
                border:'1px solid rgba(200,151,58,0.4)'
              }}>
                <Zap size={9} color="var(--primary)" fill="var(--primary)" />
                <span style={{color:'var(--primary)',fontSize:'0.62rem',fontWeight:700}}>AI</span>
              </span>
            </div>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'0.72rem'}}>
              MarketNest Support · Always online
            </p>
          </div>
        </div>
        <div style={{display:'flex',gap:'0.35rem'}}>
          <button onClick={clear}
            style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'0.4rem',cursor:'pointer',color:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center'}}>
            <RefreshCw size={14} />
          </button>
          <button onClick={onClose}
            style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'0.4rem',cursor:'pointer',color:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center'}}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:'0.75rem',background:'#FAFAF8'}}>
        <AnimatePresence initial={false}>
          {messages.map((m,i) => <Bubble key={i} msg={m} />)}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            style={{display:'flex',alignItems:'flex-end',gap:'0.45rem'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--primary-dark))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Bot size={14} color="white" />
            </div>
            <TypingDots />
          </motion.div>
        )}
        <AnimatePresence>
          {showQuick && messages.length===1 && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{delay:0.35}}>
              <p style={{fontSize:'0.73rem',color:'var(--text-muted)',marginBottom:'0.55rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>
                Quick questions
              </p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
                {quickQuestions.map((q,i) => (
                  <motion.button key={i}
                    initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
                    transition={{delay:0.4+i*0.06}}
                    whileHover={{scale:1.04,y:-1}} whileTap={{scale:0.96}}
                    onClick={() => send(q.text)}
                    style={{
                      padding:'0.38rem 0.75rem', borderRadius:99,
                      border:'1.5px solid var(--border)', background:'white',
                      color:'var(--text-main)', fontSize:'0.77rem', fontWeight:500,
                      cursor:'pointer', fontFamily:'Inter,sans-serif',
                      display:'flex', alignItems:'center', gap:'0.3rem',
                      transition:'all 0.15s'
                    }}>
                    <span>{q.emoji}</span>{q.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{padding:'0.8rem 1rem',borderTop:'1px solid var(--border)',background:'white',flexShrink:0}}>
        <div style={{display:'flex',gap:'0.55rem',alignItems:'flex-end'}}>
          <textarea ref={taRef} rows={1}
            placeholder="Ask Nesty anything… (Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }}
            style={{
              flex:1, padding:'0.65rem 0.9rem',
              border:'1.5px solid var(--border)', borderRadius:10,
              fontSize:'0.86rem', fontFamily:'Inter,sans-serif',
              outline:'none', resize:'none', background:'var(--bg)',
              color:'var(--text-main)', lineHeight:1.5,
              overflowY:'auto', maxHeight:80, transition:'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor='var(--primary)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
          <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.92}}
            onClick={() => send()}
            disabled={!input.trim()||loading}
            style={{
              width:40, height:40, borderRadius:'50%', flexShrink:0, border:'none',
              background: input.trim()&&!loading
                ? 'linear-gradient(135deg,var(--primary),var(--primary-dark))'
                : 'var(--border)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor: input.trim()&&!loading ? 'pointer' : 'default',
              boxShadow: input.trim()&&!loading ? '0 2px 10px rgba(200,151,58,0.35)' : 'none'
            }}>
            <Send size={16} color="white" />
          </motion.button>
        </div>
        <p style={{fontSize:'0.65rem',color:'var(--text-muted)',textAlign:'center',marginTop:'0.45rem'}}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </motion.div>
  )
}
