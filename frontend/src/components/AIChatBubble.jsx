import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, X, Zap } from 'lucide-react'
import AIChatbot from './AIChatbot'

export default function AIChatBubble() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {open && <AIChatbot onClose={() => setOpen(false)} />}
      </AnimatePresence>

      {/* Pulse ring */}
      {!open && (
        <motion.div
          animate={{ scale:[1,1.55,1], opacity:[0.5,0,0.5] }}
          transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut' }}
          style={{
            position:'fixed', bottom:24, right:24,
            width:60, height:60, borderRadius:'50%',
            border:'2px solid var(--primary)',
            pointerEvents:'none', zIndex:998
          }}
        />
      )}

      <motion.button
        whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
        onClick={() => setOpen(o => !o)}
        style={{
          position:'fixed', bottom:24, right:24,
          width:60, height:60, borderRadius:'50%',
          background: open
            ? 'var(--accent-mid)'
            : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-mid) 100%)',
          border:'2px solid rgba(200,151,58,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: open
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 6px 28px rgba(0,0,0,0.35)',
          zIndex:999, cursor:'pointer', transition:'background 0.3s'
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.16}}>
                <X size={22} color="white" />
              </motion.span>
            : <motion.span key="bot" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.16}}
                style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Bot size={25} color="white" />
              </motion.span>
          }
        </AnimatePresence>

        {/* Gold AI badge */}
        {!open && (
          <motion.div initial={{scale:0}} animate={{scale:1}}
            style={{
              position:'absolute', top:-3, right:-3,
              background:'linear-gradient(135deg,var(--primary),var(--primary-dark))',
              borderRadius:99, padding:'2px 6px',
              display:'flex', alignItems:'center', gap:'2px',
              border:'2px solid white', boxShadow:'0 2px 8px rgba(200,151,58,0.4)'
            }}>
            <Zap size={7} color="white" fill="white" />
            <span style={{color:'white',fontSize:'0.56rem',fontWeight:800}}>AI</span>
          </motion.div>
        )}
      </motion.button>
    </>
  )
}
