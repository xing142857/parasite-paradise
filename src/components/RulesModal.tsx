import React, { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rules from '../content/game-rules.md?raw'

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, onOpen }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <>
      {/* Top-left persistent floating button */}
      <button 
        className="rules-trigger-btn" 
        onClick={onOpen}
        title="查看游戏规则"
      >
        <span className="btn-icon">📖</span>
        <span className="btn-text">游戏规则</span>
      </button>

      {/* Fullscreen Rules Modal */}
      {isOpen && (
        <div className="rules-modal-overlay" onClick={onClose}>
          <div 
            className="rules-modal-container" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rules-modal-header">
              <div className="rules-modal-title">
                <span className="header-icon">📜</span>
                <h2>飞船争夺版杀游戏规则</h2>
              </div>
              <button className="rules-modal-close-btn" onClick={onClose} aria-label="关闭规则">
                ✕ 关闭
              </button>
            </div>
            
            <div className="rules-modal-body">
              <article className="rules-document">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{rules}</ReactMarkdown>
              </article>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
