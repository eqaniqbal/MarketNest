import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import ChatBox from './ChatBox'

export default function ChatBubble({ receiverId, receiverName }) {
  const [open, setOpen] = useState(false)

  if (!receiverId) return null

  return (
    <>
      <AnimatePresence>
        {open && (
          <ChatBox
            receiverId={receiverId}
            receiverName={receiverName}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
        onClick={() => setOpen(o => !o)}
        title={`Chat with ${receiverName}`}
        style={{
          position:'fixed', bottom:96, right:24,
          width:54, height:54, borderRadius:'50%',
          background: open
            ? '#374151'
            : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          border:'none', display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 20px rgba(200,151,58,0.45)',
          zIndex:999, cursor:'pointer', transition:'background 0.2s'
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}}>
                <X size={20} color="white" />
              </motion.span>
            : <motion.span key="chat" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}}>
                <MessageCircle size={20} color="white" />
              </motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Seller label tooltip */}
      {!open && (
        <motion.div
          initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:0.5}}
          style={{
            position:'fixed', bottom:108, right:86,
            background:'var(--accent)', color:'white',
            padding:'0.3rem 0.7rem', borderRadius:8,
            fontSize:'0.72rem', fontWeight:600,
            pointerEvents:'none', zIndex:998,
            boxShadow:'0 2px 10px rgba(0,0,0,0.2)',
            whiteSpace:'nowrap'
          }}>
          Chat with {receiverName}
        </motion.div>
      )}
    </>
  )
}
