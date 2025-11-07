"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";

// Configuração de níveis/formações
const GAME_LEVELS = [
  {
    id: 1,
    name: "Quadrado",
    color: "#4169E1",
    points: [
      { id: 1, x: 100, y: 100, number: 1 },
      { id: 2, x: 300, y: 100, number: 2 },
      { id: 3, x: 300, y: 300, number: 3 },
      { id: 4, x: 100, y: 300, number: 4 }
    ]
  },
  {
    id: 2,
    name: "Triângulo",
    color: "#32CD32",
    points: [
      { id: 1, x: 250, y: 80, number: 1 },
      { id: 2, x: 150, y: 280, number: 2 },
      { id: 3, x: 350, y: 280, number: 3 }
    ]
  },
  {
    id: 3,
    name: "Casa",
    color: "#FF8C00",
    points: [
      { id: 1, x: 250, y: 80, number: 1 },
      { id: 2, x: 150, y: 150, number: 2 },
      { id: 3, x: 350, y: 150, number: 3 },
      { id: 4, x: 150, y: 300, number: 4 },
      { id: 5, x: 350, y: 300, number: 5 }
    ]
  },
  {
    id: 4,
    name: "Estrela",
    color: "#FFD700",
    points: [
      { id: 1, x: 250, y: 50, number: 1 },
      { id: 2, x: 300, y: 150, number: 2 },
      { id: 3, x: 400, y: 150, number: 3 },
      { id: 4, x: 325, y: 220, number: 4 },
      { id: 5, x: 350, y: 320, number: 5 },
      { id: 6, x: 250, y: 270, number: 6 },
      { id: 7, x: 150, y: 320, number: 7 },
      { id: 8, x: 175, y: 220, number: 8 },
      { id: 9, x: 100, y: 150, number: 9 },
      { id: 10, x: 200, y: 150, number: 10 }
    ]
  },
  {
    id: 5,
    name: "Coração",
    color: "#FF69B4",
    points: [
      { id: 1, x: 250, y: 120, number: 1 },
      { id: 2, x: 200, y: 100, number: 2 },
      { id: 3, x: 150, y: 120, number: 3 },
      { id: 4, x: 150, y: 180, number: 4 },
      { id: 5, x: 200, y: 250, number: 5 },
      { id: 6, x: 250, y: 300, number: 6 },
      { id: 7, x: 300, y: 250, number: 7 },
      { id: 8, x: 350, y: 180, number: 8 },
      { id: 9, x: 350, y: 120, number: 9 },
      { id: 10, x: 300, y: 100, number: 10 }
    ]
  }
];

export default function LigarPontosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childId = searchParams?.get("childId") || "1";
  
  const [points, setPoints] = useState([]);
  const [connectedPoints, setConnectedPoints] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastClicked, setLastClicked] = useState(null);
  const [errorFeedback, setErrorFeedback] = useState(false);
  const [animatingLine, setAnimatingLine] = useState(null);
  const [lineProgress, setLineProgress] = useState(0);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

  const currentLevel = GAME_LEVELS[level - 1] || GAME_LEVELS[0];

  useEffect(() => {
    setPoints(currentLevel.points);
    setConnectedPoints([]);
    setCompleted(false);
    setShowCelebration(false);
    setErrorFeedback(false);
    setLastClicked(null);
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    
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
    
    const draw = () => {
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calcular bounding box dos pontos para centralizar
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const minY = Math.min(...points.map(p => p.y));
      const maxY = Math.max(...points.map(p => p.y));
      
      const pointsWidth = maxX - minX || 200;
      const pointsHeight = maxY - minY || 200;
      const offsetX = (canvas.width - pointsWidth * scaleX) / 2 - minX * scaleX;
      const offsetY = (canvas.height - pointsHeight * scaleY) / 2 - minY * scaleY;
      
      // Desenhar linhas conectadas
      connectedPoints.forEach((point, index) => {
        if (index > 0) {
          const prevPoint = connectedPoints[index - 1];
          const startX = prevPoint.x * scaleX + offsetX;
          const startY = prevPoint.y * scaleY + offsetY;
          const endX = point.x * scaleX + offsetX;
          const endY = point.y * scaleY + offsetY;
          
          const isLastLine = index === connectedPoints.length - 1;
          const isAnimating = isLastLine && animatingLine && animatingLine.from === prevPoint.id && animatingLine.to === point.id;
          
          let drawEndX = endX;
          let drawEndY = endY;
          
          if (isAnimating) {
            drawEndX = startX + (endX - startX) * lineProgress;
            drawEndY = startY + (endY - startY) * lineProgress;
          }
          
          const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
          if (isLastLine && connectedPoints.length > 1) {
            gradient.addColorStop(0, "#00FF00");
            gradient.addColorStop(0.5, "#32CD32");
            gradient.addColorStop(1, "#228B22");
          } else {
            gradient.addColorStop(0, currentLevel.color);
            gradient.addColorStop(1, currentLevel.color);
          }
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(drawEndX, drawEndY);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 6;
          ctx.lineCap = "round";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(65, 105, 225, 0.4)";
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          if (isAnimating && lineProgress > 0) {
            ctx.beginPath();
            ctx.arc(drawEndX, drawEndY, 8, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.shadowBlur = 12;
            ctx.shadowColor = currentLevel.color;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });
      
      // Preencher forma quando completa
      if (completed && connectedPoints.length === points.length && connectedPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(
          connectedPoints[0].x * scaleX + offsetX,
          connectedPoints[0].y * scaleY + offsetY
        );
        connectedPoints.forEach(point => {
          ctx.lineTo(point.x * scaleX + offsetX, point.y * scaleY + offsetY);
        });
        ctx.closePath();
        ctx.fillStyle = `${currentLevel.color}20`;
        ctx.fill();
      }
      
      // Desenhar pontos
      points.forEach((point) => {
        const isConnected = connectedPoints.some(p => p.id === point.id);
        const isLastClicked = lastClicked?.id === point.id;
        const isNext = !isConnected && point.number === connectedPoints.length + 1;
        
        const x = point.x * scaleX + offsetX;
        const y = point.y * scaleY + offsetY;
        const radius = isLastClicked ? 26 : (isConnected ? 24 : (isNext ? 22 : 20));
        
        // Pulso para próximo ponto
        if (isNext && !isLastClicked) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = `${currentLevel.color}60`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        
        // Sombra
        ctx.beginPath();
        ctx.arc(x, y + 3, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fill();
        
        // Ponto principal
        const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        if (isConnected) {
          gradient.addColorStop(0, "#00FF7F");
          gradient.addColorStop(0.7, "#32CD32");
          gradient.addColorStop(1, "#228B22");
        } else if (isLastClicked) {
          gradient.addColorStop(0, "#FFD700");
          gradient.addColorStop(0.5, "#FFA500");
          gradient.addColorStop(1, "#FF8C00");
        } else if (isNext) {
          gradient.addColorStop(0, currentLevel.color);
          gradient.addColorStop(0.7, currentLevel.color);
          gradient.addColorStop(1, currentLevel.color);
        } else {
          gradient.addColorStop(0, "#FFD700");
          gradient.addColorStop(0.7, "#FFA500");
          gradient.addColorStop(1, "#FF8C00");
        }
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Borda
        ctx.strokeStyle = isConnected ? "#006400" : (isNext ? currentLevel.color : "#1B1B1B");
        ctx.lineWidth = isLastClicked ? 4 : (isConnected ? 3 : 2);
        ctx.stroke();
        
        // Brilho no conectado
        if (isConnected) {
          ctx.beginPath();
          ctx.arc(x - radius/3, y - radius/3, radius/2.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.fill();
        }
        
        // Número
        ctx.fillStyle = isConnected ? "#FFFFFF" : "#1B1B1B";
        const fontSize = isLastClicked ? 20 : (isConnected ? 18 : (isNext ? 17 : 16));
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 2;
        ctx.shadowColor = isConnected ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.9)";
        ctx.fillText(point.number.toString(), x, y);
        ctx.shadowBlur = 0;
      });
    };
    
    // Usar requestAnimationFrame para suavizar o redesenho
    const animationId = requestAnimationFrame(draw);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [points, connectedPoints, lastClicked, animatingLine, lineProgress, completed, currentLevel]);

  const animateLineConnection = (fromPoint, toPoint) => {
    setAnimatingLine({ from: fromPoint.id, to: toPoint.id });
    setLineProgress(0);
    
    const duration = 500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      setLineProgress(easedProgress);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setAnimatingLine(null);
          setLineProgress(0);
        }, 50);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handlePointClick = (point) => {
    if (completed) return;
    
    setLastClicked(point);
    setTimeout(() => setLastClicked(null), 400);
    
    const isFirstPoint = connectedPoints.length === 0;
    const isNextInSequence = isFirstPoint 
      ? point.number === 1 
      : point.number === connectedPoints.length + 1;
    
    if (isNextInSequence) {
      const prevPoint = connectedPoints[connectedPoints.length - 1];
      const newConnected = [...connectedPoints, point];
      
      if (prevPoint) {
        animateLineConnection(prevPoint, point);
      }
      
      setTimeout(() => {
        setConnectedPoints(newConnected);
        setErrorFeedback(false);
        
        if (newConnected.length === points.length) {
          const finalScore = score + 10 * level;
          setCompleted(true);
          setScore(finalScore);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
          saveProgress(finalScore);
        }
      }, prevPoint ? 100 : 0);
    } else {
      // Feedback de erro suave
      setErrorFeedback(true);
      setTimeout(() => setErrorFeedback(false), 600);
    }
  };

  const saveProgress = async (finalScore) => {
    if (saving) return;
    
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
        const task = tasksData.tasks?.find(t => t.type === 'connect-dots');
        
        if (task) {
          await fetch(`${API_BASE}/tasks/${task.id}/progress`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token") || "demo-token"}`
            },
            body: JSON.stringify({
              child_id: Number(childId),
              score: finalScore,
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
    }
  };

  const handleNextLevel = () => {
    if (level < GAME_LEVELS.length) {
      setLevel(level + 1);
    } else {
      router.push(`/kid/tasks?childId=${childId}`);
    }
  };

  const handleReset = () => {
    setConnectedPoints([]);
    setCompleted(false);
    setLastClicked(null);
    setErrorFeedback(false);
  };

  const progressPercentage = points.length > 0 ? (connectedPoints.length / points.length) * 100 : 0;
  const nextPointNumber = connectedPoints.length + 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Container principal - max-width 1280px, centralizado */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-6 md:py-8">
        <BackButton href={`/kid/tasks?childId=${childId}`} />
        
        {/* Header */}
        <header className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 md:w-16 md:h-16 transform transition-transform hover:scale-110">
              <Penguin size={160} />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">
            Ligar os Pontos
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Clique os pontos na ordem para revelar a forma!
          </p>
        </header>

        {/* Painel de Status - 3 cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Card Pontuação */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-blue-100 transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xl md:text-2xl">⭐</span>
              <h3 className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Pontuação
              </h3>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 text-center">
              {score}
            </p>
          </div>

          {/* Card Nível */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-blue-100">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xl md:text-2xl">🎯</span>
              <h3 className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Nível {level}
              </h3>
            </div>
            <p className="text-xl md:text-2xl font-bold text-orange-600 text-center">
              {currentLevel.name}
            </p>
          </div>

          {/* Card Progresso */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-blue-100 transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xl md:text-2xl">📊</span>
              <h3 className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Progresso
              </h3>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-green-600 text-center">
              {connectedPoints.length}/{points.length}
            </p>
          </div>
        </section>

        {/* Barra de Progresso Visual */}
        <div className="mb-6 md:mb-8 max-w-2xl mx-auto">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full transition-all duration-500 ease-out shadow-md"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Área do Jogo - Canvas */}
        <section className="mb-6 md:mb-8">
          <div className={`relative bg-white rounded-2xl p-4 md:p-6 shadow-lg border-2 transition-all duration-300 ${
            completed ? "border-green-400 ring-4 ring-green-200" : "border-blue-200"
          }`}>
            {showCelebration && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-br from-yellow-200 via-green-200 to-blue-200 bg-opacity-95 rounded-2xl animate-fade-in">
                <div className="text-6xl md:text-7xl animate-bounce mb-3">🎉</div>
                <div className="text-3xl md:text-4xl font-bold text-green-800 animate-pulse mb-2">
                  Parabéns!
                </div>
                <div className="text-xl md:text-2xl text-blue-800 text-center px-4">
                  Você formou um <strong>{currentLevel.name}</strong>!
                </div>
                <div className="flex gap-3 mt-4">
                  <span className="text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                  <span className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
                  <span className="text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎊</span>
                </div>
              </div>
            )}
            <div className="relative w-full aspect-[4/3] flex items-center justify-center min-h-[300px]">
              <canvas
                ref={canvasRef}
                width={500}
                height={375}
                className="max-w-full max-h-full cursor-pointer touch-none"
                onClick={(e) => {
                  const canvas = canvasRef.current;
                  if (!canvas || !points.length) return;
                  
                  const rect = canvas.getBoundingClientRect();
                  const scaleX = canvas.width / rect.width;
                  const scaleY = canvas.height / rect.height;
                  
                  const x = (e.clientX - rect.left) * scaleX;
                  const y = (e.clientY - rect.top) * scaleY;
                  
                  // Calcular offset para encontrar pontos
                  const minX = Math.min(...points.map(p => p.x));
                  const minY = Math.min(...points.map(p => p.y));
                  const maxX = Math.max(...points.map(p => p.x));
                  const maxY = Math.max(...points.map(p => p.y));
                  const pointsWidth = maxX - minX;
                  const pointsHeight = maxY - minY;
                  const offsetX = (canvas.width - pointsWidth * scaleX) / 2 - minX * scaleX;
                  const offsetY = (canvas.height - pointsHeight * scaleY) / 2 - minY * scaleY;
                  
                  const clickedPoint = points.find(point => {
                    const pointX = point.x * scaleX + offsetX;
                    const pointY = point.y * scaleY + offsetY;
                    const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
                    return distance < 35;
                  });
                  
                  if (clickedPoint) {
                    handlePointClick(clickedPoint);
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const canvas = canvasRef.current;
                  if (!canvas || !points.length) return;
                  
                  const touch = e.touches[0];
                  const rect = canvas.getBoundingClientRect();
                  const scaleX = canvas.width / rect.width;
                  const scaleY = canvas.height / rect.height;
                  
                  const x = (touch.clientX - rect.left) * scaleX;
                  const y = (touch.clientY - rect.top) * scaleY;
                  
                  const minX = Math.min(...points.map(p => p.x));
                  const minY = Math.min(...points.map(p => p.y));
                  const maxX = Math.max(...points.map(p => p.x));
                  const maxY = Math.max(...points.map(p => p.y));
                  const pointsWidth = maxX - minX;
                  const pointsHeight = maxY - minY;
                  const offsetX = (canvas.width - pointsWidth * scaleX) / 2 - minX * scaleX;
                  const offsetY = (canvas.height - pointsHeight * scaleY) / 2 - minY * scaleY;
                  
                  const clickedPoint = points.find(point => {
                    const pointX = point.x * scaleX + offsetX;
                    const pointY = point.y * scaleY + offsetY;
                    const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
                    return distance < 35;
                  });
                  
                  if (clickedPoint) {
                    handlePointClick(clickedPoint);
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Instruções */}
        <section className={`mb-6 md:mb-8 max-w-2xl mx-auto rounded-2xl p-4 md:p-5 shadow-lg border-2 transition-all duration-300 ${
          completed 
            ? "bg-gradient-to-r from-green-100 to-green-200 border-green-500 animate-pulse" 
            : errorFeedback
            ? "bg-gradient-to-r from-red-100 to-red-200 border-red-400 animate-shake"
            : "bg-gradient-to-r from-blue-100 to-blue-200 border-blue-400"
        }`}>
          <p className={`font-bold text-center text-base md:text-lg ${
            completed ? "text-green-800" : errorFeedback ? "text-red-800" : "text-blue-800"
          }`}>
            {completed 
              ? `🎉 Parabéns! Você formou um ${currentLevel.name}!`
              : errorFeedback
              ? "⚠️ Tente clicar no próximo ponto da sequência!"
              : `👉 Clique no ponto ${nextPointNumber} de ${points.length}`
            }
          </p>
        </section>

        {/* Botões */}
        <section className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-2xl mx-auto">
          <button
            onClick={handleReset}
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-200 text-sm md:text-base shadow-lg transform hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>Reiniciar</span>
          </button>
          {completed && (
            <button
              onClick={handleNextLevel}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-200 text-sm md:text-base shadow-lg transform hover:scale-105 hover:-translate-y-1 active:scale-95 animate-pulse flex items-center justify-center gap-2"
            >
              <span>{level < GAME_LEVELS.length ? "➡️" : "✅"}</span>
              <span>{level < GAME_LEVELS.length ? `Próximo: ${GAME_LEVELS[level]?.name || "Nível"}` : "Finalizar"}</span>
            </button>
          )}
          <button
            onClick={() => router.push(`/kid/tasks?childId=${childId}`)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-200 text-sm md:text-base shadow-lg transform hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>←</span>
            <span>Voltar</span>
          </button>
        </section>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </main>
  );
}
