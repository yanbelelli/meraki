import { useState, useEffect } from 'react'

export default function Notification({ message, visible, onHide }) {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => onHide?.(), 3000)
            return () => clearTimeout(timer)
        }
    }, [visible, onHide])

    if (!visible) return null

    return (
        <div className="fixed top-24 right-6 z-[80] bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-[fadeInUp_300ms_ease-out] max-w-sm">
            <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">{message}</span>
        </div>
    )
}
