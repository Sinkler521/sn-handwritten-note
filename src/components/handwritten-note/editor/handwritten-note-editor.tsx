import {
  ReactSketchCanvas,
  ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { HandwrittenDrawingPanel } from "./note-drawing-panel";
import { RefObject, useState} from "react";

interface HandwrittenNoteEditorProps {
  onChange: (strokes: any[]) => void;
  canvasRef: RefObject<ReactSketchCanvasRef>;
}

export const HandwrittenNoteEditor = ({
  onChange,
  canvasRef
}: HandwrittenNoteEditorProps) => {
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <HandwrittenDrawingPanel
        canvasRef={canvasRef}
        color={color}
        strokeWidth={strokeWidth}
        isEraser={isEraser}
        onColorChange={setColor}
        onStrokeWidthChange={setStrokeWidth}
        onEraserChange={setIsEraser}
      />
      <ReactSketchCanvas
        ref={canvasRef}
        strokeColor={isEraser ? "transparent" : color}
        strokeWidth={strokeWidth}
        eraseMode={isEraser}
        canvasColor="transparent"
        onChange={onChange}
      />
    </div>
  );
};