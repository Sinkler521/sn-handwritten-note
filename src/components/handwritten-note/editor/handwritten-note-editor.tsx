import {
    ReactSketchCanvas,
    type ReactSketchCanvasRef,
  } from "react-sketch-canvas";
  import { type ChangeEvent, useRef, useState } from "react";

  interface HandwrittenNoteEditorProps{
    editorContent?: any; // TODO figure out type
    editorAllData?: any; // SAME
    onChange: () => void;
    canvasRef: any;
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
                  ref={canvasRef}
                  
                />
            </div>
        </>
    )
  }