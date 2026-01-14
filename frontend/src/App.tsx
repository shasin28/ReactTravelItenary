import { useEffect, useState } from 'react'

function App() {
  const [healthStatus, setHealthStatus] = useState('Unknown')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((result: { message: string }) => {
        setHealthStatus(result.message)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  if (isLoading) return <p>Loading...</p>
  return (
    <div className='text-2xl font-bold text-center min-h-screen flex items-center justify-center'>Health status: {healthStatus}</div>
  )
}

export default App
