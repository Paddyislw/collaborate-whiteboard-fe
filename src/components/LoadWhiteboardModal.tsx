import React, { useState, useEffect } from 'react'

interface Whiteboard {
  id: string
  name: string
  createdAt: string
}

interface LoadWhiteboardModalProps {
  onLoad: (whiteboardId: string) => void
  onClose: () => void
  roomId: string
}

const LoadWhiteboardModal: React.FC<LoadWhiteboardModalProps> = ({ onLoad, onClose }) => {
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([])

  useEffect(() => {
    const fetchWhiteboards = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/whiteboards')
        const data = await response.json()
        setWhiteboards(data)
      } catch (error) {
        console.error('Error fetching whiteboards:', error)
      }
    }

    fetchWhiteboards()
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Load Whiteboard</h2>
        {whiteboards.length === 0 ? (
          <p>No saved whiteboards found.</p>
        ) : (
          <ul className="max-h-60 overflow-y-auto">
            {whiteboards.map((whiteboard) => (
              <li
                key={whiteboard.id}
                className="py-2 px-3 hover:bg-gray-100 cursor-pointer rounded-md"
                onClick={() => onLoad(whiteboard.id)}
              >
                <div className="font-semibold">{whiteboard.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(whiteboard.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoadWhiteboardModal

