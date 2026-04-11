import { useDispatch } from "react-redux";
import { register,login,getCurrentUser } from "../services/api.auth";
import { setUser ,setLoading,setError} from "../auth.slice";


export function useAuth() {
    const dispatch = useDispatch()

   async function handleRegister({email,username,password}) {
        try {
            dispatch(setLoading(true))
            const user = await register({email,username,password})
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Registration failed'))
        } finally {
            dispatch(setLoading(false))
        }

    }


    async function handleLogin({email,password}) {
        try {
            dispatch(setLoading(true))
            const user = await login({email,password})
            dispatch(setUser(user))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Login failed'))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function fetchCurrentUser() {
        try {
            dispatch(setLoading(true))
            const user = await getCurrentUser()
            dispatch(setUser(user))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Failed to fetch user'))
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {handleRegister,handleLogin,fetchCurrentUser}

}