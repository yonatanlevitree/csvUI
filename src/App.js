import React from 'react';
import SequestrationCalculator from './SequestrationCalculator';
import logo from './logo_full copy.png';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex flex-col items-center py-8">
        <img src={logo} alt="Levitree Logo" className="h-20 mb-4" />
      </header>
      <SequestrationCalculator />
    </div>
  );
}

export default App;