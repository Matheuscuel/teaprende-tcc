"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Penguin from "@/app/_components/Penguin";
import BackButton from "@/app/components/BackButton";

// Imagens SVG para os diferentes níveis do quebra-cabeça - versões melhoradas e mais claras
const PUZZLE_LEVELS = [
  {
    id: 1,
    name: "Pinguim e Balões",
    image: `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <!-- Céu azul claro -->
  <rect width="600" height="400" fill="#87CEEB"/>
  
  <!-- Sol grande amarelo -->
  <circle cx="500" cy="100" r="80" fill="#FFD700" stroke="#FFA500" stroke-width="5"/>
  <circle cx="500" cy="100" r="70" fill="#FFEB3B"/>
  
  <!-- Nuvens brancas grandes -->
  <ellipse cx="100" cy="80" rx="60" ry="50" fill="#FFFFFF" opacity="0.95"/>
  <ellipse cx="140" cy="80" rx="70" ry="60" fill="#FFFFFF" opacity="0.95"/>
  <ellipse cx="180" cy="80" rx="60" ry="50" fill="#FFFFFF" opacity="0.95"/>
  
  <!-- Grama verde -->
  <rect y="400" width="600" height="200" fill="#4CAF50"/>
  
  <!-- Balão vermelho grande -->
  <ellipse cx="120" cy="250" rx="50" ry="70" fill="#F44336" stroke="#C62828" stroke-width="4"/>
  <path d="M 120 320 L 120 380" stroke="#C62828" stroke-width="5" stroke-linecap="round"/>
  <circle cx="120" cy="250" r="15" fill="#FFFFFF" opacity="0.8"/>
  
  <!-- Balão azul grande -->
  <ellipse cx="250" cy="220" rx="50" ry="70" fill="#2196F3" stroke="#1565C0" stroke-width="4"/>
  <path d="M 250 290 L 250 350" stroke="#1565C0" stroke-width="5" stroke-linecap="round"/>
  <circle cx="250" cy="220" r="15" fill="#FFFFFF" opacity="0.8"/>
  
  <!-- Balão roxo grande -->
  <ellipse cx="380" cy="240" rx="50" ry="70" fill="#9C27B0" stroke="#6A1B9A" stroke-width="4"/>
  <path d="M 380 310 L 380 370" stroke="#6A1B9A" stroke-width="5" stroke-linecap="round"/>
  <circle cx="380" cy="240" r="15" fill="#FFFFFF" opacity="0.8"/>
  
  <!-- Balão amarelo grande -->
  <ellipse cx="480" cy="260" rx="50" ry="70" fill="#FFC107" stroke="#F57C00" stroke-width="4"/>
  <path d="M 480 330 L 480 390" stroke="#F57C00" stroke-width="5" stroke-linecap="round"/>
  <circle cx="480" cy="260" r="15" fill="#FFFFFF" opacity="0.8"/>
  
  <!-- Pinguim grande no centro -->
  <!-- Corpo preto -->
  <ellipse cx="300" cy="450" rx="80" ry="100" fill="#212121"/>
  <!-- Barriga branca -->
  <ellipse cx="300" cy="460" rx="60" ry="75" fill="#FFFFFF"/>
  <!-- Olhos grandes -->
  <circle cx="280" cy="420" r="18" fill="#212121"/>
  <circle cx="320" cy="420" r="18" fill="#212121"/>
  <circle cx="282" cy="418" r="8" fill="#FFFFFF"/>
  <circle cx="322" cy="418" r="8" fill="#FFFFFF"/>
  <!-- Bico laranja -->
  <path d="M 285 445 L 300 465 L 315 445 Z" fill="#FF9800" stroke="#E65100" stroke-width="3"/>
  <!-- Asas -->
  <ellipse cx="240" cy="450" rx="25" ry="70" fill="#212121"/>
  <ellipse cx="360" cy="450" rx="25" ry="70" fill="#212121"/>
  <!-- Pés laranja -->
  <ellipse cx="270" cy="530" rx="25" ry="15" fill="#FF9800"/>
  <ellipse cx="330" cy="530" rx="25" ry="15" fill="#FF9800"/>
</svg>
`)}`
  },
  {
    id: 2,
    name: "Casa Colorida",
    image: `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <!-- Céu azul -->
  <rect width="600" height="400" fill="#4FC3F7"/>
  
  <!-- Sol amarelo -->
  <circle cx="480" cy="80" r="60" fill="#FFD700"/>
  
  <!-- Nuvens -->
  <ellipse cx="100" cy="100" rx="50" ry="40" fill="#FFFFFF" opacity="0.9"/>
  <ellipse cx="140" cy="100" rx="60" ry="50" fill="#FFFFFF" opacity="0.9"/>
  
  <!-- Grama verde -->
  <rect y="400" width="600" height="200" fill="#66BB6A"/>
  
  <!-- Casa grande -->
  <!-- Corpo marrom -->
  <rect x="200" y="280" width="200" height="180" fill="#8B4513" stroke="#654321" stroke-width="5" rx="5"/>
  
  <!-- Telhado vermelho -->
  <path d="M 180 280 L 300 180 L 420 280 Z" fill="#D32F2F" stroke="#B71C1C" stroke-width="5"/>
  
  <!-- Chaminé -->
  <rect x="320" y="160" width="40" height="60" fill="#5D4037"/>
  <rect x="315" y="155" width="50" height="20" fill="#3E2723"/>
  
  <!-- Porta marrom escura -->
  <rect x="250" y="360" width="100" height="100" fill="#5D4037" stroke="#3E2723" stroke-width="4" rx="5"/>
  <!-- Maçaneta -->
  <circle cx="330" cy="410" r="8" fill="#FFD700"/>
  
  <!-- Janela esquerda grande -->
  <rect x="220" y="300" width="60" height="60" fill="#81D4FA" stroke="#1976D2" stroke-width="4" rx="5"/>
  <line x1="250" y1="300" x2="250" y2="360" stroke="#1976D2" stroke-width="4"/>
  <line x1="220" y1="330" x2="280" y2="330" stroke="#1976D2" stroke-width="4"/>
  
  <!-- Janela direita grande -->
  <rect x="320" y="300" width="60" height="60" fill="#81D4FA" stroke="#1976D2" stroke-width="4" rx="5"/>
  <line x1="350" y1="300" x2="350" y2="360" stroke="#1976D2" stroke-width="4"/>
  <line x1="320" y1="330" x2="380" y2="330" stroke="#1976D2" stroke-width="4"/>
  
  <!-- Árvore grande à esquerda -->
  <rect x="80" y="340" width="50" height="100" fill="#5D4037"/>
  <circle cx="105" cy="320" r="70" fill="#2E7D32"/>
  <circle cx="60" cy="310" r="50" fill="#388E3C"/>
  <circle cx="150" cy="310" r="50" fill="#388E3C"/>
  
  <!-- Árvore menor à direita -->
  <rect x="470" y="360" width="40" height="80" fill="#5D4037"/>
  <circle cx="490" cy="340" r="60" fill="#2E7D32"/>
  <circle cx="450" cy="330" r="45" fill="#388E3C"/>
  <circle cx="530" cy="330" r="45" fill="#388E3C"/>
</svg>
`)}`
  },
  {
    id: 3,
    name: "Arco-íris",
    image: `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <!-- Céu azul claro -->
  <rect width="600" height="400" fill="#B3E5FC"/>
  
  <!-- Sol amarelo grande -->
  <circle cx="500" cy="100" r="70" fill="#FFD700"/>
  <circle cx="500" cy="100" r="60" fill="#FFEB3B"/>
  
  <!-- Nuvens grandes -->
  <ellipse cx="150" cy="90" rx="60" ry="50" fill="#FFFFFF" opacity="0.95"/>
  <ellipse cx="190" cy="90" rx="70" ry="60" fill="#FFFFFF" opacity="0.95"/>
  <ellipse cx="230" cy="90" rx="60" ry="50" fill="#FFFFFF" opacity="0.95"/>
  
  <!-- Grama verde -->
  <rect y="400" width="600" height="200" fill="#66BB6A"/>
  
  <!-- Arco-íris grande e colorido -->
  <path d="M 80 380 Q 300 250 520 380" stroke="#F44336" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M 90 390 Q 300 260 510 390" stroke="#FF9800" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M 100 400 Q 300 270 500 400" stroke="#FFEB3B" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M 110 410 Q 300 280 490 410" stroke="#4CAF50" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M 120 420 Q 300 290 480 420" stroke="#2196F3" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M 130 430 Q 300 300 470 430" stroke="#3F51B5" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M 140 440 Q 300 310 460 440" stroke="#9C27B0" stroke-width="18" fill="none" stroke-linecap="round"/>
  
  <!-- Nuvem pequena -->
  <ellipse cx="350" cy="150" rx="40" ry="35" fill="#FFFFFF" opacity="0.9"/>
  <ellipse cx="380" cy="150" rx="45" ry="40" fill="#FFFFFF" opacity="0.9"/>
</svg>
`)}`
  },
  {
    id: 4,
    name: "Estrelas e Lua",
    image: `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <!-- Céu noturno azul escuro -->
  <rect width="600" height="400" fill="#1A237E"/>
  
  <!-- Lua grande -->
  <circle cx="480" cy="120" r="70" fill="#FFF9C4"/>
  <circle cx="460" cy="100" r="65" fill="#1A237E"/>
  
  <!-- Estrelas grandes e brilhantes -->
  <path d="M 100 150 L 110 175 L 140 175 L 115 190 L 125 215 L 100 200 L 75 215 L 85 190 L 60 175 L 90 175 Z" fill="#FFD700" stroke="#FFA000" stroke-width="2"/>
  <path d="M 200 100 L 208 120 L 230 120 L 212 135 L 220 155 L 200 145 L 180 155 L 188 135 L 170 120 L 192 120 Z" fill="#FFD700" stroke="#FFA000" stroke-width="2"/>
  <path d="M 350 80 L 358 100 L 380 100 L 362 115 L 370 135 L 350 125 L 330 135 L 338 115 L 320 100 L 342 100 Z" fill="#FFD700" stroke="#FFA000" stroke-width="2"/>
  <path d="M 150 250 L 160 275 L 190 275 L 165 290 L 175 315 L 150 300 L 125 315 L 135 290 L 110 275 L 140 275 Z" fill="#FFD700" stroke="#FFA000" stroke-width="2"/>
  <path d="M 450 200 L 460 225 L 490 225 L 465 240 L 475 265 L 450 250 L 425 265 L 435 240 L 410 225 L 440 225 Z" fill="#FFD700" stroke="#FFA000" stroke-width="2"/>
  
  <!-- Grama verde escura -->
  <rect y="400" width="600" height="200" fill="#2E7D32"/>
  
  <!-- Pinguim grande no centro -->
  <ellipse cx="300" cy="450" rx="70" ry="90" fill="#212121"/>
  <ellipse cx="300" cy="460" rx="55" ry="70" fill="#FFFFFF"/>
  <circle cx="285" cy="430" r="16" fill="#212121"/>
  <circle cx="315" cy="430" r="16" fill="#212121"/>
  <circle cx="287" cy="428" r="7" fill="#FFFFFF"/>
  <circle cx="317" cy="428" r="7" fill="#FFFFFF"/>
  <path d="M 290 450 L 300 470 L 310 450 Z" fill="#FF9800"/>
  <ellipse cx="270" cy="530" rx="28" ry="18" fill="#FF9800"/>
  <ellipse cx="330" cy="530" rx="28" ry="18" fill="#FF9800"/>
</svg>
`)}`
  },
  {
    id: 5,
    name: "Flores e Borboletas",
    image: `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <!-- Céu azul claro -->
  <rect width="600" height="400" fill="#E3F2FD"/>
  
  <!-- Sol amarelo -->
  <circle cx="500" cy="90" r="50" fill="#FFD700"/>
  
  <!-- Grama verde -->
  <rect y="400" width="600" height="200" fill="#81C784"/>
  
  <!-- Flor grande rosa -->
  <circle cx="150" cy="300" r="35" fill="#E91E63"/>
  <circle cx="150" cy="300" r="25" fill="#FFD700"/>
  <circle cx="150" cy="300" r="15" fill="#E91E63"/>
  <!-- Pétalas -->
  <circle cx="120" cy="300" r="20" fill="#F06292"/>
  <circle cx="180" cy="300" r="20" fill="#F06292"/>
  <circle cx="150" cy="270" r="20" fill="#F06292"/>
  <circle cx="150" cy="330" r="20" fill="#F06292"/>
  
  <!-- Flor roxa -->
  <circle cx="280" cy="320" r="30" fill="#9C27B0"/>
  <circle cx="280" cy="320" r="20" fill="#FFD700"/>
  <circle cx="255" cy="320" r="18" fill="#BA68C8"/>
  <circle cx="305" cy="320" r="18" fill="#BA68C8"/>
  <circle cx="280" cy="295" r="18" fill="#BA68C8"/>
  <circle cx="280" cy="345" r="18" fill="#BA68C8"/>
  
  <!-- Flor azul -->
  <circle cx="400" cy="310" r="32" fill="#2196F3"/>
  <circle cx="400" cy="310" r="22" fill="#FFD700"/>
  <circle cx="375" cy="310" r="19" fill="#64B5F6"/>
  <circle cx="425" cy="310" r="19" fill="#64B5F6"/>
  <circle cx="400" cy="285" r="19" fill="#64B5F6"/>
  <circle cx="400" cy="335" r="19" fill="#64B5F6"/>
  
  <!-- Borboleta rosa grande -->
  <ellipse cx="200" cy="200" rx="45" ry="30" fill="#E91E63"/>
  <ellipse cx="230" cy="200" rx="45" ry="30" fill="#E91E63"/>
  <ellipse cx="215" cy="190" rx="30" ry="20" fill="#F06292"/>
  <circle cx="215" cy="190" r="8" fill="#212121"/>
  
  <!-- Borboleta roxa grande -->
  <ellipse cx="350" cy="180" rx="45" ry="30" fill="#9C27B0"/>
  <ellipse cx="380" cy="180" rx="45" ry="30" fill="#9C27B0"/>
  <ellipse cx="365" cy="170" rx="30" ry="20" fill="#BA68C8"/>
  <circle cx="365" cy="170" r="8" fill="#212121"/>
  
  <!-- Borboleta azul grande -->
  <ellipse cx="450" cy="220" rx="45" ry="30" fill="#2196F3"/>
  <ellipse cx="480" cy="220" rx="45" ry="30" fill="#2196F3"/>
  <ellipse cx="465" cy="210" rx="30" ry="20" fill="#64B5F6"/>
  <circle cx="465" cy="210" r="8" fill="#212121"/>
</svg>
`)}`
  }
];

// Função para obter níveis desbloqueados do localStorage
function getUnlockedLevels() {
  if (typeof window === 'undefined') return [1];
  const saved = localStorage.getItem('puzzle_unlocked_levels');
  return saved ? JSON.parse(saved) : [1];
}

// Função para salvar níveis desbloqueados
function saveUnlockedLevels(levels) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('puzzle_unlocked_levels', JSON.stringify(levels));
}

// Função para desbloquear próximo nível
function unlockNextLevel(currentLevel) {
  const unlocked = getUnlockedLevels();
  const nextLevel = currentLevel + 1;
  if (!unlocked.includes(nextLevel) && nextLevel <= PUZZLE_LEVELS.length) {
    const newUnlocked = [...unlocked, nextLevel];
    saveUnlockedLevels(newUnlocked);
    return newUnlocked;
  }
  return unlocked;
}

function PuzzleGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const childId = searchParams?.get('childId') || 1;
  
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gridSize] = useState(3); // 3x3 grid
  const [swappingPieces, setSwappingPieces] = useState(new Set());
  
  // Estados para drag and drop
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOverPiece, setDragOverPiece] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Estados para níveis
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false);

  // Inicializar níveis desbloqueados e escolher nível aleatório
  useEffect(() => {
    const unlocked = getUnlockedLevels();
    setUnlockedLevels(unlocked);
    
    // Escolher um nível aleatório dos desbloqueados
    const randomLevel = unlocked[Math.floor(Math.random() * unlocked.length)];
    setCurrentLevel(randomLevel);
  }, []);

  // Inicializar peças do quebra-cabeça quando o nível mudar
  useEffect(() => {
    if (currentLevel) {
      initializePuzzle();
      setCompleted(false);
      setShowLevelComplete(false);
      setNextLevelUnlocked(false);
    }
  }, [currentLevel]);

  function initializePuzzle() {
    const totalPieces = gridSize * gridSize;
    const newPieces = [];
    
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
      });
    }
    
    // Embaralhar as peças
    const shuffled = [...newPieces].sort(() => Math.random() - 0.5);
    shuffled.forEach((piece, index) => {
      piece.currentPosition = index;
    });
    
    setPieces(shuffled);
    setCompleted(false);
    setMoves(0);
    setSelectedPiece(null);
    setSwappingPieces(new Set());
  }

  // Função para trocar duas peças
  function swapPieces(piece1Id, piece2Id) {
    if (completed || piece1Id === piece2Id) return;
    
    const newPieces = [...pieces];
    const piece1Index = newPieces.findIndex(p => p.id === piece1Id);
    const piece2Index = newPieces.findIndex(p => p.id === piece2Id);
    
    if (piece1Index === -1 || piece2Index === -1) return;
    
    // Trocar as posições no array (isso muda onde elas aparecem no grid)
    const temp = newPieces[piece1Index];
    newPieces[piece1Index] = newPieces[piece2Index];
    newPieces[piece2Index] = temp;
    
    // Marcar peças como "swapping" para animação
    setSwappingPieces(new Set([piece1Id, piece2Id]));
    
    // Pequeno delay para animação visual
    setTimeout(() => {
      setPieces(newPieces);
      setMoves(prev => prev + 1);
      setSwappingPieces(new Set());
      
      // Verificar se está completo
      checkCompletion(newPieces);
    }, 150);
  }

  function handlePieceClick(piece) {
    if (completed || isDragging) return;
    
    if (selectedPiece === null) {
      setSelectedPiece(piece.id);
    } else if (selectedPiece === piece.id) {
      setSelectedPiece(null);
    } else {
      swapPieces(selectedPiece, piece.id);
      setSelectedPiece(null);
    }
  }

  // Handlers para drag and drop
  function handleDragStart(e, piece) {
    if (completed) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDraggedPiece(piece);
    setSelectedPiece(null);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Posição inicial do cursor relativa ao centro da peça
    setDragPosition({
      x: clientX,
      y: clientY,
    });
  }

  function handleDragMove(e) {
    if (!isDragging || !draggedPiece) return;
    
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setDragPosition({
      x: clientX,
      y: clientY,
    });

    // Verificar sobre qual peça o cursor está
    const elementBelow = document.elementFromPoint(clientX, clientY);
    if (elementBelow) {
      const pieceButton = elementBelow.closest('button[data-piece-id]');
      if (pieceButton) {
        const pieceId = parseInt(pieceButton.dataset.pieceId);
        if (pieceId !== draggedPiece.id) {
          setDragOverPiece(pieceId);
        } else {
          setDragOverPiece(null);
        }
      } else {
        setDragOverPiece(null);
      }
    }
  }

  function handleDragEnd(e) {
    if (!isDragging || !draggedPiece) return;
    
    e.preventDefault();
    
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    
    const elementBelow = document.elementFromPoint(clientX, clientY);
    if (elementBelow) {
      const pieceButton = elementBelow.closest('button[data-piece-id]');
      if (pieceButton) {
        const targetPieceId = parseInt(pieceButton.dataset.pieceId);
        if (targetPieceId !== draggedPiece.id) {
          swapPieces(draggedPiece.id, targetPieceId);
        }
      }
    }
    
    setIsDragging(false);
    setDraggedPiece(null);
    setDragOverPiece(null);
    setDragPosition({ x: 0, y: 0 });
  }

  // Adicionar listeners globais para drag
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => handleDragMove(e);
      const handleMouseUp = (e) => handleDragEnd(e);
      const handleTouchMove = (e) => handleDragMove(e);
      const handleTouchEnd = (e) => handleDragEnd(e);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, draggedPiece]);

  function checkCompletion(piecesToCheck) {
    const isComplete = piecesToCheck.every((piece, index) => 
      piece.correctPosition === index
    );
    
    if (isComplete) {
      setCompleted(true);
      setShowLevelComplete(true);
      
      // Desbloquear próximo nível
      const newUnlocked = unlockNextLevel(currentLevel);
      setUnlockedLevels(newUnlocked);
      
      if (newUnlocked.length > unlockedLevels.length) {
        setNextLevelUnlocked(true);
      }
    }
  }

  // Obter imagem do nível atual
  const currentLevelData = PUZZLE_LEVELS.find(level => level.id === currentLevel);
  const puzzleImageUrl = currentLevelData?.image || PUZZLE_LEVELS[0].image;

  // Função para calcular o estilo de fundo de cada peça usando correctPosition
  const getTileBackgroundStyle = (piece, rows, cols, imageUrl) => {
    // Usar sempre correctPosition para determinar qual parte da imagem mostrar
    const correctRow = Math.floor(piece.correctPosition / cols);
    const correctCol = piece.correctPosition % cols;
    
    // Cada peça representa uma fração da imagem
    // Para um grid 3x3: cada peça é 1/3 da largura e 1/3 da altura
    const pieceWidthPercent = 100 / cols; // 33.333% para grid 3x3
    const pieceHeightPercent = 100 / rows; // 33.333% para grid 3x3
    
    // A imagem completa será redimensionada para ocupar (cols * 100)% x (rows * 100)%
    // Isso significa que cada peça mostrará exatamente 1/(cols*rows) da imagem original
    
    // Para mostrar a peça correta, precisamos posicionar a imagem de forma que:
    // - A peça na posição (0,0) mostra a parte superior esquerda da imagem
    // - A peça na posição (0,1) mostra a parte superior central da imagem
    // - A peça na posição (1,0) mostra a parte central esquerda da imagem
    // etc.
    
    // O backgroundPosition é calculado em porcentagem do tamanho da imagem de fundo
    // Para mostrar a coluna correta: mover -correctCol * pieceWidthPercent
    // Para mostrar a linha correta: mover -correctRow * pieceHeightPercent
    
    return {
      backgroundImage: `url("${imageUrl}")`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition: `${-correctCol * pieceWidthPercent}% ${-correctRow * pieceHeightPercent}%`,
    };
  };
  
  // Função para calcular clip-path de cada peça com formato de quebra-cabeça
  const getTileClipPath = (piece, gridSize) => {
    const correctRow = Math.floor(piece.correctPosition / gridSize);
    const correctCol = piece.correctPosition % gridSize;
    
    // Criar formas de encaixe (tabs e blanks) para cada borda
    // Tab = saliência (convexo), Blank = reentrância (côncavo)
    
    // Determinar quais bordas têm tabs ou blanks baseado na posição
    // Garantir que peças adjacentes tenham formas complementares
    const hasTopTab = correctRow > 0 && correctCol % 2 === 0;
    const hasRightTab = correctCol < gridSize - 1 && correctRow % 2 === 1;
    const hasBottomTab = correctRow < gridSize - 1 && correctCol % 2 === 0;
    const hasLeftTab = correctCol > 0 && correctRow % 2 === 1;
    
    // Tamanho do tab em porcentagem
    const tabSize = 12; // 12% da largura/altura da peça
    const tabWidth = 40; // Largura do tab em porcentagem
    
    // Construir pontos do polígono de forma mais simples e precisa
    const points = [];
    
    // Topo esquerdo
    points.push(`0% 0%`);
    
    // Topo - antes do tab
    if (hasTopTab) {
      points.push(`${50 - tabWidth/2}% 0%`);
      points.push(`${50 - tabWidth/2}% ${tabSize}%`);
      points.push(`${50 - tabWidth/4}% ${tabSize * 1.5}%`);
      points.push(`${50 + tabWidth/4}% ${tabSize * 1.5}%`);
      points.push(`${50 + tabWidth/2}% ${tabSize}%`);
      points.push(`${50 + tabWidth/2}% 0%`);
    }
    
    // Topo direito
    points.push(`100% 0%`);
    
    // Direita - antes do tab
    if (hasRightTab) {
      points.push(`100% ${50 - tabWidth/2}%`);
      points.push(`${100 - tabSize}% ${50 - tabWidth/2}%`);
      points.push(`${100 - tabSize * 1.5}% ${50 - tabWidth/4}%`);
      points.push(`${100 - tabSize * 1.5}% ${50 + tabWidth/4}%`);
      points.push(`${100 - tabSize}% ${50 + tabWidth/2}%`);
      points.push(`100% ${50 + tabWidth/2}%`);
    }
    
    // Direita inferior
    points.push(`100% 100%`);
    
    // Fundo - antes do tab
    if (hasBottomTab) {
      points.push(`${50 + tabWidth/2}% 100%`);
      points.push(`${50 + tabWidth/2}% ${100 - tabSize}%`);
      points.push(`${50 + tabWidth/4}% ${100 - tabSize * 1.5}%`);
      points.push(`${50 - tabWidth/4}% ${100 - tabSize * 1.5}%`);
      points.push(`${50 - tabWidth/2}% ${100 - tabSize}%`);
      points.push(`${50 - tabWidth/2}% 100%`);
    }
    
    // Fundo esquerdo
    points.push(`0% 100%`);
    
    // Esquerda - antes do tab
    if (hasLeftTab) {
      points.push(`0% ${50 + tabWidth/2}%`);
      points.push(`${tabSize}% ${50 + tabWidth/2}%`);
      points.push(`${tabSize * 1.5}% ${50 + tabWidth/4}%`);
      points.push(`${tabSize * 1.5}% ${50 - tabWidth/4}%`);
      points.push(`${tabSize}% ${50 - tabWidth/2}%`);
      points.push(`0% ${50 - tabWidth/2}%`);
    }
    
    // Fechar o polígono (voltar ao início)
    points.push(`0% 0%`);
    
    const clipPathValue = `polygon(${points.join(', ')})`;
    
    return {
      clipPath: clipPathValue,
      WebkitClipPath: clipPathValue,
    };
  };

  // Classes base para as peças
  const baseTileClass = `
    relative
    overflow-hidden
    shadow-[0_8px_18px_rgba(15,23,42,0.06)]
    cursor-pointer
    transition-all
    duration-200
    ease-out
    hover:-translate-y-0.5
    hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)]
    w-full
    h-full
  `;

  const selectedClass = `
    ring-4 ring-amber-400
    shadow-[0_16px_40px_rgba(245,158,11,0.32)]
    scale-[1.03]
  `;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7EC]">
      {/* Cabeçalho existente */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-6 pb-2 flex flex-col gap-3 items-center">
        <BackButton href={`/kid/games?childId=${childId}`} />
        <div className="flex justify-center items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20">
            <Penguin size={240} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900">
            Quebra-Cabeça 🧩
          </h1>
        </div>
        <p className="text-xl sm:text-2xl text-blue-700 font-semibold">
          Clique nas peças para trocá-las e montar a imagem!
        </p>
      </header>

      {/* Card de Movimentos e Nível */}
      <div className="flex flex-col items-center mt-4">
        <div className="bg-white/80 rounded-2xl p-4 sm:p-6 shadow-lg w-full max-w-md">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-lg sm:text-xl font-bold text-blue-900">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              <span>Movimentos: <span className="text-blue-500">{moves}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>Nível: <span className="text-purple-500">{currentLevel}</span> - {currentLevelData?.name}</span>
            </div>
            {completed && (
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-2xl">✅</span>
                <span>Completo!</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Seletor de Níveis */}
        <div className="bg-white/80 rounded-2xl p-4 sm:p-6 shadow-lg w-full max-w-4xl mt-4">
          <h3 className="text-lg font-bold text-blue-900 mb-3 text-center">Escolha um Nível:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PUZZLE_LEVELS.map((level) => {
              const isUnlocked = unlockedLevels.includes(level.id);
              const isCurrent = currentLevel === level.id;
              
              return (
                <button
                  key={level.id}
                  onClick={() => {
                    if (isUnlocked) {
                      setCurrentLevel(level.id);
                      setCompleted(false);
                      setShowLevelComplete(false);
                      setNextLevelUnlocked(false);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`
                    p-3 rounded-xl font-bold text-sm transition-all duration-200
                    ${isUnlocked 
                      ? isCurrent
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-blue-400 hover:bg-blue-500 text-white hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-xl mb-1">{isUnlocked ? '🔓' : '🔒'}</div>
                    <div>Nível {level.id}</div>
                    <div className="text-xs mt-1">{level.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start">
        {/* Tabuleiro */}
        <div
          className="
            mx-auto
            mt-10
            w-full
            max-w-[800px]
            rounded-[32px]
            bg-white/95
            shadow-[0_18px_45px_rgba(15,23,42,0.10)]
            p-4
          "
          style={{
            height: "min(60vh, min(70vw, 520px))",
          }}
        >
          <div
            className="grid w-full h-full gap-3 relative"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {pieces.map((piece, index) => {
              const isSelected = selectedPiece === piece.id;
              const isCorrect = piece.correctPosition === index;
              const isSwapping = swappingPieces.has(piece.id);
              const isDragged = draggedPiece?.id === piece.id;
              const isDragOver = dragOverPiece === piece.id;
              
              // Calcular posição no grid baseado no índice atual (onde a peça está agora)
              const gridRow = Math.floor(index / gridSize) + 1;
              const gridCol = (index % gridSize) + 1;
              
              return (
                <div
                  key={piece.id}
                  className="relative"
                  style={{
                    gridRow: gridRow,
                    gridColumn: gridCol,
                  }}
                >
                  <button
                    data-piece-id={piece.id}
                    onClick={() => handlePieceClick(piece)}
                    onMouseDown={(e) => handleDragStart(e, piece)}
                    onTouchStart={(e) => handleDragStart(e, piece)}
                    disabled={completed || isSwapping}
                    aria-label={`Peça ${piece.id + 1}${isCorrect ? ' - Posição correta' : ''}`}
                    className={`
                      ${baseTileClass}
                      ${isSelected ? selectedClass : ''}
                      ${isCorrect ? 'ring-2 ring-emerald-400' : ''}
                      ${isSwapping ? 'opacity-75' : ''}
                      ${isDragOver ? 'ring-4 ring-blue-400 scale-105' : ''}
                      ${completed ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                      w-full h-full
                    `}
                    style={{
                      backgroundColor: "#F6F8FB",
                      ...(isDragged && {
                        opacity: 0.3,
                      }),
                      ...(!isDragged && isSwapping && {
                        transition: 'all 0.2s ease-out',
                      }),
                    }}
                  >
                    {/* Imagem usando background-image com clip-path para formato de quebra-cabeça */}
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        ...getTileBackgroundStyle(piece, gridSize, gridSize, puzzleImageUrl),
                        backgroundColor: '#F6F8FB',
                        ...getTileClipPath(piece, gridSize),
                      }}
                    />
                    {completed && isCorrect && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-2xl sm:text-3xl text-green-600 font-bold">✓</span>
                      </div>
                    )}
                  </button>
                  {/* Peça arrastada flutuante */}
                  {isDragged && (
                    <button
                      className={`
                        ${baseTileClass}
                        scale-110 shadow-2xl
                      `}
                      style={{
                        position: 'fixed',
                        left: `${dragPosition.x}px`,
                        top: `${dragPosition.y}px`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        width: '200px',
                        height: '200px',
                        backgroundColor: "#F6F8FB",
                      }}
                    >
                      <div 
                        className="absolute inset-0 overflow-hidden"
                        style={{
                          ...getTileBackgroundStyle(piece, gridSize, gridSize, puzzleImageUrl),
                          backgroundColor: '#F6F8FB',
                          ...getTileClipPath(piece, gridSize),
                        }}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dica e Botão Reiniciar */}
        <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-4xl px-4">
          {!completed && (
            <p className="text-center text-sm sm:text-base text-gray-600">
              💡 Dica: Arraste uma peça e solte sobre outra para trocá-las, ou clique duas vezes para trocar!
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={initializePuzzle}
              className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl sm:text-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              🔄 Reiniciar
            </button>
            {completed && (
              <button
                onClick={() => router.push(`/kid/games?childId=${childId}`)}
                className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-green-500 hover:bg-green-600 text-white font-bold text-xl sm:text-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                🎉 Próximo Jogo
              </button>
            )}
          </div>

          {/* Mensagem de vitória e desbloqueio */}
          {showLevelComplete && (
            <div className="bg-yellow-300 rounded-2xl p-6 sm:p-8 shadow-xl animate-bounce w-full max-w-2xl mt-4">
              <p className="text-4xl sm:text-5xl mb-2 text-center">🎉</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 text-center">
                Parabéns! Você completou o Nível {currentLevel}! 🌟
              </p>
              <p className="text-lg sm:text-xl text-blue-700 mt-2 text-center">
                Você completou em {moves} movimentos!
              </p>
              {nextLevelUnlocked && (
                <div className="mt-4 p-4 bg-green-400 rounded-xl">
                  <p className="text-xl font-bold text-white text-center">
                    🎊 Novo nível desbloqueado! 🎊
                  </p>
                  <p className="text-lg text-white text-center mt-2">
                    Nível {currentLevel + 1} agora está disponível!
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                {currentLevel < PUZZLE_LEVELS.length && unlockedLevels.includes(currentLevel + 1) && (
                  <button
                    onClick={() => {
                      setCurrentLevel(currentLevel + 1);
                      setCompleted(false);
                      setShowLevelComplete(false);
                      setNextLevelUnlocked(false);
                      initializePuzzle();
                    }}
                    className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xl sm:text-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    ➡️ Próximo Nível
                  </button>
                )}
                <button
                  onClick={() => {
                    setCompleted(false);
                    setShowLevelComplete(false);
                    setNextLevelUnlocked(false);
                    initializePuzzle();
                  }}
                  className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl sm:text-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  🔄 Jogar Novamente
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PuzzlePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4">
            <Penguin size={240} />
          </div>
          <p className="text-2xl font-bold text-blue-900">Carregando...</p>
        </div>
      </main>
    }>
      <PuzzleGame />
    </Suspense>
  );
}
