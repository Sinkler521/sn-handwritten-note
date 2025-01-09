import {
    ReactSketchCanvas,
    type ReactSketchCanvasRef,
  } from "react-sketch-canvas";
  import { type ChangeEvent, useRef, useState, RefObject} from "react";

  interface HandwrittenNoteEditorProps{
    editorContent?: any; // TODO figure out type
    editorAllData?: any; // SAME
    onChange: (strokes: any[]) => void;
    canvasRef: RefObject<RefObject<HTMLDivElement> | undefined>;
  }

  export const HandwrittenNoteEditor = ({
    editorContent,
    editorAllData,
    onChange,
    canvasRef
  }: HandwrittenNoteEditorProps) => {

    return (
        <>
            <div className="w-full h-full flex justify-center items-center">
                <ReactSketchCanvas
                 canvasColor="transparent"
                 // @ts-ignore
                  ref={canvasRef}
                  strokeWidth={2}
                  strokeColor="black"
                  onChange={onChange}
                />
            </div>
        </>
    )
  }