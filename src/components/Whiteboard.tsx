import { Eraser, Save, FolderOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import SaveWhiteboardModal from "./SaveWhiteboardModal";
import LoadWhiteboardModal from "./LoadWhiteboardModal";
import RoomInfo from "./RoomInfo";

interface WhiteboardProps {
  roomId: string;
  email: string;
  name: string;
}

interface DrawData {
  x: number;
  y: number;
  color: string;
  brushSize: number;
  isEraser: boolean;
  roomId: string;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ roomId, email, name }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.emit("joinRoom", { roomId, email, name });

    newSocket.on("userCreated", (newUserId: string) => {
      setUserId(newUserId);
      localStorage.setItem("userId", newUserId);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, email, name]);

  useEffect(() => {
    if (!socket) return;

    const handleDraw = (data: DrawData) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.globalCompositeOperation = data.isEraser
        ? "destination-out"
        : "source-over";
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.brushSize;
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    };

    socket.on("draw", handleDraw);
    socket.on("whiteboardSaved", (whiteboardId) => {
      console.log(`Whiteboard saved with ID: ${whiteboardId}`);
      setSaveStatus("Whiteboard saved successfully!");
      //setSavedWhiteboards((prev) => [...prev, whiteboardId]);
      setTimeout(() => setSaveStatus(null), 3000);
    });
    socket.on("whiteboardSaveError", (error) => {
      console.error("Error saving whiteboard:", error);
      setSaveStatus("Failed to save whiteboard. Please try again.");
      setTimeout(() => setSaveStatus(null), 3000);
    });
    socket.on("clearWhiteboard", handleClearWhiteboard);
    socket.on("loadWhiteboard", handleLoadWhiteboard);

    return () => {
      socket.off("draw", handleDraw);
      socket.off("whiteboardSaved");
      socket.off("whiteboardSaveError");
      socket.off("whiteboards");
      socket.off("clearWhiteboard", handleClearWhiteboard);
      socket.off("loadWhiteboard", handleLoadWhiteboard);
    };
  }, [socket]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !socket) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    socket.emit("draw", { x, y, color, brushSize, isEraser, roomId });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSave = () => {
    setIsSaveModalOpen(true);
  };

  const handleLoad = () => {
    setIsLoadModalOpen(true);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (socket) {
      socket.emit("clearWhiteboard", roomId);
    }
  };

  const saveWhiteboard = (name: string) => {
    const canvas = canvasRef.current;
    if (!canvas || !socket) return;

    const imageData = canvas.toDataURL();
    socket.emit("saveWhiteboard", { roomId, imageData, name,userId });
    setIsSaveModalOpen(false);
    setSaveStatus("Saving whiteboard...");
  };

  const loadWhiteboard = (whiteboardId: string) => {
    if (!socket) return;
    socket.emit("loadWhiteboard", whiteboardId, roomId);
    setIsLoadModalOpen(false);
  };

  const handleClearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleLoadWhiteboard = (imageData: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageData;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-200 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setIsEraser(false);
              }}
              className="w-8 h-8 border-none rounded"
            />
            <select
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded"
            >
              <option value="2">Small</option>
              <option value="5">Medium</option>
              <option value="10">Large</option>
            </select>
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded ${
                isEraser
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-500 border border-blue-500"
              }`}
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none  transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            {
              <button
                onClick={handleLoad}
                className="px-4 py-2 text-green-500 bg-white border border-green-500 rounded hover:bg-green-50 focus:outline-none  transition-colors flex items-center"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Load
              </button>
            }
            <button
              onClick={handleClear}
              className="px-4 py-2 text-red-500 bg-white border border-red-500 rounded hover:bg-red-50 focus:outline-none transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="relative w-full" style={{ paddingTop: "75%" }}>
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full bg-white"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
        </div>
      </div>
      <RoomInfo
        email={email}
        name={name}
        roomId={roomId}
        userId={userId || ""}
      />
      {saveStatus && (
        <div
          className={`mt-4 p-2 rounded ${
            saveStatus.includes("success")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {saveStatus}
        </div>
      )}
      {isSaveModalOpen && (
        <SaveWhiteboardModal
          onSave={saveWhiteboard}
          onClose={() => setIsSaveModalOpen(false)}
        />
      )}
      {isLoadModalOpen && (
        <LoadWhiteboardModal
          onLoad={loadWhiteboard}
          onClose={() => setIsLoadModalOpen(false)}
          roomId={roomId}
        />
      )}
    </div>
  );
};

export default Whiteboard;
