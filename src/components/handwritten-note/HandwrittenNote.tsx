import React, { useState, MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import { HandwrittenNoteType } from './HandwrittenNoteTypes';
import "./handwritten-note-styles.css"

type HandwrittenNoteProps = {
  isOpened: boolean;
  onClose: () => void;
};

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  isOpened,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);
  const [noteType, setNoteType] = useState<HandwrittenNoteType>(
    HandwrittenNoteType.SQUARED
  );

  if (!isOpened) return null;

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContainerClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  if (step === 1) {
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={handleOverlayClick}
      >
        <div className="bg-white p-6 rounded shadow w-80" onClick={handleContainerClick}>
          <h2 className="text-xl font-bold mb-4">Select Template</h2>
          <select
            className="border p-2 w-full mb-4"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as HandwrittenNoteType)}
          >
            <option value={HandwrittenNoteType.SQUARED}>Squared</option>
            <option value={HandwrittenNoteType.RULED}>Ruled</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => onClose()}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setStep(2)}
            >
              Open
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const backgroundClass =
    noteType === HandwrittenNoteType.SQUARED
      ? 'paper-squared'
      : 'paper-ruled';

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={handleOverlayClick}
    >
      <div
        className={`
          relative 
          w-3/4 max-w-3xl 
          aspect-[210/297] 
          overflow-hidden 
          bg-white 
          ${backgroundClass}
        `}
        onClick={handleContainerClick}
      >
        <button
          className="absolute top-2 right-2 bg-gray-300 px-3 py-1 rounded"
          onClick={() => onClose()}
        >
          Close
        </button>
        {/* CONTENT HERE (CANVAS) */}
      </div>
    </div>,
    document.body
  );
};
