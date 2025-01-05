import React from 'react';
import { HandwrittenNote } from './components/handwritten-note/HandwrittenNote';
import { HandwrittenNoteType } from './components/handwritten-note/HandwrittenNoteTypes';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <HandwrittenNote
        noteType={HandwrittenNoteType.SQUARED}
        noteImageData={null}
        isOpened={false}
      />
    </div>
  );
}

export default App;