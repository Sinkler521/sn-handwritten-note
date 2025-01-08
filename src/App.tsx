import React, { useState } from 'react';
import { HandwrittenNote } from './components/handwritten-note/HandwrittenNote';
import { Toaster, toast } from 'sonner'
import './styles.css';

function App() {
  const [componentsCreated, setComponentsCreated] = useState<any[]>([]);

  const [showNote, setShowNote] = useState<boolean>(false);

  return (
    <div className="container w-full min-h-screen flex flex-col bg-gray-100">
      <Toaster position="top-right" />
      <div className="button-container px-4 py-5 border-b border-gray-300 flex justify-end">
        <button
          onClick={() => setShowNote(true)}
          className="px-3 transition-all bg-gray-50 rounded hover:bg-green-50 hover:scale-95"
        >
          + Create Note
        </button>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        {componentsCreated.length === 0 ? (
          <p className="text-gray-500 text-center">No notes created yet</p>
        ) : (
          <ul
            className="
              grid 
              grid-cols-1 
              sm:grid-cols-2 
              md:grid-cols-3 
              lg:grid-cols-4 
              gap-4
            "
          >
            {componentsCreated.map((item, idx) => (
              <li
                key={idx}
                className="p-4 border bg-white"
              >
                Note Placeholder
              </li>
            ))}
          </ul>
        )}
      </div>

      {showNote && (
          <HandwrittenNote
            isOpened={showNote}
            onClose={() => setShowNote(false)}
          />
      )}
    </div>
  );
}

export default App;
