import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { CheckCircle, Warning, XCircle, Info, X } from '@phosphor-icons/react'
import './Toast.css'

type ToastType = 'success' | 'warning' | 'error' | 'info'

interface Toast {
    id: string
    type: ToastType
    message: string
    exiting?: boolean
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = (type: ToastType, message: string) => {
        const id = crypto.randomUUID()
        setToasts(prev => [...prev, { id, type, message }])
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id))
        }, 200)
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container" role="status" aria-live="polite">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onRemove, 4000)
        return () => clearTimeout(timer)
    }, [onRemove])

    const icons = {
        success: <CheckCircle size={18} />,
        warning: <Warning size={18} />,
        error: <XCircle size={18} />,
        info: <Info size={18} />,
    }

    return (
        <div className={`toast toast-${toast.type}${toast.exiting ? ' toast--exiting' : ''}`}>
            <span className="toast-icon">{icons[toast.type]}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={onRemove} aria-label="Dismiss notification">
                <X size={14} />
            </button>
        </div>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
