import { useState, useCallback } from 'react'

const STORAGE_KEY = 'leadflow_onboarding'

export interface OnboardingData {
    primaryGoal: string
    role: string
    targetIndustry: string[]
    companySize: string
    targetTitles: string[]
    messageTone: string
}

const emptyData: OnboardingData = {
    primaryGoal: '',
    role: '',
    targetIndustry: [],
    companySize: '',
    targetTitles: [],
    messageTone: '',
}

function readStorage(): Partial<OnboardingData> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

function writeStorage(data: Partial<OnboardingData>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
        // localStorage unavailable
    }
}

export function useOnboardingStorage() {
    const [data, setData] = useState<Partial<OnboardingData>>(() => readStorage())

    const updateField = useCallback((key: keyof OnboardingData, value: string | string[]) => {
        setData(prev => {
            const next = { ...prev, [key]: value }
            writeStorage(next)
            return next
        })
    }, [])

    const getAll = useCallback((): OnboardingData => {
        const stored = readStorage()
        return { ...emptyData, ...stored }
    }, [])

    const clear = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch {
            // localStorage unavailable
        }
        setData({})
    }, [])

    return { data, updateField, getAll, clear }
}
