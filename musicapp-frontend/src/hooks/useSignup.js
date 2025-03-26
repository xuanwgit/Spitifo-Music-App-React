import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import API_URL from '../config'

export const useSignup = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()

    const signup = async (email, password) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/api/user/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({email, password})
            })

            if (!response.ok) {
                const errorText = await response.text()
                try {
                    // Try to parse as JSON
                    const errorJson = JSON.parse(errorText)
                    throw new Error(errorJson.error || 'Signup failed')
                } catch (e) {
                    // If parsing fails, use the raw text
                    throw new Error(`Signup failed: ${errorText}`)
                }
            }

            const json = await response.json()

            // save user to local storage
            localStorage.setItem('user', JSON.stringify(json))
            
            // update Auth Context
            dispatch({type: 'LOGIN', payload: json})
            setIsLoading(false)
        } catch (err) {
            setError(err.message)
            setIsLoading(false)
        }
    }

    return {signup, isLoading, error}
} 