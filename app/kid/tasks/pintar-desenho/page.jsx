"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";

// Templates de desenho educativos e proporcionais
const DRAWING_TEMPLATES = {
  house: {
    name: "Casa",
    icon: "🏠",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">
      <!-- Corpo da casa -->
      <rect x="150" y="200" width="200" height="150" stroke="#111" stroke-width="4" fill="none" rx="2"/>
      <!-- Telhado -->
      <path d="M140 200 L250 120 L360 200 Z" stroke="#111" stroke-width="4" fill="none"/>
      <!-- Porta -->
      <rect x="200" y="280" width="60" height="70" stroke="#111" stroke-width="4" fill="none" rx="2"/>
      <circle cx="245" cy="315" r="3" stroke="#111" stroke-width="3" fill="none"/>
      <!-- Janela esquerda -->
      <rect x="170" y="220" width="40" height="40" stroke="#111" stroke-width="3" fill="none" rx="2"/>
      <line x1="190" y1="220" x2="190" y2="260" stroke="#111" stroke-width="2"/>
      <line x1="170" y1="240" x2="210" y2="240" stroke="#111" stroke-width="2"/>
      <!-- Janela direita -->
      <rect x="290" y="220" width="40" height="40" stroke="#111" stroke-width="3" fill="none" rx="2"/>
      <line x1="310" y1="220" x2="310" y2="260" stroke="#111" stroke-width="2"/>
      <line x1="290" y1="240" x2="330" y2="240" stroke="#111" stroke-width="2"/>
    </svg>`
  },
  flower: {
    name: "Flor",
    icon: "🌸",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">
      <!-- Centro da flor -->
      <circle cx="250" cy="180" r="25" stroke="#111" stroke-width="4" fill="none"/>
      <!-- Caule -->
      <line x1="250" y1="205" x2="250" y2="320" stroke="#111" stroke-width="5"/>
      <!-- Pétalas -->
      <ellipse cx="250" cy="180" rx="50" ry="35" transform="rotate(0 250 180)" stroke="#111" stroke-width="3" fill="none"/>
      <ellipse cx="250" cy="180" rx="50" ry="35" transform="rotate(45 250 180)" stroke="#111" stroke-width="3" fill="none"/>
      <ellipse cx="250" cy="180" rx="50" ry="35" transform="rotate(90 250 180)" stroke="#111" stroke-width="3" fill="none"/>
      <ellipse cx="250" cy="180" rx="50" ry="35" transform="rotate(135 250 180)" stroke="#111" stroke-width="3" fill="none"/>
      <!-- Folhas -->
      <path d="M250 250 Q220 240 210 260 Q220 250 250 260" stroke="#111" stroke-width="3" fill="none"/>
      <path d="M250 260 Q280 250 290 270 Q280 260 250 270" stroke="#111" stroke-width="3" fill="none"/>
    </svg>`
  },
  sun: {
    name: "Sol",
    icon: "☀️",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">
      <!-- Círculo central -->
      <circle cx="250" cy="200" r="60" stroke="#111" stroke-width="5" fill="none"/>
      <!-- Raios principais -->
      <line x1="250" y1="120" x2="250" y2="80" stroke="#111" stroke-width="6"/>
      <line x1="250" y1="280" x2="250" y2="320" stroke="#111" stroke-width="6"/>
      <line x1="120" y1="200" x2="80" y2="200" stroke="#111" stroke-width="6"/>
      <line x1="380" y1="200" x2="420" y2="200" stroke="#111" stroke-width="6"/>
      <!-- Raios diagonais -->
      <line x1="145" y1="145" x2="110" y2="110" stroke="#111" stroke-width="6"/>
      <line x1="355" y1="145" x2="390" y2="110" stroke="#111" stroke-width="6"/>
      <line x1="145" y1="255" x2="110" y2="290" stroke="#111" stroke-width="6"/>
      <line x1="355" y1="255" x2="390" y2="290" stroke="#111" stroke-width="6"/>
      <!-- Rosto -->
      <circle cx="230" cy="185" r="6" stroke="#111" stroke-width="3" fill="none"/>
      <circle cx="270" cy="185" r="6" stroke="#111" stroke-width="3" fill="none"/>
      <path d="M230 210 Q250 220 270 210" stroke="#111" stroke-width="4" fill="none"/>
    </svg>`
  },
  heart: {
    name: "Coração",
    icon: "❤️",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">
      <!-- Coração -->
      <path d="M250 160 Q200 120 160 160 Q160 200 200 240 Q250 300 300 240 Q340 200 340 160 Q300 120 250 160" 
            stroke="#111" stroke-width="5" fill="none"/>
    </svg>`
  },
  star: {
    name: "Estrela",
    icon: "⭐",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">
      <!-- Estrela de 5 pontas -->
      <path d="M250 100 L275 180 L360 180 L295 235 L320 320 L250 270 L180 320 L205 235 L140 180 L225 180 Z" 
            stroke="#111" stroke-width="5" fill="none"/>
    </svg>`
  }
};

export default function PintarDesenhoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childId = searchParams?.get("childId") || "1";
  
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [brushSize, setBrushSize] = useState(15);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("brush");
  const [selectedTemplate, setSelectedTemplate] = useState("house");
  const [hasUserDrawing, setHasUserDrawing] = useState(false);
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [startTime] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [customImage, setCustomImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

  const colors = [
    "#FF0000", "#FF4500", "#FFA500", "#FFD700", 
    "#00FF00", "#00CED1", "#0000FF", "#4169E1",
    "#8A2BE2", "#FF00FF", "#FF1493", "#FF69B4",
    "#000000", "#808080", "#FFFFFF", "#8B4513"
  ];

  // Converter SVG para data URL
  const getTemplateDataUrl = (templateKey) => {
    const template = DRAWING_TEMPLATES[templateKey];
    if (!template) return null;
    return `data:image/svg+xml,${encodeURIComponent(template.svg)}`;
  };

  useEffect(() => {
    loadDrawing();
  }, [selectedTemplate, customImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const padding = 32;
        const maxWidth = containerRect.width - padding;
        const maxHeight = containerRect.height - padding;
        
        // Manter proporção 4:3
        let newWidth = maxWidth;
        let newHeight = (newWidth * 3) / 4;
        
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = (newHeight * 4) / 3;
        }
        
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [selectedTemplate]);

  const loadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (customImage) {
      // Carregar imagem customizada
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.95;
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        setImageLoaded(true);
        saveToHistory();
      };
      img.onerror = () => {
        console.error('Erro ao carregar imagem');
        setImageLoaded(false);
      };
      img.src = customImage;
    } else if (selectedTemplate) {
      // Carregar template padrão
      const dataUrl = getTemplateDataUrl(selectedTemplate);
      if (dataUrl) {
        const img = new Image();
        img.onload = () => {
          // Centralizar o desenho com escala adequada
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          setImageLoaded(true);
          saveToHistory();
        };
        img.onerror = () => {
          console.error('Erro ao carregar template');
          setImageLoaded(false);
        };
        img.src = dataUrl;
      }
    }
  };

  const handleTemplateChange = (templateKey) => {
    // Confirmar se há desenho antes de trocar
    if (hasUserDrawing && !confirm('Trocar o modelo limpará seu desenho atual. Deseja continuar?')) {
      return;
    }
    
    setSelectedTemplate(templateKey);
    setCustomImage(null);
    setHistory([]);
    setHistoryIndex(-1);
    setHasUserDrawing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem!');
      return;
    }
    
    // Confirmar se há desenho antes de trocar
    if (hasUserDrawing && !confirm('Carregar uma nova imagem limpará seu desenho atual. Deseja continuar?')) {
      e.target.value = ''; // Reset input
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImage(event.target?.result);
      setHistory([]);
      setHistoryIndex(-1);
      setHasUserDrawing(false);
    };
    reader.readAsDataURL(file);
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistoryIndex(historyIndex - 1);
      };
      img.src = history[historyIndex - 1];
    }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    draw(e);
  };

  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const draw = (e) => {
    if (!isDrawing && !e.buttons && !e.touches) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pos = getEventPos(e);
    if (!pos) return;
    
    const ctx = canvas.getContext("2d");
    
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = selectedColor;
    }
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    if (isDrawing) {
      saveToHistory();
      setHasUserDrawing(true);
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (confirm('Tem certeza que deseja limpar o desenho?')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasUserDrawing(false);
      loadDrawing();
    }
  };

  const fillArea = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pos = getEventPos(e);
    if (!pos) return;
    
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixel(imageData, pos.x, pos.y);
    
    if (targetColor) {
      floodFill(ctx, imageData, pos.x, pos.y, targetColor, hexToRgb(selectedColor));
      saveToHistory();
      setHasUserDrawing(true);
    }
  };

  const getPixel = (imageData, x, y) => {
    const index = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    };
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const floodFill = (ctx, imageData, startX, startY, targetColor, fillColor) => {
    const stack = [[Math.floor(startX), Math.floor(startY)]];
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    while (stack.length) {
      const [x, y] = stack.pop();
      const index = (y * width + x) * 4;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      
      if (r === fillColor.r && g === fillColor.g && b === fillColor.b) continue;
      if (Math.abs(r - targetColor.r) > 10 || Math.abs(g - targetColor.g) > 10 || Math.abs(b - targetColor.b) > 10) continue;
      
      data[index] = fillColor.r;
      data[index + 1] = fillColor.g;
      data[index + 2] = fillColor.b;
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const getCursorStyle = () => {
    if (tool === "eraser") return "cursor-grab";
    if (tool === "fill") return "cursor-pointer";
    return "cursor-crosshair";
  };

  const currentCursor = getCursorStyle();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Container principal - max-width 1280px, centralizado */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-6 md:py-8">
        <BackButton href={`/kid/tasks?childId=${childId}`} />
        
        {/* Header */}
        <header className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 md:w-16 md:h-16">
              <Penguin size={160} />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
            Pintar o Desenho
          </h1>
        </header>

        {/* Barra de seleção de modelos */}
        <section className="bg-white rounded-2xl p-4 md:p-5 shadow-lg mb-6 md:mb-8 border border-blue-100">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {Object.entries(DRAWING_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleTemplateChange(key)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 transition-all text-2xl md:text-3xl flex items-center justify-center flex-shrink-0 ${
                  selectedTemplate === key && !customImage
                    ? "border-blue-600 scale-105 shadow-md bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-blue-400 hover:scale-105 bg-white"
                }`}
                title={template.name}
              >
                {template.icon}
              </button>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 transition-all text-xl md:text-2xl flex items-center justify-center flex-shrink-0 ${
                customImage
                  ? "border-blue-600 scale-105 shadow-md bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:scale-105 bg-gray-50"
              }`}
              title="Carregar imagem"
            >
              📁
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {customImage && (
              <button
                onClick={() => {
                  if (hasUserDrawing && !confirm('Remover a imagem limpará seu desenho atual. Deseja continuar?')) {
                    return;
                  }
                  setCustomImage(null);
                  setSelectedTemplate("house");
                  setHistory([]);
                  setHistoryIndex(-1);
                  setHasUserDrawing(false);
                }}
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-red-300 hover:border-red-500 bg-red-50 text-red-600 transition-all text-xl md:text-2xl flex items-center justify-center flex-shrink-0"
                title="Remover imagem"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Área principal: Canvas + Painel */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 mb-6 md:mb-8">
          
          {/* Canvas - 65-70% no desktop */}
          <div className="flex-[2] lg:flex-[2.5] bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-blue-200 min-h-[400px] flex items-center justify-center">
            <div className="w-full h-full max-h-[600px] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={375}
                className={`max-w-full max-h-full border-2 border-green-300 rounded-xl ${currentCursor} touch-none`}
                onMouseDown={tool === "fill" ? fillArea : startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={tool === "fill" ? fillArea : startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
              />
            </div>
          </div>

          {/* Painel lateral - 30-35% no desktop */}
          <div className="flex-[1] lg:flex-[1.5] bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-blue-200 flex flex-col gap-5 md:gap-6 min-w-0">
            
            {/* Ferramentas */}
            <div className="flex-shrink-0">
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🛠️</span> Ferramentas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTool("brush")}
                  className={`h-14 md:h-16 rounded-xl text-xl md:text-2xl font-semibold transition-all flex items-center justify-center ${
                    tool === "brush"
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="Pincel"
                >
                  🖌️
                </button>
                <button
                  onClick={() => setTool("eraser")}
                  className={`h-14 md:h-16 rounded-xl text-xl md:text-2xl font-semibold transition-all flex items-center justify-center ${
                    tool === "eraser"
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="Borracha"
                >
                  🧹
                </button>
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className={`h-14 md:h-16 rounded-xl text-xl md:text-2xl font-semibold transition-all flex items-center justify-center ${
                    historyIndex > 0
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  title="Desfazer"
                >
                  ↶
                </button>
                <button
                  onClick={() => setTool("fill")}
                  className={`h-14 md:h-16 rounded-xl text-xl md:text-2xl font-semibold transition-all flex items-center justify-center ${
                    tool === "fill"
                      ? "bg-pink-600 text-white shadow-md scale-105"
                      : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                  }`}
                  title="Preencher"
                >
                  🎨
                </button>
              </div>
            </div>

            {/* Paleta de Cores */}
            <div className="flex-1 min-h-0 flex flex-col">
              <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🎨</span> Cores
              </h3>
              <div className="grid grid-cols-4 gap-3 flex-1 overflow-y-auto p-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-full aspect-square rounded-full border-3 transition-all ${
                      selectedColor === color 
                        ? "border-gray-900 scale-110 shadow-lg ring-2 ring-gray-400" 
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Tamanho do Pincel */}
            <div className="flex-shrink-0 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm md:text-base font-bold text-gray-800 flex items-center gap-2">
                  <span>📏</span> Tamanho
                </h3>
                <span className="text-sm md:text-base text-gray-700 font-bold bg-white px-3 py-1 rounded-lg">
                  {brushSize}px
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Botões inferiores */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-3xl mx-auto">
          <button
            onClick={clearCanvas}
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-200 text-sm md:text-base shadow-lg transform hover:scale-105 active:scale-95"
          >
            🗑️ Limpar
          </button>
          <button
            onClick={async () => {
              setSaving(true);
              try {
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                
                const tasksResponse = await fetch(`${API_BASE}/tasks`, {
                  headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token") || "demo-token"}`
                  }
                });
                
                if (tasksResponse.ok) {
                  const tasksData = await tasksResponse.json();
                  const task = tasksData.tasks?.find(t => t.type === 'painting');
                  
                  if (task) {
                    await fetch(`${API_BASE}/tasks/${task.id}/progress`, {
                      method: 'POST',
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token") || "demo-token"}`
                      },
                      body: JSON.stringify({
                        child_id: Number(childId),
                        score: 100,
                        status: 'completed',
                        time_spent: timeSpent
                      })
                    });
                  }
                }
              } catch (error) {
                console.error('Erro ao salvar progresso:', error);
              } finally {
                setSaving(false);
                router.push(`/kid/tasks?childId=${childId}`);
              }
            }}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm md:text-base shadow-lg transform hover:scale-105 active:scale-95"
          >
            {saving ? "💾 Salvando..." : "✅ Finalizar"}
          </button>
          <button
            onClick={() => router.push(`/kid/tasks?childId=${childId}`)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-200 text-sm md:text-base shadow-lg transform hover:scale-105 active:scale-95"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </main>
  );
}
