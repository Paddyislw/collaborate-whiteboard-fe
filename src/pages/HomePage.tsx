import { useState, FormEvent } from 'react'
import Whiteboard from '../components/Whiteboard'

export default function Home() {
  const [roomId, setRoomId] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [joined, setJoined] = useState(false)
  const [errors, setErrors] = useState({ email: '', name: '' })

  const validateForm = () => {
    let isValid = true
    const newErrors = { email: '', name: '' }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleJoin = (e: FormEvent) => {
    e.preventDefault()
    if (validateForm() && roomId) {
      setJoined(true)
    }
  }

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const newRoomId = Math.random().toString(36).substring(7)
      setRoomId(newRoomId)
      setJoined(true)
    }
  }

  if (joined) {
    return <Whiteboard roomId={roomId} email={email} name={name} />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">Collaborative Whiteboard</h1>
        <form className="bg-white shadow-md rounded-lg p-8 space-y-6">
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">Room ID</label>
            <input
              id="roomId"
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <button 
            onClick={handleJoin}
            className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Join Room
          </button>
          <button 
            onClick={handleCreate}
            className="w-full px-4 py-2 text-green-600 bg-white border border-green-600 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Create New Room
          </button>
        </form>
      </div>
    </div>
  )
}

