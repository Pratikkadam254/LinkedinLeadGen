import { useState, useEffect, useRef } from 'react'

interface TypewriterTextProps {
    text: string
    speed?: number
    onComplete?: () => void
    className?: string
}

function TypewriterText({ text, speed = 30, onComplete, className }: TypewriterTextProps) {
    const [displayed, setDisplayed] = useState('')
    const [isTyping, setIsTyping] = useState(true)
    const onCompleteRef = useRef(onComplete)
    onCompleteRef.current = onComplete

    useEffect(() => {
        setDisplayed('')
        setIsTyping(true)
        let index = 0

        const interval = setInterval(() => {
            if (index < text.length) {
                index++
                setDisplayed(text.slice(0, index))
            } else {
                clearInterval(interval)
                setIsTyping(false)
                onCompleteRef.current?.()
            }
        }, speed)

        return () => clearInterval(interval)
    }, [text, speed])

    return (
        <span className={className}>
            {displayed}
            {isTyping && <span className="typewriter-cursor">|</span>}
        </span>
    )
}

export default TypewriterText
