import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { HandwrittenNoteType } from './HandwrittenNoteTypes';
import './handwritten-note-styles.css'

// Replace with the new drawing library
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

// React icons for the toolbar
import { AiOutlineFullscreen, AiOutlineClose, AiOutlineMinusCircle } from 'react-icons/ai';
import { FaEraser } from 'react-icons/fa';

type HandwrittenNoteProps = {
  noteType?: HandwrittenNoteType;
  noteImageData?: string | null; // For thumbnail preview
  isOpened?: boolean;
  onChangeType?: (type: HandwrittenNoteType) => void;
};

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  noteType = HandwrittenNoteType.SQUARED,
  noteImageData,
  isOpened = false,
  onChangeType,
}) => {
  const [opened, setOpened] = useState<boolean>(isOpened);
  const [currentType, setCurrentType] = useState<HandwrittenNoteType>(noteType);

  // Drawing settings
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // Ref for the ReactSketchCanvas
  const sketchRef = useRef<ReactSketchCanvasRef>(null);

  // When user selects paper type
  const handleTypeSelect = (type: HandwrittenNoteType) => {
    setCurrentType(type);
    onChangeType?.(type);
  };

  // Toolbar button handlers (demo only)
  const handleMinimize = () => {
    console.log('Minimize pressed');
  };

  const handleFullscreen = () => {
    console.log('Fullscreen pressed');
  };

  const handleClose = async () => {
    console.log('Close (Save) pressed');
    // Example: you could export the drawing as an image or paths
    // const exportedData = await sketchRef.current?.exportImage('png');
    // console.log('Exported data: ', exportedData);
    setOpened(false);
  };

  const handleClear = () => {
    sketchRef.current?.clearCanvas();
  };

  const handleErase = () => {
    // Switch stroke color to white or transparent to "simulate" erasing
    // Alternatively, you can use "eraseMode" if the library supports it
    setStrokeColor('#FFFFFF');
  };

  const handleDrawMode = () => {
    setStrokeColor('#000000');
  };

  // Render the main drawing portal content
  const renderPortalContent = () => {
    // Determine background based on selected "paper" type
    const backgroundClass =
      currentType === HandwrittenNoteType.RULED
        ? 'paper-ruled'
        : 'paper-squared';

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        {/* Container with A4-like ratio */}
        <div
          className={`
            relative w-3/4 max-w-3xl aspect-[210/297] 
            bg-white 
            overflow-hidden
            flex flex-col
          `}
        >
          {/* Header with action buttons */}
          <div className="absolute top-2 right-2 flex space-x-3">
            <button
              className="text-gray-800 hover:text-gray-500"
              onClick={handleMinimize}
            >
              <AiOutlineMinusCircle size={24} />
            </button>
            <button
              className="text-gray-800 hover:text-gray-500"
              onClick={handleFullscreen}
            >
              <AiOutlineFullscreen size={24} />
            </button>
            <button
              className="text-gray-800 hover:text-gray-500"
              onClick={handleClose}
            >
              <AiOutlineClose size={24} />
            </button>
          </div>

          {/* Toolbar for stroke color, width, erase, etc. */}
          <div className="absolute top-2 left-2 flex space-x-2 bg-white bg-opacity-80 rounded p-1 shadow">
            {/* Color picker (simple example) */}
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 p-0 border-0"
              title="Pick a color"
            />
            {/* Stroke width */}
            <input
              type="range"
              min={1}
              max={10}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              title="Stroke width"
            />
            {/* Erase / Draw Mode */}
            <button
              className="text-gray-800 hover:text-gray-500"
              onClick={handleErase}
              title="Eraser"
            >
              <FaEraser size={20} />
            </button>
            <button
              className="text-gray-800 hover:text-gray-500"
              onClick={handleDrawMode}
              title="Draw Mode"
            >
              ✏️
            </button>
            {/* Clear */}
            <button
              className="text-gray-800 hover:text-gray-500"
              onClick={handleClear}
              title="Clear Canvas"
            >
              Clear
            </button>
          </div>

          {/* Main drawing area */}
          <div
            className={`
              flex-1 
              ${backgroundClass} 
              bg-cover 
              bg-center 
              p-2
              relative
            `}
          >
            <ReactSketchCanvas
              ref={sketchRef}
              strokeWidth={strokeWidth}
              strokeColor={strokeColor}
              canvasColor="transparent" 
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Thumbnail preview */}
      <div
        className="inline-block border rounded p-2 cursor-pointer"
        onClick={() => setOpened(true)}
      >
        {noteImageData ? (
          <img
            src={noteImageData}
            alt="Preview of note"
            className="w-32 h-32 object-cover"
          />
        ) : (
          <div className="w-32 h-32 flex items-center justify-center bg-gray-200">
            <span className="text-gray-600 text-sm">No preview</span>
          </div>
        )}
      </div>

      {/* Paper type selector (inline for demo) */}
      <div className="mt-2">
        <label className="mr-2">Choose paper type:</label>
        <select
          value={currentType}
          onChange={(e) =>
            handleTypeSelect(e.target.value as HandwrittenNoteType)
          }
          className="border p-1"
        >
          <option value={HandwrittenNoteType.SQUARED}>Squared (в клеточку)</option>
          <option value={HandwrittenNoteType.RULED}>Ruled (в линейку)</option>
        </select>
      </div>

      {/* Portal for the expanded note */}
      {opened &&
        ReactDOM.createPortal(
          renderPortalContent(),
          document.body
        )}
    </div>
  );
};