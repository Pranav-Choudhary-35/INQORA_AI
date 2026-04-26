import './index.css'
import {router} from './app.routes.jsx';
import {RouterProvider} from 'react-router';
import { useAuth } from './features/auth/hook/useAuth.js';
import { useEffect } from 'react';

function App() {
  const  auth = useAuth()

  useEffect(() => {
    
    auth.fetchCurrentUser()
  
  }, [])

  return (
  <RouterProvider router={router}/>
  )
}

export default App
