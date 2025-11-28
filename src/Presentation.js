import React from 'react';

const Presentation = () => {
  return (
    <div className="min-h-screen bg-white text-black p-10">
      <div className="max-w-4xl mx-auto space-y-10">

        <h1 className="text-5xl font-bold">Motion Aftereffect: Neural Mechanism</h1>

        <p className="text-xl leading-relaxed">
          The motion aftereffect arises because direction-selective neurons in your visual cortex
          (especially in area MT/V5) adapt when you stare at moving stimuli. When the image stops,
          the adapted population fires less than the opposite-direction neurons. That imbalance 
          creates a false signal of motion in the reverse direction.
        </p>

        <p className="text-xl leading-relaxed">
          MT neurons respond strongly to specific directions and speeds of motion. During
          adaptation, neurons tuned to the stimulus direction fatigue, while those tuned to the
          opposite direction stay fresh. When the stimulus becomes static, the brain interprets the
          relative difference in activity as real motion — even though nothing is moving.
        </p>

        <div className="space-y-8">
          <img
            src="/images/AreaMT.png"
            alt="Visual cortex diagram"
            className="w-full rounded-lg shadow-lg"
          />

        </div>

      </div>
    </div>
  );
};

export default Presentation;
