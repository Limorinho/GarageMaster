import React, { useState, useEffect, useRef } from 'react';
import { Wrench, Clock, Star, Users, Coins, ShoppingCart, Info, X, Trophy, Target } from 'lucide-react';

// Import character profile pictures
import alexImg from './assets/alex.jpeg';
import samImg from './assets/sam.jpeg';
import jordanImg from './assets/jordan.jpg';
import caseyImg from './assets/casey.jpeg';
import rileyImg from './assets/riley.jpg';
import morganImg from './assets/morgan.jpg';
import taylorImg from './assets/taylor.jpg';
import jamieImg from './assets/jamie.jpeg';
import miguelImg from './assets/miguel.jpeg';

// Import sound effects
import backgroundMusic from './assets/sounds/backgroundMusic.wav';
import buySound from './assets/sounds/buySound.wav';
import cheerSound from './assets/sounds/cheer.wav';
import chooseCarTypeSound from './assets/sounds/chooseCarType.wav';
import chooseEngineSound from './assets/sounds/chooseEngine.wav';
import drill1Sound from './assets/sounds/drill1.wav';
import drill2Sound from './assets/sounds/drill2.wav';
import drill3Sound from './assets/sounds/drill3.wav';
import placeEngineSound from './assets/sounds/placeEngine.wav';
import spray1Sound from './assets/sounds/spray1.wav';
import tadaSound from './assets/sounds/tada.wav';

const CarMechanicGame = () => {
  const [gameState, setGameState] = useState('start');
  const [day, setDay] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(100);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerQueue, setCustomerQueue] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [station, setStation] = useState('orders');
  const [carProgress, setCarProgress] = useState(null);
  const [customersServed, setCustomersServed] = useState(0);
  const [totalCustomers] = useState(5);
  const [dailyQuota, setDailyQuota] = useState(3);
  const [dayTimeLeft, setDayTimeLeft] = useState(180); // 3 minutes per day
  const [showShop, setShowShop] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [totalCarsBuilt, setTotalCarsBuilt] = useState(0);
  const [perfectCars, setPerfectCars] = useState(0);
  const [hint, setHint] = useState('');
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  
  const [selectedColor, setSelectedColor] = useState(null);
  const [paintProgress, setPaintProgress] = useState(0);
  const [paintedAreas, setPaintedAreas] = useState([]);
  const [isPainting, setIsPainting] = useState(false);
  const carSvgRef = useRef(null);
  const [selectedTires, setSelectedTires] = useState(null);
  const [tiresPlaced, setTiresPlaced] = useState([]);
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [enginePlaced, setEnginePlaced] = useState(false);
  const [draggingEngine, setDraggingEngine] = useState(false);
  const [enginePos, setEnginePos] = useState({ x: 0, y: 0 });
  
  const [upgrades, setUpgrades] = useState({
    paintSpeed: 1,
    tireSpeed: 1,
    engineSpeed: 1,
    miguelHired: false
  });
  
  const [miguelWorking, setMiguelWorking] = useState(false);
  const [miguelProgress, setMiguelProgress] = useState(0);
  const [miguelCustomer, setMiguelCustomer] = useState(null);

  // Audio refs
  const bgMusicRef = useRef(null);
  const soundRefs = useRef({
    buySound: new Audio(buySound),
    cheer: new Audio(cheerSound),
    chooseCarType: new Audio(chooseCarTypeSound),
    chooseEngine: new Audio(chooseEngineSound),
    drill1: new Audio(drill1Sound),
    drill2: new Audio(drill2Sound),
    drill3: new Audio(drill3Sound),
    placeEngine: new Audio(placeEngineSound),
    spray1: new Audio(spray1Sound),
    tada: new Audio(tadaSound)
  });

  // Play sound helper
  const playSound = (soundName) => {
    const sound = soundRefs.current[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  // Background music for start screen
  useEffect(() => {
    // Initialize background music once
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio(backgroundMusic);
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.3;
    }

    // Control music based on game state and mute state
    if (gameState === 'start' && !isMusicMuted) {
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(err => console.log('Background music failed:', err));
    } else if (isMusicMuted && bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
    
    return () => {
      // Don't cleanup the music ref, just pause it
      if (bgMusicRef.current && gameState !== 'start') {
        bgMusicRef.current.pause();
      }
    };
  }, [gameState, isMusicMuted]);

  // Play sound when entering dayEnd (must be at top level, not inside conditional render)
  useEffect(() => {
    if (gameState === 'dayEnd') {
      playSound('tada');
    }
  }, [gameState]);

  // Toggle music mute
  const toggleMusic = () => {
    setIsMusicMuted(prev => {
      const newMuted = !prev;
      if (bgMusicRef.current) {
        if (newMuted) {
          bgMusicRef.current.pause();
        } else if (gameState === 'start') {
          bgMusicRef.current.play().catch(err => console.log('Background music failed:', err));
        }
      }
      return newMuted;
    });
  };

  const frames = ['sedan', 'suv', 'sports', 'truck'];
  const colors = ['red', 'blue', 'black', 'white', 'green', 'yellow'];
  const tireTypes = ['standard', 'sport', 'offroad', 'racing'];
  const engines = ['eco', 'standard', 'turbo', 'v8'];
  const customerNames = ['Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Jamie'];

  const colorMap = {
    red: '#ef4444',
    blue: '#3b82f6',
    black: '#1f2937',
    white: '#f3f4f6',
    green: '#22c55e',
    yellow: '#eab308'
  };

  // Helper function to get required wheels for each car type
  const getRequiredWheels = (frame) => {
    switch(frame) {
      case 'truck': return 6;
      case 'sedan': return 4;
      case 'suv': return 4;
      case 'sports': return 4;
      default: return 4;
    }
  };

  // Helper function to get car-specific rewards
  const getCarRewards = (frame) => {
    switch(frame) {
      case 'truck': return { pointsMultiplier: 1.5, coinsMultiplier: 1.5 };
      case 'suv': return { pointsMultiplier: 1.2, coinsMultiplier: 1.2 };
      case 'sports': return { pointsMultiplier: 1.3, coinsMultiplier: 1.3 };
      case 'sedan': return { pointsMultiplier: 1.0, coinsMultiplier: 1.0 };
      default: return { pointsMultiplier: 1.0, coinsMultiplier: 1.0 };
    }
  };

  // Helper function to get profile picture by name
  const getProfilePic = (name) => {
    const profileMap = {
      'Alex': alexImg,
      'Sam': samImg,
      'Jordan': jordanImg,
      'Casey': caseyImg,
      'Riley': rileyImg,
      'Morgan': morganImg,
      'Taylor': taylorImg,
      'Jamie': jamieImg,
      'miguel': miguelImg
    };
    return profileMap[name] || null;
  };

  const shopItems = [
    { id: 'paintSpeed', name: 'Fast Paint Sprayer', cost: 50, level: upgrades.paintSpeed, maxLevel: 3, description: 'Paint cars faster' },
    { id: 'tireSpeed', name: 'Pneumatic Wrench', cost: 50, level: upgrades.tireSpeed, maxLevel: 3, description: 'Install tires faster' },
    { id: 'engineSpeed', name: 'Engine Hoist', cost: 50, level: upgrades.engineSpeed, maxLevel: 3, description: 'Install engines faster' },
    { id: 'miguelHired', name: 'Hire Miguel (Freelancer)', cost: 200, level: upgrades.miguelHired ? 1 : 0, maxLevel: 1, description: 'Auto-builds cars for coins' }
  ];

  // Leaderboard functions
  const getLeaderboard = () => {
    const data = localStorage.getItem('garagemaster_leaderboard');
    return data ? JSON.parse(data) : [];
  };

  const saveToLeaderboard = (name, finalScore, finalDay, cars, perfects) => {
    const leaderboard = getLeaderboard();
    const entry = {
      name,
      score: finalScore,
      day: finalDay,
      carsBuilt: cars,
      perfectCars: perfects,
      date: new Date().toISOString()
    };
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    const top10 = leaderboard.slice(0, 10);
    localStorage.setItem('garagemaster_leaderboard', JSON.stringify(top10));
  };

  // Calculate quota based on day
  useEffect(() => {
    setDailyQuota(2 + day);
  }, [day]);

  // Day timer countdown
  useEffect(() => {
    if (gameState === 'playing' && dayTimeLeft > 0) {
      const timer = setInterval(() => {
        setDayTimeLeft(prev => {
          if (prev <= 1) {
            // Day timer ran out - end the day
            setGameState('dayEnd');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, dayTimeLeft]);

  useEffect(() => {
    if (gameState === 'playing' && customerQueue.length === 0 && !currentCustomer && !miguelCustomer) {
      generateCustomers();
    }
  }, [gameState, customerQueue.length, currentCustomer, miguelCustomer]);

  useEffect(() => {
    if (miguelWorking && miguelProgress < 100) {
      const interval = setInterval(() => {
        setMiguelProgress(prev => {
          const newProgress = Math.min(100, prev + 0.5);
          if (newProgress >= 100) {
            completeMiguelOrder();
          }
          return newProgress;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [miguelWorking, miguelProgress]);

  useEffect(() => {
    if (upgrades.miguelHired && !miguelWorking && !miguelCustomer && customerQueue.length > 0 && !currentCustomer) {
      assignMiguelCustomer();
    }
  }, [upgrades.miguelHired, miguelWorking, customerQueue, currentCustomer]);

  useEffect(() => {
    if (station === 'color') {
      setHint('Move your cursor over the car to paint it!');
    } else if (station === 'tires') {
      setHint('Select tire type, then click on wheel positions!');
    } else if (station === 'engine') {
      setHint('Select engine, then drag it to the engine bay!');
    } else if (station === 'frame') {
      setHint('Select the correct car frame type!');
    }
  }, [station]);

  const assignMiguelCustomer = () => {
    if (customerQueue.length > 0) {
      const customer = customerQueue[0];
      setMiguelCustomer(customer);
      setCustomerQueue(prev => prev.slice(1));
      setMiguelWorking(true);
      setMiguelProgress(0);
    }
  };

  const completeMiguelOrder = () => {
    const coinsEarned = 15;
    setCoins(prev => prev + coinsEarned);
    setScore(prev => prev + 50);
    setCustomersServed(prev => prev + 1);
    
    if (customersServed + 1 >= totalCustomers) {
      setGameState('dayEnd');
    }
    
    setMiguelWorking(false);
    setMiguelProgress(0);
    setMiguelCustomer(null);
  };

  const generateCustomers = () => {
    const customers = [];
    const numCustomers = Math.min(totalCustomers, 3 + day);
    for (let i = 0; i < numCustomers; i++) {
      customers.push({
        id: i,
        name: customerNames[Math.floor(Math.random() * customerNames.length)],
        order: {
          frame: frames[Math.floor(Math.random() * frames.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          tires: tireTypes[Math.floor(Math.random() * tireTypes.length)],
          engine: engines[Math.floor(Math.random() * engines.length)]
        },
        patience: 120 + day * 10
      });
    }
    setCustomerQueue(customers);
  };

  const startGame = () => {
    setGameState('playing');
    setDay(1);
    setScore(0);
    setCoins(100);
    setCustomersServed(0);
    setTotalCarsBuilt(0);
    setPerfectCars(0);
    setDayTimeLeft(180);
    setStation('orders');
    setUpgrades({
      paintSpeed: 1,
      tireSpeed: 1,
      engineSpeed: 1,
      miguelHired: false
    });
  };

  const takeOrder = () => {
    if (customerQueue.length > 0) {
      const customer = customerQueue[0];
      setCurrentCustomer(customer);
      setCurrentOrder(customer.order);
      setCarProgress({
        frame: null,
        color: null,
        tires: null,
        engine: null
      });
      setCustomerQueue(prev => prev.slice(1));
      setStation('frame');
      setHint('Select the correct car frame type!');
    }
  };

  const selectFrame = (frame) => {
    playSound('chooseCarType');
    setCarProgress(prev => ({ ...prev, frame }));
    setStation('color');
    setSelectedColor(null);
    setPaintProgress(0);
    setPaintedAreas([]);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setPaintProgress(0);
    setPaintedAreas([]);
    setHint('Move your cursor over the car to paint it!');
  };

  const handleCarMouseMove = (e) => {
    if (isPainting && selectedColor && carSvgRef.current) {
      const rect = carSvgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Add painted area
      const area = `${Math.floor(x)},${Math.floor(y)}`;
      if (!paintedAreas.includes(area)) {
        // Play spray sound occasionally while painting
        if (paintedAreas.length % 5 === 0) {
          playSound('spray1');
        }
        
        const newAreas = [...paintedAreas, area];
        setPaintedAreas(newAreas);
        
        // Update progress based on coverage
        const newProgress = Math.min(100, (newAreas.length / 60) * 100 * upgrades.paintSpeed);
        setPaintProgress(newProgress);
        
        if (newProgress >= 100) {
          setTimeout(() => {
            setCarProgress(prev => ({ ...prev, color: selectedColor }));
            setStation('tires');
            setSelectedTires(null);
            setTiresPlaced([]);
            setIsPainting(false);
            setPaintedAreas([]);
          }, 300);
        }
      }
    }
  };

  const handleCarMouseDown = () => {
    if (selectedColor && station === 'color') {
      setIsPainting(true);
    }
  };

  const handleCarMouseUp = () => {
    setIsPainting(false);
  };

  const handleTireSelect = (tire) => {
    playSound('drill3');
    setSelectedTires(tire);
    setTiresPlaced([]);
    setHint('Click on the wheel positions to install!');
  };

  const handleTirePlacement = (position) => {
    if (selectedTires && !tiresPlaced.includes(position)) {
      // Alternate between drill1 and drill2
      playSound(position % 2 === 0 ? 'drill1' : 'drill2');
      
      const newTires = [...tiresPlaced, position];
      setTiresPlaced(newTires);
      if (newTires.length >= getRequiredWheels(carProgress.frame)) {
        setTimeout(() => {
          setCarProgress(prev => ({ ...prev, tires: selectedTires }));
          setStation('engine');
          setSelectedEngine(null);
          setEnginePlaced(false);
        }, 300);
      }
    }
  };

  const handleEngineSelect = (engine) => {
    playSound('chooseEngine');
    setSelectedEngine(engine);
    setEnginePlaced(false);
    setHint('Drag the engine to the engine bay!');
  };

  const handleEngineMouseDown = (e) => {
    if (selectedEngine) {
      setDraggingEngine(true);
    }
  };

  const handleMouseMove = (e) => {
    if (draggingEngine) {
      setEnginePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e) => {
    if (draggingEngine) {
      setDraggingEngine(false);
      const engineBay = document.getElementById('engine-bay');
      if (engineBay) {
        const rect = engineBay.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          playSound('placeEngine');
          setEnginePlaced(true);
          setTimeout(() => {
            setCarProgress(prev => ({ ...prev, engine: selectedEngine }));
            setStation('checkout');
            setHint('Review the car and deliver it!');
          }, 500);
        }
      }
    }
  };

  const finishOrder = (timeout = false) => {
    let rating = 0;
    let coinsEarned = 0;
    let isPerfect = false;

    if (!timeout) {
      let correct = 0;
      if (carProgress.frame === currentOrder.frame) correct++;
      if (carProgress.color === currentOrder.color) correct++;
      if (carProgress.tires === currentOrder.tires) correct++;
      if (carProgress.engine === currentOrder.engine) correct++;
      
      if (correct === 4) {
        isPerfect = true;
        setPerfectCars(prev => prev + 1);
      }
      
      rating = Math.round((correct / 4) * 5);
      const { pointsMultiplier, coinsMultiplier } = getCarRewards(carProgress.frame);
      coinsEarned = Math.round(rating * 5 * coinsMultiplier);
      setScore(prev => prev + Math.round(rating * 10 * pointsMultiplier));
    }

    setCoins(prev => prev + coinsEarned);
    setTotalCarsBuilt(prev => prev + 1);
    setGameState('rating');
    setCustomersServed(prev => prev + 1);

    setTimeout(() => {
      if (customersServed + 1 >= totalCustomers) {
        setGameState('dayEnd');
      } else {
        resetWorkStation();
        setCurrentCustomer(null);
        setCurrentOrder(null);
        setCarProgress(null);
        setStation('orders');
        setGameState('playing');
      }
    }, 3000);
  };

  const resetWorkStation = () => {
    setSelectedColor(null);
    setPaintProgress(0);
    setPaintedAreas([]);
    setIsPainting(false);
    setSelectedTires(null);
    setTiresPlaced([]);
    setSelectedEngine(null);
    setEnginePlaced(false);
    setDraggingEngine(false);
  };

  const nextDay = () => {
    // Check if quota was met
    if (customersServed >= dailyQuota) {
      playSound('tada');
      setDay(prev => prev + 1);
      setDayTimeLeft(180); // Reset day timer
      setCustomersServed(0);
      setCustomerQueue([]); // Clear queue first
      setCurrentCustomer(null);
      setCurrentOrder(null);
      setMiguelCustomer(null);
      setMiguelWorking(false);
      setMiguelProgress(0); // Reset Miguel progress
      setGameState('playing');
      setStation('orders');
      // Customers will be generated by useEffect
    } else {
      // Quota not met - game over
      handleGameOver();
    }
  };

  const buyUpgrade = (upgradeId) => {
    const item = shopItems.find(i => i.id === upgradeId);
    const currentLevel = upgrades[upgradeId];
    
    if (upgradeId === 'miguelHired') {
      if (coins >= item.cost && !upgrades.miguelHired) {
        playSound('buySound');
        setCoins(prev => prev - item.cost);
        setUpgrades(prev => ({
          ...prev,
          miguelHired: true
        }));
      }
    } else {
      const cost = item.cost * currentLevel;
      if (coins >= cost && currentLevel < item.maxLevel) {
        playSound('buySound');
        setCoins(prev => prev - cost);
        setUpgrades(prev => ({
          ...prev,
          [upgradeId]: currentLevel + 1
        }));
      }
    }
  };

  const handleGameOver = () => {
    const finalName = playerName.trim() || `Player ${Date.now()}`;
    saveToLeaderboard(finalName, score, day, totalCarsBuilt, perfectCars);
    setGameState('gameOver');
    setShowNameInput(false);
  };

  const returnToStart = () => {
    setGameState('start');
    setShowLeaderboard(false);
    setShowInfo(false);
    setPlayerName('');
  };

  const CarSVG = ({ frame, color, showTires = false, showEngine = false, paintable = false }) => {
    const fillColor = color ? colorMap[color] : '#d1d5db';
    const baseColor = '#d1d5db';
    const actualFill = paintable ? (paintProgress > 0 ? fillColor : baseColor) : fillColor;
    const opacity = paintable && paintProgress < 100 ? 0.3 + (paintProgress / 100) * 0.7 : 1;
    
    if (frame === 'sedan') {
      return (
        <svg viewBox="0 0 400 200" className="w-full h-full" ref={paintable ? carSvgRef : null}>
          {/* Main car body */}
          <g opacity={opacity}>
            {/* Bottom chassis */}
            <path 
              d="M 70 140 L 90 140 L 95 135 L 305 135 L 310 140 L 330 140 L 335 145 L 335 155 L 65 155 L 65 145 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Hood */}
            <path 
              d="M 90 135 L 95 120 L 130 115 L 140 120 L 140 135 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Front cabin/windshield area */}
            <path 
              d="M 140 120 L 145 100 L 175 95 L 180 100 L 180 135 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Roof */}
            <rect 
              x="180" 
              y="100" 
              width="80" 
              height="35" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Rear windshield area */}
            <path 
              d="M 260 100 L 265 95 L 295 100 L 300 120 L 300 135 L 260 135 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Trunk */}
            <path 
              d="M 300 120 L 305 115 L 310 135 L 300 135 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
          </g>
          
          {/* Windows */}
          <path 
            d="M 145 102 L 155 105 L 175 102 L 178 105 L 178 120 L 145 120 Z" 
            fill="#87CEEB" 
            stroke="#000" 
            strokeWidth="1.5"
            opacity="0.75"
          />
          <rect x="182" y="102" width="76" height="18" fill="#87CEEB" stroke="#000" strokeWidth="1.5" opacity="0.75"/>
          <path 
            d="M 262 105 L 265 102 L 290 105 L 295 115 L 262 115 Z" 
            fill="#87CEEB" 
            stroke="#000" 
            strokeWidth="1.5"
            opacity="0.75"
          />
          
          {/* Details */}
          <line x1="180" y1="105" x2="180" y2="135" stroke="#000" strokeWidth="2"/>
          <line x1="260" y1="105" x2="260" y2="135" stroke="#000" strokeWidth="2"/>
          
          {/* Headlights */}
          <ellipse cx="80" cy="127" rx="8" ry="5" fill="#FFF8DC" stroke="#000" strokeWidth="1.5"/>
          {/* Taillights */}
          <ellipse cx="320" cy="127" rx="8" ry="5" fill="#FF6B6B" stroke="#000" strokeWidth="1.5"/>
          
          {/* Grille */}
          <rect x="70" y="127" width="15" height="10" fill="#222" stroke="#000" strokeWidth="1"/>
          <line x1="72" y1="129" x2="72" y2="135" stroke="#444" strokeWidth="1"/>
          <line x1="76" y1="129" x2="76" y2="135" stroke="#444" strokeWidth="1"/>
          <line x1="80" y1="129" x2="80" y2="135" stroke="#444" strokeWidth="1"/>
          
          {/* Side mirrors */}
          <ellipse cx="140" cy="110" rx="4" ry="6" fill={actualFill} stroke="#000" strokeWidth="1.5" opacity={opacity}/>
          <ellipse cx="300" cy="110" rx="4" ry="6" fill={actualFill} stroke="#000" strokeWidth="1.5" opacity={opacity}/>
          
          {/* Door handles */}
          <rect x="205" y="125" width="8" height="3" fill="#333" stroke="#000" strokeWidth="0.5"/>
          
          {showTires && (
            <>
              {/* Front tire */}
              <circle cx="120" cy="155" r="18" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <circle cx="120" cy="155" r="10" fill="#333" stroke="#000" strokeWidth="1.5"/>
              <circle cx="120" cy="155" r="5" fill="#666"/>
              
              {/* Rear tire */}
              <circle cx="280" cy="155" r="18" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <circle cx="280" cy="155" r="10" fill="#333" stroke="#000" strokeWidth="1.5"/>
              <circle cx="280" cy="155" r="5" fill="#666"/>
            </>
          )}
          
          {showEngine && (
            <g>
              <rect x="100" y="118" width="25" height="15" fill="#FF6600" stroke="#000" strokeWidth="1.5"/>
              <rect x="105" y="120" width="4" height="8" fill="#FF8C00"/>
              <rect x="115" y="120" width="4" height="8" fill="#FF8C00"/>
            </g>
          )}
        </svg>
      );
    } else if (frame === 'suv') {
      return (
        <svg viewBox="0 0 400 200" className="w-full h-full" ref={paintable ? carSvgRef : null}>
          {/* Main SUV body */}
          <g opacity={opacity}>
            {/* Bottom chassis */}
            <path 
              d="M 70 135 L 90 135 L 95 130 L 305 130 L 310 135 L 330 135 L 335 140 L 335 155 L 65 155 L 65 140 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Hood */}
            <path 
              d="M 90 130 L 95 110 L 130 105 L 135 110 L 135 130 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Front cabin */}
            <path 
              d="M 135 110 L 140 85 L 170 75 L 175 85 L 175 130 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Roof - taller and boxier */}
            <rect 
              x="175" 
              y="80" 
              width="90" 
              height="50" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Rear cabin */}
            <path 
              d="M 265 85 L 270 75 L 300 85 L 305 110 L 305 130 L 265 130 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Rear hatch */}
            <path 
              d="M 305 110 L 310 105 L 310 130 L 305 130 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
          </g>
          
          {/* Roof rack */}
          <rect x="185" y="77" width="80" height="4" fill="#333" stroke="#000" strokeWidth="1.5"/>
          <rect x="190" y="73" width="3" height="8" fill="#333" stroke="#000" strokeWidth="1"/>
          <rect x="255" y="73" width="3" height="8" fill="#333" stroke="#000" strokeWidth="1"/>
          
          {/* Windows */}
          <path 
            d="M 140 87 L 150 90 L 170 87 L 173 95 L 140 95 Z" 
            fill="#87CEEB" 
            stroke="#000" 
            strokeWidth="1.5"
            opacity="0.75"
          />
          <rect x="177" y="82" width="40" height="28" fill="#87CEEB" stroke="#000" strokeWidth="1.5" opacity="0.75"/>
          <rect x="220" y="82" width="43" height="28" fill="#87CEEB" stroke="#000" strokeWidth="1.5" opacity="0.75"/>
          <path 
            d="M 267 87 L 270 82 L 295 90 L 295 100 L 267 100 Z" 
            fill="#87CEEB" 
            stroke="#000" 
            strokeWidth="1.5"
            opacity="0.75"
          />
          
          {/* Window dividers */}
          <line x1="175" y1="85" x2="175" y2="130" stroke="#000" strokeWidth="2.5"/>
          <line x1="217" y1="82" x2="217" y2="130" stroke="#000" strokeWidth="2"/>
          <line x1="265" y1="85" x2="265" y2="130" stroke="#000" strokeWidth="2.5"/>
          
          {/* Headlights */}
          <ellipse cx="80" cy="120" rx="9" ry="6" fill="#FFF8DC" stroke="#000" strokeWidth="1.5"/>
          {/* Taillights */}
          <rect x="310" y="115" width="8" height="12" fill="#FF6B6B" stroke="#000" strokeWidth="1.5"/>
          
          {/* Grille */}
          <rect x="70" y="120" width="18" height="12" fill="#222" stroke="#000" strokeWidth="1.5"/>
          
          {/* Side mirrors */}
          <rect x="133" y="95" width="6" height="8" fill={actualFill} stroke="#000" strokeWidth="1.5" opacity={opacity}/>
          <rect x="305" y="95" width="6" height="8" fill={actualFill} stroke="#000" strokeWidth="1.5" opacity={opacity}/>
          
          {showTires && (
            <>
              {/* Front tire - larger */}
              <circle cx="120" cy="155" r="20" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <circle cx="120" cy="155" r="12" fill="#333" stroke="#000" strokeWidth="1.5"/>
              <circle cx="120" cy="155" r="6" fill="#666"/>
              
              {/* Rear tire - larger */}
              <circle cx="280" cy="155" r="20" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <circle cx="280" cy="155" r="12" fill="#333" stroke="#000" strokeWidth="1.5"/>
              <circle cx="280" cy="155" r="6" fill="#666"/>
            </>
          )}
          
          {showEngine && (
            <g>
              <rect x="100" y="110" width="28" height="18" fill="#FF6600" stroke="#000" strokeWidth="1.5"/>
              <rect x="105" y="113" width="5" height="10" fill="#FF8C00"/>
              <rect x="118" y="113" width="5" height="10" fill="#FF8C00"/>
            </g>
          )}
        </svg>
      );
    } else if (frame === 'sports') {
      return (
        <svg viewBox="0 0 400 200" className="w-full h-full" ref={paintable ? carSvgRef : null}>
          {/* Sports car - low and sleek */}
          <g opacity={opacity}>
            {/* Bottom chassis - very low */}
            <path 
              d="M 80 145 L 95 145 L 100 142 L 300 142 L 305 145 L 320 145 L 325 148 L 325 155 L 75 155 L 75 148 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Front hood - long and sleek */}
            <path 
              d="M 95 142 L 100 130 L 140 125 L 145 130 L 145 142 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Windshield - very slanted */}
            <path 
              d="M 145 130 L 150 110 L 175 105 L 180 110 L 180 142 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Low roof */}
            <path 
              d="M 180 110 L 185 105 L 245 105 L 250 110 L 250 142 L 180 142 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Rear windshield */}
            <path 
              d="M 250 110 L 255 105 L 280 115 L 285 130 L 285 142 L 250 142 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Short trunk with spoiler */}
            <path 
              d="M 285 130 L 290 125 L 300 142 L 285 142 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
          </g>
          
          {/* Spoiler */}
          <path 
            d="M 295 125 L 310 120 L 315 123 L 300 128 Z" 
            fill={actualFill} 
            stroke="#000" 
            strokeWidth="2"
            opacity={opacity}
          />
          <line x1="305" y1="125" x2="305" y2="120" stroke="#000" strokeWidth="2"/>
          
          {/* Windows - very slanted and sporty */}
          <path 
            d="M 150 112 L 158 115 L 175 112 L 178 115 L 178 125 L 150 125 Z" 
            fill="#87CEEB" 
            stroke="#000" 
            strokeWidth="1.5"
            opacity="0.6"
          />
          <polygon 
            points="182,107 245,107 248,115 248,125 182,125 182,115" 
            fill="#87CEEB" 
            stroke="#000" 
            strokeWidth="1.5"
            opacity="0.6"
          />
          <path 
            d="M 252 110 L 255 107 L 275 117 L 275 127 L 252 127 Z" 
            fill="#87CEEB" 
            stroke="#000" 
            strokeWidth="1.5"
            opacity="0.6"
          />
          
          {/* Window dividers */}
          <line x1="180" y1="110" x2="180" y2="142" stroke="#000" strokeWidth="2"/>
          <line x1="250" y1="110" x2="250" y2="142" stroke="#000" strokeWidth="2"/>
          
          {/* Aggressive headlights */}
          <polygon points="80,138 88,135 92,138 88,141" fill="#FFF8DC" stroke="#000" strokeWidth="1.5"/>
          <polygon points="85,137 90,135 93,137 90,139" fill="#E0FFFF" stroke="#000" strokeWidth="1"/>
          
          {/* Aggressive taillights */}
          <polygon points="315,138 320,136 323,140 318,142" fill="#FF4444" stroke="#000" strokeWidth="1.5"/>
          
          {/* Air intakes */}
          <rect x="100" y="143" width="18" height="8" fill="#1a1a1a" stroke="#000" strokeWidth="1.5"/>
          <line x1="103" y1="145" x2="103" y2="149" stroke="#333" strokeWidth="1"/>
          <line x1="108" y1="145" x2="108" y2="149" stroke="#333" strokeWidth="1"/>
          <line x1="113" y1="145" x2="113" y2="149" stroke="#333" strokeWidth="1"/>
          
          {/* Side vents */}
          <rect x="190" y="130" width="15" height="4" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
          
          {showTires && (
            <>
              {/* Front tire - low profile */}
              <circle cx="125" cy="155" r="17" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <circle cx="125" cy="155" r="9" fill="#333" stroke="#000" strokeWidth="1.5"/>
              <circle cx="125" cy="155" r="4" fill="#666"/>
              
              {/* Rear tire - wider */}
              <ellipse cx="275" cy="155" rx="19" ry="17" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <ellipse cx="275" cy="155" rx="10" ry="9" fill="#333" stroke="#000" strokeWidth="1.5"/>
              <circle cx="275" cy="155" r="4" fill="#666"/>
            </>
          )}
          
          {showEngine && (
            <g>
              <rect x="200" y="118" width="35" height="16" fill="#FF6600" stroke="#000" strokeWidth="1.5"/>
              <rect x="205" y="120" width="6" height="10" fill="#FF8C00"/>
              <rect x="220" y="120" width="6" height="10" fill="#FF8C00"/>
              <text x="215" y="130" fontSize="8" fill="#fff" fontWeight="bold">V8</text>
            </g>
          )}
        </svg>
      );
    } else if (frame === 'truck') {
      return (
        <svg viewBox="0 0 400 200" className="w-full h-full" ref={paintable ? carSvgRef : null}>
          {/* Pickup truck */}
          <g opacity={opacity}>
            {/* Truck bed */}
            <rect 
              x="220" 
              y="95" 
              width="110" 
              height="40" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            {/* Bed rails */}
            <line x1="220" y1="95" x2="330" y2="95" stroke="#000" strokeWidth="3"/>
            <rect x="220" y="92" width="110" height="5" fill={actualFill} stroke="#000" strokeWidth="1.5" opacity={opacity}/>
            
            {/* Tailgate */}
            <rect 
              x="326" 
              y="100" 
              width="6" 
              height="35" 
              fill="#555" 
              stroke="#000" 
              strokeWidth="2"
            />
            <line x1="328" y1="105" x2="328" y2="130" stroke="#777" strokeWidth="1"/>
            
            {/* Chassis */}
            <rect 
              x="70" 
              y="135" 
              width="265" 
              height="15" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            
            {/* Cab */}
            <path 
              d="M 150 135 L 155 95 L 190 85 L 220 95 L 220 135 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            
            {/* Hood */}
            <path 
              d="M 150 135 L 155 120 L 120 110 L 90 115 L 85 125 L 85 135 Z" 
              fill={actualFill} 
              stroke="#000" 
              strokeWidth="2.5"
            />
            
            {/* Front bumper and grille */}
            <rect 
              x="70" 
              y="125" 
              width="15" 
              height="15" 
              fill="#333" 
              stroke="#000" 
              strokeWidth="2"
            />
          </g>
          
          {/* Grille details */}
          <rect x="72" y="127" width="11" height="11" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
          <line x1="74" y1="129" x2="74" y2="136" stroke="#555" strokeWidth="1"/>
          <line x1="77" y1="129" x2="77" y2="136" stroke="#555" strokeWidth="1"/>
          <line x1="80" y1="129" x2="80" y2="136" stroke="#555" strokeWidth="1"/>
          
          {/* Windshield */}
          <path 
            d="M 160 90 L 170 95 L 205 92 L 215 95 L 215 110 L 160 110 Z" 
            fill="#87CEEB" 
            stroke="#000" 
            strokeWidth="1.5"
            opacity="0.75"
          />
          
          {/* Side window */}
          <polygon 
            points="158,115 158,95 155,100 155,120" 
            fill="#87CEEB" 
            stroke="#000" 
            strokeWidth="1.5"
            opacity="0.75"
          />
          
          {/* Door */}
          <line x1="185" y1="110" x2="185" y2="135" stroke="#000" strokeWidth="2"/>
          <rect x="195" y="120" width="10" height="3" fill="#333" stroke="#000" strokeWidth="0.5"/>
          
          {/* Headlights */}
          <circle cx="78" cy="120" r="5" fill="#FFF8DC" stroke="#000" strokeWidth="1.5"/>
          
          {/* Taillights */}
          <rect x="326" y="110" width="4" height="8" fill="#FF6B6B" stroke="#000" strokeWidth="1.5"/>
          <rect x="326" y="120" width="4" height="8" fill="#FFA500" stroke="#000" strokeWidth="1.5"/>
          
          {/* Side mirror */}
          <rect x="148" y="105" width="5" height="7" fill={actualFill} stroke="#000" strokeWidth="1.5" opacity={opacity}/>
          
          {showTires && (
            <>
              {/* Front tires */}
              <circle cx="120" cy="152" r="18" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <circle cx="120" cy="152" r="10" fill="#333" stroke="#000" strokeWidth="1.5"/>
              <circle cx="120" cy="152" r="5" fill="#666"/>
              
              {/* Rear tires - dual wheels */}
              <ellipse cx="250" cy="152" rx="12" ry="18" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <ellipse cx="250" cy="152" rx="7" ry="10" fill="#333" stroke="#000" strokeWidth="1.5"/>
              
              <ellipse cx="265" cy="152" rx="12" ry="18" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <ellipse cx="265" cy="152" rx="7" ry="10" fill="#333" stroke="#000" strokeWidth="1.5"/>
              
              <ellipse cx="295" cy="152" rx="12" ry="18" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <ellipse cx="295" cy="152" rx="7" ry="10" fill="#333" stroke="#000" strokeWidth="1.5"/>
              
              <ellipse cx="310" cy="152" rx="12" ry="18" fill="#1a1a1a" stroke="#000" strokeWidth="2.5"/>
              <ellipse cx="310" cy="152" rx="7" ry="10" fill="#333" stroke="#000" strokeWidth="1.5"/>
            </>
          )}
          
          {showEngine && (
            <g>
              <rect x="100" y="115" width="30" height="18" fill="#FF6600" stroke="#000" strokeWidth="1.5"/>
              <rect x="105" y="118" width="6" height="10" fill="#FF8C00"/>
              <rect x="118" y="118" width="6" height="10" fill="#FF8C00"/>
            </g>
          )}
        </svg>
      );
    }
  };

  const CarDisplay = ({ car, isOrder = false, interactive = false, onTireClick, paintable = false }) => {
    if (!car || !car.frame) return null;

    return (
      <div 
        className="relative w-full h-48 mx-auto"
        onMouseMove={paintable ? handleCarMouseMove : undefined}
        onMouseDown={paintable ? handleCarMouseDown : undefined}
        onMouseUp={paintable ? handleCarMouseUp : undefined}
        onMouseLeave={paintable ? handleCarMouseUp : undefined}
        style={{ cursor: paintable && selectedColor ? 'crosshair' : 'default' }}
      >
        <CarSVG 
          frame={car.frame} 
          color={car.color} 
          showTires={!!car.tires}
          showEngine={!!car.engine}
          paintable={paintable}
        />
        
        {interactive && !car.tires && selectedTires && (
          <div className="absolute inset-0 flex items-end justify-around pb-2">
            {[...Array(getRequiredWheels(car.frame))].map((_, pos) => (
              <div
                key={pos}
                onClick={() => onTireClick(pos)}
                className={`w-8 h-8 border-4 border-dashed rounded-full cursor-pointer transition ${
                  tiresPlaced.includes(pos) ? 'bg-gray-900 border-gray-700' : 'border-yellow-400 animate-pulse'
                }`}
              />
            ))}
          </div>
        )}
        
        {paintable && isPainting && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            Painting...
          </div>
        )}
      </div>
    );
  };

  if (gameState === 'start') {
    return (
      <div className="w-full h-screen starburst-bg scanlines flex items-center justify-center">
        <div className="flash-panel bg-gradient-to-b from-gray-700 to-gray-800 p-10 text-center max-w-2xl border-4 border-orange-500">
          <h1 className="text-6xl font-bold text-orange-400 mb-4 retro-text neon-glow bounce-flash">
            GARAGE MASTER
          </h1>
          <p className="text-2xl text-white mb-8 retro-text">Build cars, serve customers, upgrade your shop!</p>
          
          <div className="flex flex-col gap-4 mb-6">
            <button
              onClick={startGame}
              className="flash-button bg-gradient-to-b from-green-500 to-green-700 text-white px-12 py-6 rounded-lg text-3xl font-bold glossy retro-text"
            >
              START GAME
            </button>
            
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flash-button bg-gradient-to-b from-yellow-500 to-yellow-700 text-white px-12 py-5 rounded-lg text-2xl font-bold glossy retro-text flex items-center justify-center gap-3"
            >
              <Trophy className="w-8 h-8" />
              LEADERBOARD
            </button>
            
            <button
              onClick={() => setShowInfo(true)}
              className="flash-button bg-gradient-to-b from-blue-500 to-blue-700 text-white px-12 py-5 rounded-lg text-2xl font-bold glossy retro-text flex items-center justify-center gap-3"
            >
              <Info className="w-8 h-8" />
              HOW TO PLAY
            </button>
            
            <button
              onClick={toggleMusic}
              className={`flash-button px-12 py-4 rounded-lg text-xl font-bold glossy retro-text ${
                isMusicMuted 
                  ? 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-300' 
                  : 'bg-gradient-to-b from-purple-500 to-purple-700 text-white'
              }`}
            >
              {isMusicMuted ? 'MUSIC OFF' : 'MUSIC ON'}
            </button>
          </div>
          
          <div className="flash-panel bg-gradient-to-r from-purple-700 to-purple-800 p-4 rounded-lg border-4 border-purple-600">
            <p className="text-white text-lg font-bold retro-text">
              Meet daily quotas to advance! Upgrade your tools and hire help!
            </p>
          </div>
        </div>
        
        {/* Show leaderboard modal on start screen */}
        {showLeaderboard && (
          <div className="fixed inset-0 flash-overlay flex items-center justify-center z-50">
            <div className="flash-panel p-8 max-w-4xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-10 h-10 text-yellow-400 coin-spin" />
                  <h2 className="text-4xl font-bold text-white retro-text neon-glow">LEADERBOARD</h2>
                </div>
                <button onClick={() => setShowLeaderboard(false)} className="flash-button bg-gradient-to-b from-red-500 to-red-700 text-white p-2 rounded-lg">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              {getLeaderboard().length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-2xl text-gray-300 retro-text">No entries yet!</p>
                  <p className="text-xl text-gray-400 mt-2">Be the first to make it on the leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getLeaderboard().map((entry, index) => (
                    <div 
                      key={index} 
                      className={`flash-badge p-4 rounded-lg flex items-center justify-between ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 
                        index === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700' : 
                        'bg-gradient-to-r from-gray-600 to-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-3xl font-bold text-white w-12 retro-text">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold text-white retro-text">{entry.name}</div>
                          <div className="text-sm text-gray-200">
                            Day {entry.day} • {entry.carsBuilt} cars • {entry.perfectCars} perfect
                          </div>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-yellow-300 retro-text" style={{
                        textShadow: '2px 2px 0px #000, 0 0 10px rgba(255,255,0,0.8)'
                      }}>
                        {entry.score.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => setShowLeaderboard(false)}
                className="flash-button w-full mt-6 bg-gradient-to-b from-orange-400 to-orange-600 text-white px-6 py-3 text-xl font-bold glossy retro-text"
              >
                BACK
              </button>
            </div>
          </div>
        )}
        
        {/* Show info modal on start screen */}
        {showInfo && (
          <div className="fixed inset-0 flash-overlay flex items-center justify-center z-50">
            <div className="flash-panel p-8 max-w-2xl w-full mx-4 max-h-screen overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-bold text-white retro-text neon-glow">HOW TO PLAY</h2>
                <button onClick={() => setShowInfo(false)} className="flash-button bg-gradient-to-b from-red-500 to-red-700 text-white p-2 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-white space-y-4" style={{fontFamily: 'Comic Neue, cursive'}}>
                <div className="flash-panel bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-lg border-4 border-blue-500">
                  <h3 className="font-bold text-xl mb-2 retro-text">GOAL</h3>
                  <p>Meet the daily customer quota to advance! Each day gets harder with more customers to serve.</p>
                </div>
                
                <div className="flash-panel bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-lg border-4 border-green-500">
                  <h3 className="font-bold text-xl mb-2 retro-text">BUILD CARS</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Frame:</strong> Click to select the car type</li>
                    <li><strong>Paint:</strong> Choose color, then move cursor over car to paint</li>
                    <li><strong>Tires:</strong> Select tire type, then click wheel positions</li>
                    <li><strong>Engine:</strong> Select engine, then drag to the engine bay</li>
                  </ul>
                </div>
                
                <div className="flash-panel bg-gradient-to-r from-yellow-600 to-yellow-700 p-4 rounded-lg border-4 border-yellow-500">
                  <h3 className="font-bold text-xl mb-2 retro-text">SCORING</h3>
                  <p>Match customer orders exactly for maximum points and coins! Speed matters too - faster builds earn bonus points.</p>
                </div>
                
                <div className="flash-panel bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-lg border-4 border-purple-500">
                  <h3 className="font-bold text-xl mb-2 retro-text">UPGRADES</h3>
                  <p>Use coins to upgrade tools (paint faster, install tires/engines quicker) or hire Miguel to auto-build cars!</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="flash-button w-full mt-6 bg-gradient-to-b from-blue-500 to-blue-700 text-white px-6 py-4 text-xl font-bold glossy retro-text"
              >
                GOT IT!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'rating') {
    const correct = Object.keys(currentOrder).filter(key => carProgress[key] === currentOrder[key]).length;
    const stars = Math.round((correct / 4) * 5);
    const coinsEarned = stars * 5;
    
    return (
      <div className="w-full h-screen starburst-bg scanlines flex items-center justify-center">
        <div className="flash-panel bg-gradient-to-b from-gray-700 to-gray-800 p-10 text-center max-w-md border-4 border-orange-500">
          <h2 className="text-4xl font-bold text-white mb-6 retro-text neon-glow">{currentCustomer.name}'S RATING</h2>
          <div className="flex justify-center gap-3 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-14 h-14 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} 
                style={i < stars ? {filter: 'drop-shadow(0 0 10px rgba(255,204,0,0.8))'} : {}} />
            ))}
          </div>
          <div className="flash-panel bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg mb-6">
            <div className="text-white space-y-3 text-xl font-bold" style={{fontFamily: 'Comic Neue, cursive'}}>
              <div className="flex justify-between items-center p-2 bg-gray-700 rounded-lg bevel">
                <span>Frame:</span>
                <span className={carProgress.frame === currentOrder.frame ? 'text-green-400 text-2xl' : 'text-red-400 text-2xl'}>
                  {carProgress.frame === currentOrder.frame ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700 rounded-lg bevel">
                <span>Color:</span>
                <span className={carProgress.color === currentOrder.color ? 'text-green-400 text-2xl' : 'text-red-400 text-2xl'}>
                  {carProgress.color === currentOrder.color ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700 rounded-lg bevel">
                <span>Tires:</span>
                <span className={carProgress.tires === currentOrder.tires ? 'text-green-400 text-2xl' : 'text-red-400 text-2xl'}>
                  {carProgress.tires === currentOrder.tires ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700 rounded-lg bevel">
                <span>Engine:</span>
                <span className={carProgress.engine === currentOrder.engine ? 'text-green-400 text-2xl' : 'text-red-400 text-2xl'}>
                  {carProgress.engine === currentOrder.engine ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
          <div className="flash-badge bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center justify-center gap-3 mb-3 p-4 rounded-lg border-4 border-yellow-500">
            <Coins className="w-8 h-8 text-yellow-200 coin-spin" />
            <p className="text-white text-2xl font-bold retro-text">+{coinsEarned} COINS</p>
          </div>
          <p className="text-purple-400 text-xl font-bold retro-text" style={{textShadow: '2px 2px 0px #000, 0 0 10px rgba(168,85,247,0.8)'}}>
            +{stars * 10} POINTS
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'dayEnd') {
    const quotaMet = customersServed >= dailyQuota;
    
    return (
      <div className="w-full h-screen starburst-bg scanlines flex items-center justify-center">
        <div className="flash-panel bg-gradient-to-b from-gray-700 to-gray-800 p-10 text-center max-w-2xl border-4 border-purple-500">
          <h2 className="text-5xl font-bold text-white mb-6 retro-text neon-glow bounce-flash">DAY {day} COMPLETE!</h2>
          
          <div className={`flash-badge mb-8 p-6 rounded-lg border-4 ${
            quotaMet ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-400' : 'bg-gradient-to-r from-red-500 to-red-600 border-red-400'
          }`}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Target className="w-10 h-10 text-white" style={{filter: 'drop-shadow(0 0 10px #fff)'}} />
              <h3 className="text-3xl font-bold text-white retro-text">DAILY QUOTA</h3>
            </div>
            <p className="text-5xl font-bold text-white mb-3 retro-text">
              {customersServed} / {dailyQuota}
            </p>
            <p className="text-2xl text-white font-bold retro-text">
              {quotaMet ? 'QUOTA MET!' : 'QUOTA NOT MET'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flash-badge bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-lg border-2 border-purple-500">
              <div className="text-yellow-400 text-sm font-bold mb-1">TOTAL SCORE</div>
              <div className="text-white text-3xl font-bold retro-text">{score}</div>
            </div>
            <div className="flash-badge bg-gradient-to-r from-yellow-600 to-yellow-700 p-4 rounded-lg border-2 border-yellow-500">
              <div className="text-white text-sm font-bold mb-1">COINS</div>
              <div className="text-white text-3xl font-bold retro-text">{coins}</div>
            </div>
            <div className="flash-badge bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-lg border-2 border-blue-500">
              <div className="text-white text-sm font-bold mb-1">CARS BUILT</div>
              <div className="text-white text-3xl font-bold retro-text">{totalCarsBuilt}</div>
            </div>
            <div className="flash-badge bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-lg border-2 border-green-500">
              <div className="text-yellow-300 text-sm font-bold mb-1">PERFECT CARS</div>
              <div className="text-white text-3xl font-bold retro-text">{perfectCars}</div>
            </div>
          </div>
          
          {quotaMet ? (
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setShowShop(true)}
                className="flash-button bg-gradient-to-b from-blue-500 to-blue-700 text-white px-8 py-4 rounded-lg text-2xl font-bold glossy retro-text flex items-center gap-2"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="font-bold retro-text">SHOP</span>
              </button>
              <button 
                onClick={nextDay}
                className="flash-button bg-gradient-to-b from-orange-500 to-orange-700 text-white px-8 py-4 rounded-lg text-2xl font-bold glossy retro-text"
              >
                START DAY {day + 1}
              </button>
            </div>
          ) : (
            showNameInput ? (
              <div className="flash-panel bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg border-4 border-gray-600">
                <h3 className="text-2xl font-bold text-white mb-4 retro-text">ENTER YOUR NAME</h3>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name..."
                  maxLength={20}
                  className="w-full px-4 py-4 rounded-lg text-xl mb-4 bg-gray-700 text-white border-4 border-gray-600 focus:border-orange-500 outline-none font-bold bevel"
                  style={{fontFamily: 'Comic Neue, cursive'}}
                  onKeyPress={(e) => e.key === 'Enter' && handleGameOver()}
                />
                <button
                  onClick={handleGameOver}
                  className="flash-button w-full bg-gradient-to-b from-red-500 to-red-700 text-white px-6 py-4 rounded-lg text-2xl font-bold glossy retro-text"
                >
                  SUBMIT SCORE
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNameInput(true)}
                className="flash-button bg-gradient-to-b from-red-500 to-red-700 text-white px-8 py-4 rounded-lg text-2xl font-bold glossy retro-text"
              >
                CONTINUE TO RESULTS
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    const leaderboard = getLeaderboard();
    const playerRank = leaderboard.findIndex(entry => 
      entry.name === playerName && entry.score === score
    ) + 1;

    return (
      <div className="w-full h-screen starburst-bg scanlines flex items-center justify-center">
        <div className="flash-panel bg-gradient-to-b from-purple-900 to-gray-900 p-10 text-center max-w-2xl border-4 border-purple-500">
          <h2 className="text-6xl font-bold text-purple-400 mb-6 retro-text neon-glow bounce-flash">CONGRATULATIONS!</h2>
          <p className="text-3xl text-white mb-3 retro-text">You survived {day - 1} day{day - 1 !== 1 ? 's' : ''}!</p>
          <p className="text-xl text-gray-300 mb-8" style={{fontFamily: 'Comic Neue, cursive'}}>Great job running your garage!</p>
          
          <div className="flash-panel bg-gradient-to-b from-gray-700 to-gray-800 p-8 rounded-lg mb-6 border-4 border-gray-600">
            <h3 className="text-4xl font-bold text-white mb-6 retro-text neon-glow">YOUR ACHIEVEMENT</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flash-badge bg-gradient-to-r from-purple-600 to-purple-700 p-5 rounded-lg col-span-2 border-4 border-purple-500">
                <div className="text-5xl mb-2">🏆</div>
                <div className="text-white font-bold text-xl mb-2 retro-text">FINAL SCORE</div>
                <div className="text-5xl font-bold text-yellow-300 retro-text" style={{
                  textShadow: '3px 3px 0px #000, 0 0 20px rgba(255,204,0,0.8)'
                }}>
                  {score.toLocaleString()}
                </div>
              </div>
              <div className="flash-badge bg-gradient-to-r from-gray-600 to-gray-700 p-4 rounded-lg border-2 border-gray-500">
                <div className="text-yellow-400 font-bold mb-1">Days Completed</div>
                <div className="text-3xl font-bold text-white retro-text">{day - 1}</div>
              </div>
              <div className="flash-badge bg-gradient-to-r from-gray-600 to-gray-700 p-4 rounded-lg border-2 border-gray-500">
                <div className="text-yellow-400 font-bold mb-1">Cars Built</div>
                <div className="text-3xl font-bold text-white retro-text">{totalCarsBuilt}</div>
              </div>
              <div className="flash-badge bg-gradient-to-r from-gray-600 to-gray-700 p-4 rounded-lg border-2 border-gray-500 col-span-2">
                <div className="text-green-400 font-bold mb-1">Perfect Cars</div>
                <div className="text-3xl font-bold text-white retro-text">{perfectCars}</div>
              </div>
            </div>
            {playerRank > 0 && (
              <div className="flash-badge bg-gradient-to-r from-yellow-600 to-yellow-700 mt-6 p-5 rounded-lg border-4 border-yellow-500">
                <div className="text-4xl mb-2">
                  {playerRank === 1 ? '🥇' : playerRank === 2 ? '🥈' : playerRank === 3 ? '🥉' : '🏆'}
                </div>
                <div className="text-2xl text-white font-bold retro-text">
                  LEADERBOARD: #{playerRank}
                </div>
                <p className="text-white mt-2 font-bold">You made the top 10!</p>
              </div>
            )}
          </div>
          
          <div className="flash-panel bg-gradient-to-r from-purple-700 to-purple-800 p-4 rounded-lg mb-6 border-4 border-purple-600">
            <p className="text-white text-xl font-bold retro-text">
              {perfectCars > totalCarsBuilt / 2 
                ? "OUTSTANDING! YOU'RE A MASTER MECHANIC!" 
                : totalCarsBuilt > 10 
                ? "IMPRESSIVE DEDICATION! LOTS OF CARS BUILT!" 
                : "GOOD EFFORT! KEEP PRACTICING!"}
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={startGame}
              className="flash-button bg-gradient-to-b from-orange-500 to-orange-700 text-white px-10 py-5 rounded-lg text-2xl font-bold glossy retro-text"
            >
              PLAY AGAIN
            </button>
            <button 
              onClick={returnToStart}
              className="flash-button bg-gradient-to-b from-blue-500 to-blue-700 text-white px-10 py-5 rounded-lg text-2xl font-bold glossy retro-text"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen starburst-bg scanlines" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* Retro Game Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-4 border-b-4 border-orange-500 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flash-badge bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-lg">
              <Wrench className="w-6 h-6 text-white" style={{filter: 'drop-shadow(0 0 5px #fff)'}} />
              <span className="text-white font-bold text-xl retro-text">DAY {day}</span>
            </div>
            
            <div className={`flash-badge flex items-center gap-2 px-4 py-2 rounded-lg ${
              customersServed >= dailyQuota ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              <Target className="w-5 h-5 text-white" />
              <span className="text-white font-bold retro-text">{customersServed}/{dailyQuota}</span>
            </div>
            
            <div className={`flash-badge flex items-center gap-2 px-4 py-2 rounded-lg ${
              dayTimeLeft < 30 ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}>
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white font-bold retro-text">
                {Math.floor(dayTimeLeft / 60)}:{(dayTimeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            <button
              onClick={() => {
                setDayTimeLeft(0);
                setGameState('dayEnd');
              }}
              className="flash-button bg-gradient-to-b from-orange-500 to-orange-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 glossy"
              title="Skip to end of day"
            >
              <span className="font-bold retro-text text-sm">SKIP DAY</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowInfo(true)}
              className="flash-button bg-gradient-to-b from-purple-500 to-purple-700 text-white p-2 rounded-lg"
              title="How to Play"
            >
              <Info className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setShowShop(true)}
              className="flash-button bg-gradient-to-b from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 glossy"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold retro-text">SHOP</span>
            </button>
            
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flash-button bg-gradient-to-b from-yellow-500 to-yellow-700 text-white p-2 rounded-lg"
              title="Leaderboard"
            >
              <Trophy className="w-6 h-6" />
            </button>
            
            <div className="flash-badge bg-gradient-to-r from-gray-700 to-gray-800 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-600">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white font-bold">{customersServed}/{totalCustomers}</span>
            </div>
            
            <div className="flash-badge bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-yellow-500">
              <Coins className="w-5 h-5 text-yellow-200 coin-spin" />
              <span className="text-white font-bold retro-text">{coins}</span>
            </div>
            
            <div className="flash-badge bg-gradient-to-r from-purple-600 to-purple-700 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-purple-500">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-bold retro-text">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {hint && station !== 'orders' && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-3 text-center font-bold border-b-4 border-yellow-600 shadow-lg retro-text">
          {hint}
        </div>
      )}

      {upgrades.miguelHired && miguelWorking && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 flex items-center justify-between border-b-4 border-green-700 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-lg flash-badge">
              <img src={miguelImg} alt="Miguel" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold retro-text text-lg">Miguel is working on {miguelCustomer?.name}'s car</p>
              <div className="w-48 retro-progress">
                <div className="loading-bar h-4 rounded-lg transition-all" style={{ width: `${miguelProgress}%` }} />
              </div>
            </div>
          </div>
          <span className="text-xl font-bold retro-text">{Math.round(miguelProgress)}%</span>
        </div>
      )}

      {showShop && (
        <div className="fixed inset-0 flash-overlay flex items-center justify-center z-50">
          <div className="flash-panel p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-4xl font-bold text-white retro-text neon-glow">UPGRADE SHOP</h2>
              <button onClick={() => setShowShop(false)} className="flash-button bg-gradient-to-b from-red-500 to-red-700 text-white p-2 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-6 flash-badge bg-gradient-to-r from-yellow-600 to-yellow-700 px-4 py-3 rounded-lg">
              <Coins className="w-8 h-8 text-yellow-200 coin-spin" />
              <span className="text-white font-bold text-2xl retro-text">{coins} COINS</span>
            </div>
            <div className="space-y-4">
              {shopItems.map(item => {
                const currentLevel = upgrades[item.id];
                const isMiguel = item.id === 'miguelHired';
                const cost = isMiguel ? item.cost : item.cost * currentLevel;
                const canAfford = coins >= cost;
                const maxed = isMiguel ? upgrades.miguelHired : currentLevel >= item.maxLevel;
                
                return (
                  <div key={item.id} className="flash-panel p-4 flex justify-between items-center bg-gradient-to-r from-gray-700 to-gray-800">
                    <div className="flex items-center gap-4">
                      {isMiguel && (
                        <div className="w-14 h-14 bg-white rounded-full overflow-hidden flex items-center justify-center border-4 border-orange-500 flash-badge">
                          <img src={miguelImg} alt="Miguel" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-bold text-xl retro-text">{item.name}</h3>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                        {!isMiguel && <p className="text-yellow-400 text-sm mt-1 font-bold">Level: {currentLevel}/{item.maxLevel}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => buyUpgrade(item.id)}
                      disabled={!canAfford || maxed}
                      className={`flash-button px-6 py-3 rounded-lg font-bold text-lg retro-text ${
                        maxed ? 'bg-gradient-to-b from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed' :
                        canAfford ? 'bg-gradient-to-b from-green-500 to-green-700 text-white glossy' : 
                        'bg-gradient-to-b from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {maxed ? (isMiguel ? '✓ HIRED' : '✓ MAX') : `${cost} 💰`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showInfo && (
        <div className="fixed inset-0 flash-overlay flex items-center justify-center z-50">
          <div className="flash-panel p-8 max-w-2xl w-full mx-4 max-h-screen overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-4xl font-bold text-white retro-text neon-glow">HOW TO PLAY</h2>
              <button onClick={() => setShowInfo(false)} className="flash-button bg-gradient-to-b from-red-500 to-red-700 text-white p-2 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-white space-y-4" style={{fontFamily: 'Comic Neue, cursive'}}>
              {/* ...existing how to play content... */}
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="flash-button w-full mt-6 bg-gradient-to-b from-blue-500 to-blue-700 text-white px-6 py-4 text-xl font-bold glossy retro-text"
            >
              GOT IT!
            </button>
          </div>
        </div>
      )}

      {showLeaderboard && gameState === 'playing' && (
        <div className="fixed inset-0 flash-overlay flex items-center justify-center z-50">
          <div className="flash-panel p-8 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-400 coin-spin" />
                <h2 className="text-4xl font-bold text-white retro-text neon-glow">LEADERBOARD</h2>
              </div>
              <button onClick={() => setShowLeaderboard(false)} className="flash-button bg-gradient-to-b from-red-500 to-red-700 text-white p-2 rounded-lg">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            {getLeaderboard().length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl text-gray-300 retro-text">No entries yet!</p>
                <p className="text-xl text-gray-400 mt-2">Be the first to make it on the leaderboard!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getLeaderboard().map((entry, index) => (
                  <div 
                    key={index} 
                    className={`flash-badge p-4 rounded-lg flex items-center justify-between ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 
                      index === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700' : 
                      'bg-gradient-to-r from-gray-600 to-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-3xl font-bold text-white w-12 retro-text">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-white retro-text">{entry.name}</div>
                        <div className="text-sm text-gray-200">
                          Day {entry.day} • {entry.carsBuilt} cars • {entry.perfectCars} perfect
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-yellow-300 retro-text" style={{
                      textShadow: '2px 2px 0px #000, 0 0 10px rgba(255,255,0,0.8)'
                    }}>
                      {entry.score.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowLeaderboard(false)}
              className="flash-button w-full mt-6 bg-gradient-to-b from-orange-400 to-orange-600 text-white px-6 py-3 text-xl font-bold glossy retro-text"
            >
              BACK TO GAME
            </button>
          </div>
        </div>
      )}

      <div className="p-6 h-[calc(100vh-80px)] overflow-auto">
        {station === 'orders' && (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-4xl font-bold text-white mb-4 retro-text neon-glow">CUSTOMER QUEUE</h2>
            <p className="text-xl text-gray-300 mb-8 retro-text">Click "Take Next Order" to serve a customer!</p>
            <div className="flex gap-6 mb-8">
              {customerQueue.slice(0, 3).map((customer, idx) => (
                <div key={idx} className="flash-panel bg-gradient-to-b from-gray-700 to-gray-800 p-6 rounded-lg">
                  <div className="w-20 h-20 bg-white rounded-full mb-3 flex items-center justify-center overflow-hidden border-4 border-orange-500 flash-badge mx-auto">
                    <img src={getProfilePic(customer.name)} alt={customer.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <p className="text-white text-center text-xl font-bold retro-text">{customer.name}</p>
                </div>
              ))}
            </div>
            {customerQueue.length > 0 && (
              <button 
                onClick={takeOrder}
                className="flash-button bg-gradient-to-b from-green-500 to-green-700 text-white px-12 py-5 rounded-lg text-3xl font-bold glossy retro-text"
              >
                TAKE NEXT ORDER
              </button>
            )}
          </div>
        )}

        {station !== 'orders' && currentOrder && (
          <div className="grid grid-cols-2 gap-6">
            <div className="flash-panel bg-gradient-to-b from-yellow-100 to-yellow-200 p-6 rounded-lg shadow-2xl h-fit border-4 border-yellow-500">
              <h3 className="text-3xl font-bold mb-4 text-center pb-3 retro-text" style={{
                color: '#ff6600',
                textShadow: '2px 2px 0px #000, 0 0 10px rgba(255,102,0,0.5)'
              }}>
                {currentCustomer.name}'S ORDER
              </h3>
              <div className="space-y-3 text-xl font-bold" style={{fontFamily: 'Comic Neue, cursive'}}>
                <div className="bg-white p-3 rounded-lg border-2 border-gray-300 bevel">
                  <strong className="text-orange-600">Frame:</strong> <span className="text-gray-800">{currentOrder.frame.toUpperCase()}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border-2 border-gray-300 bevel">
                  <strong className="text-orange-600">Color:</strong> <span className="text-gray-800">{currentOrder.color.toUpperCase()}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border-2 border-gray-300 bevel">
                  <strong className="text-orange-600">Tires:</strong> <span className="text-gray-800">{currentOrder.tires.toUpperCase()}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border-2 border-gray-300 bevel">
                  <strong className="text-orange-600">Engine:</strong> <span className="text-gray-800">{currentOrder.engine.toUpperCase()}</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white rounded-lg border-4 border-gray-300 bevel">
                <CarDisplay car={currentOrder} isOrder={true} />
              </div>
            </div>

            <div className="flash-panel bg-gradient-to-b from-gray-700 to-gray-800 p-6 rounded-lg border-4 border-gray-600">
              <h3 className="text-3xl font-bold text-white mb-6 text-center retro-text neon-glow">
                {station === 'frame' && 'SELECT FRAME'}
                {station === 'color' && 'PAINT CAR'}
                {station === 'tires' && 'INSTALL TIRES'}
                {station === 'engine' && 'INSTALL ENGINE'}
                {station === 'checkout' && 'REVIEW & DELIVER'}
              </h3>

              {carProgress && (
                <div className="mb-6 p-4 bg-gray-900 rounded-lg border-4 border-gray-700 bevel">
                  <CarDisplay 
                    car={carProgress} 
                    interactive={station === 'tires'}
                    onTireClick={handleTirePlacement}
                    paintable={station === 'color'}
                  />
                </div>
              )}

              {station === 'frame' && (
                <div className="grid grid-cols-2 gap-4">
                  {frames.map(frame => (
                    <button
                      key={frame}
                      onClick={() => selectFrame(frame)}
                      className="flash-button bg-gradient-to-b from-blue-500 to-blue-700 text-white p-6 rounded-lg font-bold glossy"
                    >
                      <div className="mb-3 p-2 bg-white rounded-lg">
                        <CarSVG frame={frame} color="blue" showTires={false} showEngine={false} />
                      </div>
                      <span className="retro-text text-2xl">{frame.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}

              {station === 'color' && (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`h-20 rounded-lg border-4 transition flash-button bevel ${
                          selectedColor === color ? 'border-white scale-110 shadow-2xl' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: colorMap[color] }}
                      />
                    ))}
                  </div>
                  {selectedColor && (
                    <div>
                      <div className="retro-progress mb-4">
                        <div 
                          className="loading-bar h-8 rounded-lg transition-all flex items-center justify-center text-white font-bold text-lg retro-text"
                          style={{ width: `${paintProgress}%` }}
                        >
                          {Math.round(paintProgress)}%
                        </div>
                      </div>
                      <div className="flash-panel bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 rounded-lg text-center font-bold text-xl retro-text border-4 border-yellow-600">
                        MOVE CURSOR OVER CAR TO PAINT!
                      </div>
                    </div>
                  )}
                </div>
              )}

              {station === 'tires' && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {tireTypes.map(tire => (
                      <button
                        key={tire}
                        onClick={() => handleTireSelect(tire)}
                        className={`flash-button py-4 px-6 rounded-lg font-bold text-xl retro-text glossy ${
                          selectedTires === tire 
                            ? 'bg-gradient-to-b from-orange-500 to-orange-700 text-white' 
                            : 'bg-gradient-to-b from-gray-600 to-gray-800 text-white'
                        }`}
                      >
                        {tire.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {selectedTires && (
                    <div className="flash-panel bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-lg text-white text-center text-xl font-bold retro-text border-4 border-blue-500">
                      TIRES PLACED: {tiresPlaced.length}/{getRequiredWheels(carProgress.frame)}
                    </div>
                  )}
                </div>
              )}

              {station === 'engine' && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {engines.map(engine => (
                      <button
                        key={engine}
                        onMouseDown={(e) => {
                          handleEngineSelect(engine);
                          handleEngineMouseDown(e);
                        }}
                        className={`flash-button py-4 px-6 rounded-lg font-bold text-xl retro-text glossy cursor-move ${
                          selectedEngine === engine 
                            ? 'bg-gradient-to-b from-orange-500 to-orange-700 text-white' 
                            : 'bg-gradient-to-b from-gray-600 to-gray-800 text-white'
                        }`}
                      >
                        {engine.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {selectedEngine && !enginePlaced && (
                    <div className="flash-panel bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 rounded-lg text-center font-bold text-xl retro-text mb-4 border-4 border-yellow-600">
                      DRAG ENGINE TO BAY BELOW!
                    </div>
                  )}
                  <div 
                    id="engine-bay"
                    className={`mt-4 border-4 border-dashed rounded-lg p-10 text-center text-white text-2xl font-bold retro-text ${
                      enginePlaced ? 'bg-gradient-to-r from-green-600 to-green-700 border-green-400' : 'bg-gradient-to-r from-gray-700 to-gray-800 border-yellow-400 animate-pulse'
                    }`}
                  >
                    {enginePlaced ? 'ENGINE INSTALLED!' : 'DROP ENGINE HERE'}
                  </div>
                </div>
              )}

              {station === 'checkout' && (
                <div>
                  <div className="flash-panel bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-lg mb-6 text-white border-4 border-gray-600">
                    <h4 className="font-bold mb-4 text-2xl retro-text text-orange-400">REVIEW CAR:</h4>
                    <div className="space-y-3 text-lg font-bold" style={{fontFamily: 'Comic Neue, cursive'}}>
                      <p className="flex justify-between"><span>Frame:</span> <span className="text-green-400">{carProgress.frame.toUpperCase()}</span></p>
                      <p className="flex justify-between"><span>Color:</span> <span className="text-green-400">{carProgress.color.toUpperCase()}</span></p>
                      <p className="flex justify-between"><span>Tires:</span> <span className="text-green-400">{carProgress.tires.toUpperCase()}</span></p>
                      <p className="flex justify-between"><span>Engine:</span> <span className="text-green-400">{carProgress.engine.toUpperCase()}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => finishOrder(false)}
                    className="flash-button w-full bg-gradient-to-b from-green-500 to-green-700 text-white py-6 rounded-lg text-3xl font-bold glossy retro-text"
                  >
                    DELIVER CAR
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {draggingEngine && (
        <div 
          className="fixed pointer-events-none z-50 flash-button bg-gradient-to-b from-orange-500 to-orange-700 text-white px-6 py-4 rounded-lg font-bold shadow-2xl retro-text text-2xl border-4 border-orange-400"
          style={{ 
            left: enginePos.x - 40, 
            top: enginePos.y - 20,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {selectedEngine?.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default CarMechanicGame;
