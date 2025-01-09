import React, {
  useState,
  MouseEvent,
  useRef,
  useEffect,
  useCallback,
  CSSProperties,
} from 'react';
import ReactDOM from 'react-dom';
import {
  HandwrittenNoteType,
  getNoteClass,
  allNoteTypes,
} from './HandwrittenNoteTypes';
import { HandwrittenStepCreateNote } from "./steps/Handwritten-step-2"
import { HandwrittenNoteEditor } from './editor/handwritten-note-editor';
import { HandwrittenStepChooseNoteType } from "./steps/Handwritten-step-1"
import { MdMinimize, MdOutlineFullscreen, MdClose } from 'react-icons/md';
import './handwritten-note-styles.css';

type HandwrittenNoteProps = {
  isOpened: boolean;
  onClose: () => void;

  options?: {
    strokes: any[], // strokes - info about drawing
    editorData: any;
  }
};

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  isOpened,
  onClose,
  options
}) => {
  const [step, setStep] = useState<number>(1);
  const [noteType, setNoteType] = useState<undefined | HandwrittenNoteType>(undefined);
  const [backgroundClass, setBackgroundClass] = useState('');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
  const [windowCoordinates, setWindowCoordinates] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [savedCoordinates, setSavedCoordinates] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [backToFullScreen, setBackToFullScreen] = useState<boolean>(false);

  const windowRef = useRef<HTMLDivElement | null>(null);

  const [currentEditorState, setCurrentEditorState] = useState<any[] | null>(options ? options.strokes : null);
  const canvasRef = useRef<React.RefObject<HTMLDivElement>>(undefined)

  useEffect(() => {
    const initialX = (window.innerWidth - 600) / 2;
    const initialY = window.innerHeight * 0.2;
    setWindowCoordinates({ x: initialX, y: initialY });
  }, []);

  useEffect(() => {
    if (noteType) setBackgroundClass(getNoteClass(noteType));
  }, [noteType]);

  useEffect(() => {
    if (isFullScreen) {
      setIsGrabbing(false);
    } else if (savedCoordinates) {
      setWindowCoordinates(savedCoordinates);
    }
  }, [isFullScreen, savedCoordinates]);

  const handleMouseMove = useCallback(
    (e: MouseEvent | globalThis.MouseEvent) => {
      if (!isGrabbing || isFullScreen || isMinimized) return;
      const newX = e.clientX - mouseOffset.x;
      const newY = e.clientY - mouseOffset.y;
      setWindowCoordinates({ x: newX, y: newY });
    },
    [isGrabbing, mouseOffset, isFullScreen, isMinimized]
  );

  useEffect(() => {
    const handleMouseUp = () => {
      setIsGrabbing(false);
    };
    if (isGrabbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isGrabbing, handleMouseMove]);

  const toggleIsFullScreen = () => {
    setIsFullScreen((prev) => {
      if (!prev) setSavedCoordinates(windowCoordinates);
      return !prev;
    });
  };

  const handleMinimize = () => {
    setBackToFullScreen(isFullScreen);
    setIsFullScreen(false);
    if (!isFullScreen) setSavedCoordinates(windowCoordinates);
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    if (backToFullScreen) {
      setIsFullScreen(true);
    } else {
      setIsFullScreen(false);
      if (savedCoordinates) setWindowCoordinates(savedCoordinates);
    }
  };

  const handleEditorChange = (newStrokes: any[]) => {
    if (JSON.stringify(newStrokes) !== JSON.stringify(currentEditorState)) {
      setCurrentEditorState(newStrokes);
      console.log("Strokes updated:", newStrokes);
    }
  };

  if (!isOpened) return null;

  if (step === 1) {
    return (
      <>
        <HandwrittenStepChooseNoteType
         onClose={onClose}
         allNoteTypes={allNoteTypes}
         getNoteClass={getNoteClass}
         noteType={noteType}
         setNoteType={setNoteType}
         setStep={setStep}/>
      </>
    )
  }

  const heightNormal = '80vh';
  const widthNormal = `calc(90vh * (210 / 297))`;

  let left: number | string = windowCoordinates.x;
  let top: number | string = windowCoordinates.y;
  let width: number | string = widthNormal;
  let height: number | string = heightNormal;

  if (isFullScreen) {
    left = 0;
    top = 0;
    width = '100vw';
    height = '100vh';
  } else if (isMinimized) {
    left = 'calc(100vw - 60px)';
    top = 'calc(100vh - 180px)';
    width = '40px';
    height = '40px';
  }

  const containerStyle: CSSProperties = {
    left,
    top,
    width,
    height,
  };

  return (
    <>
      <HandwrittenStepCreateNote 
        handleMinimize={handleMinimize}
        handleRestore={handleRestore}
        onClose={onClose}
        windowRef={windowRef}
        isMinimized={isMinimized}
        isGrabbing={isGrabbing}
        setIsGrabbing={setIsGrabbing}
        setMouseOffset={setMouseOffset}
        isFullScreen={isFullScreen}
        toggleIsFullScreen={toggleIsFullScreen}
        containerStyle={containerStyle}
        windowCoordinates={windowCoordinates}
        backgroundClass={backgroundClass}

        canvasRef={canvasRef}
        editorOnChange={handleEditorChange}
      />
    </>
  )
};