import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">Motion Aftereffect Demo</h1>
        <p className="text-gray-400 text-center mb-6">
          Experience the illusion of reversed motion after adaptation
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="w-full border-2 border-gray-700 rounded"
              />
              
              {phase === 'adapting' && (
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    Keep fixating on the red cross!
                  </div>
                  <div className="text-xl mt-2">
                    Time remaining: {timeRemaining.toFixed(1)}s
                  </div>
                </div>
              )}
              
              {phase === 'static' && (
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    Do you see the illusion?
                  </div>
                  <div className="text-lg mt-2">
                    The pattern should appear to move in the opposite direction
                  </div>
                  <button
                    onClick={() => setPhase('rating')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
                  >
                    Rate the Illusion
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {phase === 'setup' && (
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pattern Type
                  </label>
                  <select
                    value={patternType}
                    onChange={(e) => setPatternType(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="spiral">Concentric Spirals</option>
                    <option value="stripes">Vertical Stripes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Direction
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="1">
                      {patternType === 'spiral' ? 'Clockwise' : 'Right'}
                    </option>
                    <option value="-1">
                      {patternType === 'spiral' ? 'Counterclockwise' : 'Left'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Speed: {speed}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Adaptation Time: {adaptationTime}s
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="5"
                    value={adaptationTime}
                    onChange={(e) => setAdaptationTime(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={startAdaptation}
                  className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Adaptation
                </button>
              </div>
            )}

            {(phase === 'adapting' || phase === 'static') && (
              <div className="bg-gray-800 rounded-lg p-4">
                <button
                  onClick={reset}
                  className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            )}

            {phase === 'rating' && (
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <h3 className="text-xl font-semibold">Rate Your Experience</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Illusion Strength: {strength}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={strength}
                    onChange={(e) => setStrength(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>No effect</span>
                    <span>Very strong</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration: {duration}s
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Instant</span>
                    <span>20+ seconds</span>
                  </div>
                </div>

                <button
                  onClick={submitRating}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Submit & Continue
                </button>
              </div>
            )}

            {/* Data Summary */}
            {responses.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Collected Data ({responses.length} trials)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-gray-700 p-2 rounded">
                    Avg Strength: {(responses.reduce((sum, r) => sum + r.strengthRating, 0) / responses.length).toFixed(1)}/10
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    Avg Duration: {(responses.reduce((sum, r) => sum + r.durationRating, 0) / responses.length).toFixed(1)}s
                  </div>
                </div>
                <button
                  onClick={downloadData}
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold text-sm"
                >
                  Download Data (JSON)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <strong>1. Configure:</strong> Choose your pattern type, direction, speed, and adaptation duration.
            </p>
            <p>
              <strong>2. Adapt:</strong> Fixate on the red cross while the pattern moves for the specified time. Keep your eyes on the cross!
            </p>
            <p>
              <strong>3. Observe:</strong> When the pattern stops, it should appear to move in the opposite direction due to neural adaptation.
            </p>
            <p>
              <strong>4. Rate:</strong> Record how strong and long-lasting the illusion was.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              <strong>Tip:</strong> Try different speeds and adaptation times to see how they affect the illusion strength. Longer adaptation typically produces stronger aftereffects!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionAftereffectDemo;