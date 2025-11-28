import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import Presentation from './Presentation';


const MotionAftereffectDemo = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  
  const [phase, setPhase] = useState('setup'); // setup, adapting, static, rating
  const [patternType, setPatternType] = useState('spiral'); // spiral or stripes
  const [speed, setSpeed] = useState(2);
  const [direction, setDirection] = useState(1); // 1 or -1
  const [adaptationTime, setAdaptationTime] = useState(20);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [offset, setOffset] = useState(0);
  
  // Rating state
  const [strength, setStrength] = useState(5);
  const [duration, setDuration] = useState(5);
  const [responses, setResponses] = useState([]);
  const [page, setPage] = useState("demo"); // demo or presentation

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const drawSpiral = (animated) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const numSpirals = 12;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;
      
      for (let i = 0; i < numSpirals; i++) {
        ctx.strokeStyle = i % 2 === 0 ? '#ffffff' : '#000000';
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
          const spiralOffset = animated ? offset : 0;
          const radius = (angle / (Math.PI * 8)) * maxRadius;
          const x = centerX + radius * Math.cos(angle + spiralOffset + (i * Math.PI * 2 / numSpirals));
          const y = centerY + radius * Math.sin(angle + spiralOffset + (i * Math.PI * 2 / numSpirals));
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      // Draw fixation cross
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY);
      ctx.lineTo(centerX + 10, centerY);
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX, centerY + 10);
      ctx.stroke();
    };
    
    const drawStripes = (animated) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const stripeWidth = 40;
      const stripesOffset = animated ? offset % (stripeWidth * 2) : 0;
      
      for (let x = -stripeWidth * 2; x < canvas.width + stripeWidth * 2; x += stripeWidth * 2) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + stripesOffset, 0, stripeWidth, canvas.height);
      }
      
      // Draw fixation cross
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY);
      ctx.lineTo(centerX + 10, centerY);
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX, centerY + 10);
      ctx.stroke();
    };
    
    const animate = () => {
      if (phase === 'adapting') {
        if (patternType === 'spiral') {
          drawSpiral(true);
        } else {
          drawStripes(true);
        }
        setOffset(prev => prev + speed * direction * 0.02);
        animationRef.current = requestAnimationFrame(animate);
      } else if (phase === 'static') {
        if (patternType === 'spiral') {
          drawSpiral(false);
        } else {
          drawStripes(false);
        }
      }
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, patternType, speed, direction, offset]);

  useEffect(() => {
    if (phase === 'adapting') {
      startTimeRef.current = Date.now();
      const timer = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const remaining = Math.max(0, adaptationTime - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setPhase('static');
          clearInterval(timer);
        }
      }, 100);
      
      return () => clearInterval(timer);
    }
  }, [phase, adaptationTime]);

  const startAdaptation = () => {
    setOffset(0);
    setTimeRemaining(adaptationTime);
    setPhase('adapting');
  };

  const submitRating = () => {
    const response = {
      timestamp: new Date().toISOString(),
      patternType,
      speed,
      direction: direction === 1 ? 'clockwise/right' : 'counterclockwise/left',
      adaptationTime,
      strengthRating: strength,
      durationRating: duration
    };
    
    setResponses(prev => [...prev, response]);
    setPhase('setup');
    setStrength(5);
    setDuration(5);
  };

  const reset = () => {
    setPhase('setup');
    setOffset(0);
    setTimeRemaining(adaptationTime);
  };

  const downloadData = () => {
    const dataStr = JSON.stringify(responses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'motion_aftereffect_data.json';
    link.click();
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setPage(page === "demo" ? "presentation" : "demo")}
          className="bg-white text-black px-4 py-2 rounded-lg shadow font-semibold"
        >
          {page === "demo" ? "Go to Presentation" : "Back to Demo"}
        </button>
      </div>
  
      {page === "demo" ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Waterfall Illusion
            </h1>
            <p className="text-gray-400 text-lg">
              Experience the illusion of reversed motion after neural adaptation
            </p>
          </div>
  
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="w-full rounded-lg shadow-lg"
                  style={{ maxWidth: '600px', margin: '0 auto', display: 'block' }}
                />
                
                {phase === 'adapting' && (
                  <div className="mt-6 text-center bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">
                      Keep fixating on the red cross!
                    </div>
                    <div className="text-3xl font-mono font-bold text-yellow-300">
                      {timeRemaining.toFixed(1)}s
                    </div>
                  </div>
                )}
                
                {phase === 'static' && (
                  <div className="mt-6 text-center bg-green-900/30 border border-green-600/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      Do you see the illusion?
                    </div>
                    <div className="text-base text-gray-300 mb-4">
                      The pattern should appear to move in the opposite direction
                    </div>
                    <button
                      onClick={() => setPhase('rating')}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
                    >
                      Rate the Illusion →
                    </button>
                  </div>
                )}
              </div>
            </div>
  
            {/* Controls */}
            <div className="space-y-4">
              {phase === 'setup' && (
                <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-2 text-xl font-bold mb-6 text-blue-400">
                    <Settings className="w-6 h-6" />
                    <span>Experiment Settings</span>
                  </div>
  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-300">
                        Pattern Type
                      </label>
                      <select
                        value={patternType}
                        onChange={(e) => setPatternType(e.target.value)}
                        className="w-full bg-gray-700 border-2 border-gray-600 hover:border-blue-500 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:border-blue-500"
                      >
                        <option value="spiral">Concentric Spirals</option>
                        <option value="stripes">Vertical Stripes</option>
                      </select>
                    </div>
  
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-300">
                        Direction
                      </label>
                      <select
                        value={direction}
                        onChange={(e) => setDirection(Number(e.target.value))}
                        className="w-full bg-gray-700 border-2 border-gray-600 hover:border-blue-500 rounded-lg px-4 py-3 transition-colors focus:outline-none focus:border-blue-500"
                      >
                        <option value="1">
                          {patternType === 'spiral' ? '↻ Clockwise' : '→ Right'}
                        </option>
                        <option value="-1">
                          {patternType === 'spiral' ? '↺ Counterclockwise' : '← Left'}
                        </option>
                      </select>
                    </div>
  
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-300">
                        Speed: <span className="text-blue-400">{speed}</span>
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.5"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                    </div>
  
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-300">
                        Adaptation Time: <span className="text-blue-400">{adaptationTime}s</span>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        step="5"
                        value={adaptationTime}
                        onChange={(e) => setAdaptationTime(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>10s</span>
                        <span>40s</span>
                      </div>
                    </div>
  
                    <button
                      onClick={startAdaptation}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all transform hover:scale-105 mt-6"
                    >
                      <Play className="w-6 h-6" />
                      Start Adaptation
                    </button>
                  </div>
                </div>
              )}
  
              {(phase === 'adapting' || phase === 'static') && (
                <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
                  <button
                    onClick={reset}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all transform hover:scale-105"
                  >
                    <RotateCcw className="w-6 h-6" />
                    Reset Experiment
                  </button>
                </div>
              )}
  
              {phase === 'rating' && (
                <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-2xl font-bold mb-6 text-purple-400">Rate Your Experience</h3>
  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-300">
                        Illusion Strength: <span className="text-purple-400 text-lg">{strength}/10</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={strength}
                        onChange={(e) => setStrength(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>No effect</span>
                        <span>Very strong</span>
                      </div>
                    </div>
  
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-gray-300">
                        Duration: <span className="text-purple-400 text-lg">{duration}s</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Instant</span>
                        <span>20+ seconds</span>
                      </div>
                    </div>
  
                    <button
                      onClick={submitRating}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105 mt-4"
                    >
                      Submit & Continue
                    </button>
                  </div>
                </div>
              )}
  
              {/* Data Summary */}
              {responses.length > 0 && (
                <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl shadow-xl p-6 border border-purple-700/50">
                  <h3 className="text-xl font-bold mb-4 text-purple-300">
                    Collected Data ({responses.length} trial{responses.length > 1 ? 's' : ''})
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">Average Strength</div>
                      <div className="text-2xl font-bold text-purple-400">
                        {(responses.reduce((sum, r) => sum + r.strengthRating, 0) / responses.length).toFixed(1)}/10
                      </div>
                    </div>
                    <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">Average Duration</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {(responses.reduce((sum, r) => sum + r.durationRating, 0) / responses.length).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={downloadData}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-4 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:scale-105"
                  >
                    Download Data (JSON)
                  </button>
                </div>
              )}
            </div>
          </div>
  
          {/* Instructions */}
          <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl p-8 border border-gray-600">
            <h2 className="text-3xl font-bold mb-6 text-blue-400">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-6 text-gray-300">
              <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
                <div className="text-blue-400 font-bold text-lg mb-2">1. Configure</div>
                <p>Choose your pattern type, direction, speed, and adaptation duration.</p>
              </div>
              <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
                <div className="text-blue-400 font-bold text-lg mb-2">2. Adapt</div>
                <p>Fixate on the red cross while the pattern moves. Keep your eyes on the cross!</p>
              </div>
              <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
                <div className="text-blue-400 font-bold text-lg mb-2">3. Observe</div>
                <p>When the pattern stops, it should appear to move in the opposite direction.</p>
              </div>
              <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
                <div className="text-blue-400 font-bold text-lg mb-2">4. Rate</div>
                <p>Record how strong and long-lasting the illusion was for you.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <Presentation />
      )}
    </>
  );


};

export default MotionAftereffectDemo;