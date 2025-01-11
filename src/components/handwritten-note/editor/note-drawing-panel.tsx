import React, { useState } from 'react';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import {
  MdUndo,
  MdRedo,
  MdDelete,
  MdRefresh,
  MdSave,
  MdImage,
  MdPanTool,
  MdOutlineBrush
} from 'react-icons/md';
import "../handwritten-note-styles.css";

interface HandwrittenDrawingPanelProps {
  canvasRef: React.RefObject<ReactSketchCanvasRef>;

  color: string;
  strokeWidth: number;
  isEraser: boolean;

  onColorChange: (newColor: string) => void;
  onStrokeWidthChange: (newWidth: number) => void;
  onEraserChange: (eraser: boolean) => void;
}

export const HandwrittenDrawingPanel = (props: HandwrittenDrawingPanelProps) => {
  const [showStrokeMenu, setShowStrokeMenu] = useState(false);
  const [showBgModal, setShowBgModal] = useState(false);
  const [bgInputValue, setBgInputValue] = useState("");

  const handleUndo = () => {
    props.canvasRef.current?.undo();
  };

  const handleRedo = () => {
    props.canvasRef.current?.redo();
  };

  const handleClear = () => {
    props.canvasRef.current?.clearCanvas();
  };

  const handleReset = () => {
    props.canvasRef.current?.resetCanvas();
  };

  const handleExport = async () => {
    try {
      const dataUrl = await props.canvasRef.current?.exportImage("png");
      if (dataUrl) {
        window.open(dataUrl, "_blank");
      }
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleApplyBackground = () => {
    if (bgInputValue.trim()) {
      props.canvasRef.current?.loadBackgroundFromURL(bgInputValue)
        .then(() => console.log("Background loaded"))
        .catch((err) => console.error("Error loading background:", err));
    }
    setShowBgModal(false);
    setBgInputValue("");
  };

  const handleCancelBackground = () => {
    setShowBgModal(false);
    setBgInputValue("");
  };

  return (
    <div className="handwritten-drawing-panel px-6 rounded-b-xl">
      <button
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded-md flex items-center justify-center ml-1 p-2 transition-all hover:scale-105"
        onClick={() => props.onEraserChange(false)}
      >
        <MdOutlineBrush size={18} color="rgb(48, 48, 48)" />
      </button>
      <button
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded-md flex items-center justify-center ml-1 p-2 transition-all hover:scale-105"
        onClick={() => props.onEraserChange(true)}
      >
        <MdPanTool size={18} color="rgb(48, 48, 48)" />
      </button>

      <button
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded-md flex items-center justify-center ml-1 p-2 transition-all hover:scale-105"
        onClick={handleUndo}
      >
        <MdUndo size={18} color="rgb(48, 48, 48)" />
      </button>
      <button
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded-md flex items-center justify-center ml-1 p-2 transition-all hover:scale-105"
        onClick={handleRedo}
      >
        <MdRedo size={18} color="rgb(rgb(48, 48, 48))" />
      </button>

      <button
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded-md flex items-center justify-center ml-1 p-2 transition-all hover:scale-105"
        onClick={handleClear}
      >
        <MdDelete size={18} color="rgb(rgb(48, 48, 48))" />
      </button>
      <button
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded-md flex items-center justify-center ml-1 p-2 transition-all hover:scale-105"
        onClick={handleReset}
      >
        <MdRefresh size={18} color="rgb(48, 48, 48)" />
      </button>

      <button
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded-md flex items-center justify-center ml-1 p-2 transition-all hover:scale-105"
        onClick={() => setShowStrokeMenu(!showStrokeMenu)}
      >
        {props.strokeWidth}px
      </button>

      <button
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded-md flex items-center justify-center ml-1 p-2 transition-all hover:scale-105"
        onClick={() => setShowBgModal(true)}
      >
        <MdImage size={18} color="rgb(48, 48, 48)" />
      </button>

      <button
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded-md flex items-center justify-center ml-1 p-2 transition-all hover:scale-105"
        onClick={handleExport}
      >
        <MdSave size={18} color="rgb(48, 48, 48)" />
      </button>

      <input
        type="color"
        className="handwritten-drawing-panel-button bg-white border border-gray-200 rounded flex items-center justify-center m-1 cursor-pointer p-0"
        style={{ padding: 0, width: '60px', height: '60px' }}
        value={props.color}
        onChange={(e) => props.onColorChange(e.target.value)}
      />

      {showStrokeMenu && (
        <div className="absolute bg-white border border-gray-200 rounded p-2 mt-2">
          <input
            type="range"
            min={1}
            max={40}
            value={props.strokeWidth}
            onChange={(e) => props.onStrokeWidthChange(Number(e.target.value))}
          />
          <div className="text-xs text-center">{props.strokeWidth}px</div>
        </div>
      )}

      {showBgModal && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded p-4 border border-gray-300">
            <h2 className="text-lg font-semibold mb-2">Set Background Image</h2>
            <input
              type="text"
              placeholder="Paste image URL here..."
              className="border p-1 w-64 mb-3"
              value={bgInputValue}
              onChange={(e) => setBgInputValue(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 border rounded bg-gray-200"
                onClick={handleCancelBackground}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 border rounded bg-blue-500 text-white"
                onClick={handleApplyBackground}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};