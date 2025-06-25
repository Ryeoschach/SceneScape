import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils'
import { ModalProps } from '../../types'

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className 
}: ModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-xl',
        'w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden',
        'transform transition-all duration-300',
        'animate-slide-up',
        className
      )}>
        {/* 头部 */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        )}
        
        {/* 内容 */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
