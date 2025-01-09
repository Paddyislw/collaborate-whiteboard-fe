import { useState } from 'react'
import { ClipboardCopy, Check, Users, Mail, UserCircle } from 'lucide-react'

interface RoomInfoProps {
  roomId: string
  name: string
  email: string
  userId?: string
}

export default function RoomInfo({ roomId, name, email, userId }: RoomInfoProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-md w-full max-w-4xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Room: {roomId}</h2>
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              <span className="font-semibold mr-2">Name:</span> {name}
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-2 text-green-600" />
              <span className="font-semibold mr-2">Email:</span> {email}
            </div>
            {userId && (
              <div className="flex items-center text-gray-600">
                <UserCircle className="w-5 h-5 mr-2 text-green-600" />
                <span className="font-semibold mr-2">User ID:</span> {userId}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <button
            onClick={handleCopyRoomId}
            className={`px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center ${
              copied
                ? 'text-white bg-green-600 hover:bg-green-700'
                : 'text-green-600 bg-white border-2 border-green-600 hover:bg-green-50'
            }`}
          >
            {copied ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <ClipboardCopy className="w-5 h-5 mr-2" />
            )}
            <span className="font-semibold">{copied ? 'Copied!' : 'Copy Room ID'}</span>
          </button>
          <p className="text-sm text-gray-500 mt-2">Share ID to collaborate</p>
        </div>
      </div>
    </div>
  )
}

