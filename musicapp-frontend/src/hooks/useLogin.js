import { useState } from 'react'
import { useAuthContext } from './useAuthContext'

export const useLogin= () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()

    const login = async (email, password) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('https://spitifo-backend.onrender.com/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'omit',
                body: JSON.stringify({email, password})
            })

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const json = await response.json()
            
            //save user to local storage
            localStorage.setItem('user', JSON.stringify(json))
            //update Auth Context
            dispatch({type: 'LOGIN', payload: json})
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            setError(error.message)
        }
    }

    return {login, isLoading, error}
} 