import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { MapSection } from './components/MapSection';
import { OverviewCard } from './components/OverviewCard';
import { RealtimeCard } from './components/RealtimeCard';
import { TraceCard } from './components/TraceCard';
import { SummaryCard } from './components/SummaryCard';
import { generateEvents } from './utils';
import { EventData } from './types';

function App() {
  const [currentYear, setCurrentYear] = useState('2026');
  const [isSummary, setIsSummary] = useState(false);
  
  const eventsDb = useMemo(() => ({
    '2026': generateEvents('2026'),
    '2025': generateEvents('2025'),
    '2024': generateEvents('2024')
  }), []);

  const currentEvents = eventsDb[currentYear as keyof typeof eventsDb] || [];
  const [currentEvent, setCurrentEvent] = useState<EventData>(currentEvents[0]);

  useEffect(() => {
    setCurrentEvent(currentEvents[0]);
    setIsSummary(false);
  }, [currentYear, currentEvents]);

  const handleYearChange = (year: string) => {
    setCurrentYear(year);
  };

  const handleEventSelect = (event: EventData) => {
    setCurrentEvent(event);
    setIsSummary(false);
  };

  return (
    <div className="w-full h-screen p-2 flex flex-col overflow-hidden bg-[#F4F7FA]">
      <Header currentYear={currentYear} onYearChange={handleYearChange} />

      <Timeline 
        events={currentEvents} 
        currentEventId={currentEvent.id}
        isSummary={isSummary}
        onEventSelect={handleEventSelect}
        onSummarySelect={() => setIsSummary(true)}
      />

      <div className="flex-1 min-h-0 grid grid-cols-[1.6fr_1fr] gap-2">
        {/* Left Column: Map/Grid */}
        <div className="min-h-0">
          <MapSection 
            currentEvent={currentEvent} 
            currentYear={currentYear}
            isSummary={isSummary}
          />
        </div>

        {/* Right Column: Details or Summary */}
        <div className="flex flex-col gap-2 h-full min-h-0">
          {!isSummary ? (
            <>
              {/* Overview - Condensed height */}
              <div className="flex-none">
                <OverviewCard event={currentEvent} />
              </div>
              
              {/* Monitoring - Dynamic height, takes priority */}
              <div className="flex-1 min-h-0">
                <RealtimeCard event={currentEvent} />
              </div>
              
              {/* Trace - Bottom fixed but responsive height */}
              <div className="flex-none">
                <TraceCard event={currentEvent} />
              </div>
            </>
          ) : (
            <SummaryCard events={currentEvents} currentYear={currentYear} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;