import { useState, useEffect, useRef } from 'react'

interface TypewriterTextProps {
    text: string
    speed?: number
    onComplete?: () => void
    className?: string
}

function TypewriterText({ text, speed = 30, onComplete, className }: TypewriterTextProps) {
    const [displayed, setDisplayed] = useState('')
    const indexRef = useRef(0)

    useEffect(() => {
        setDisplayed('')
        indexRef.current = 0

        const interval = setInterval(() => {
            if (indexRef.current < text.length) {
                indexRef.current++
                setDisplayed(text.slice(0, indexRef.current))
            } else {
                clearInterval(interval)
                onComplete?.()
            }
        }, speed)

        return () => clearInterval(interval)
    }, [text, speed, onComplete])

    return (
        <span className={className}>
            {displayed}
            {indexRef.current < text.length && <span className="typewriter-cursor">|</span>}
        </span>
    )
}

export default TypewriterText
