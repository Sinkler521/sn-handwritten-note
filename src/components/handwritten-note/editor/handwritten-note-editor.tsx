import {
  ReactSketchCanvas,
  ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { RefObject } from "react";

interface HandwrittenNoteEditorProps {
  onChange: (strokes: any[]) => void;
  canvasRef: RefObject<ReactSketchCanvasRef>;
}

export const HandwrittenNoteEditor = ({
  onChange,
  canvasRef
}: HandwrittenNoteEditorProps) => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <ReactSketchCanvas
        ref={canvasRef}
        canvasColor="transparent"
        strokeWidth={2}
        strokeColor="black"
        onChange={onChange}
      />
    </div>
  );
};