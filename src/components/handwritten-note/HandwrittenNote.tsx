import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  CSSProperties,
} from 'react';
import {
  HandwrittenNoteType,
  getNoteClass,
  allNoteTypes,
} from './HandwrittenNoteTypes';
import { stringToNoteType } from './helpers/helpers';
import { HandwrittenStepCreateNote } from "./steps/Handwritten-step-2";
import { HandwrittenStepChooseNoteType } from "./steps/Handwritten-step-1";
import DOMPurify from 'dompurify';
import { TLShape } from 'tldraw';
import './handwritten-note-styles.css';

export interface EditorOptions {
  isEverChanged?: boolean;
  noteType?: string;
  imageWidth: number | string;
  imageHeight: number | string;

  editorData?: TLShape[] | string | undefined;
  imageData?: { height: number; svg: string; width: number; } | undefined;
}

interface HandwrittenNoteProps {
  updateBlockProperty: (key: string, value: any) => void;
  editorOptions: EditorOptions;
}

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  editorOptions,
  updateBlockProperty
}) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const toggleIsOpened = () => setIsOpened(!isOpened);
  const [step, setStep] = useState<number>(1);
  const [noteType, setNoteType] = useState<HandwrittenNoteType>();
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const [currentEditorOptions, setCurrentEditorOptions] = useState<EditorOptions>({
    isEverChanged: editorOptions.isEverChanged ? editorOptions.isEverChanged : false,
    noteType: editorOptions.noteType ? stringToNoteType(editorOptions.noteType) : HandwrittenNoteType.SQUARED,
    imageWidth: editorOptions.imageWidth ? editorOptions.imageWidth : 250,
    imageHeight: editorOptions.imageHeight ? editorOptions.imageHeight : 250,

    editorData: editorOptions.editorData ? JSON.parse(editorOptions.editorData) : undefined,
    imageData: editorOptions.imageData ? JSON.parse(editorOptions.imageData) : undefined,
  })

  const [currentPreviewDimensions, setCurrentPreviewDimensions] = useState<object | undefined>({x: 250, y: 250})

  const [windowCoordinates, setWindowCoordinates] = useState<{ x: number; y: number }>(
    { x: 0, y: 0 }
  );
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [savedCoordinates, setSavedCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [backToFullScreen, setBackToFullScreen] = useState<boolean>(false);

  let left: number | string = windowCoordinates.x;
  let top: number | string = windowCoordinates.y;
  let width: number | string = '50vw';
  let height: number | string = 'calc(50vw * (2 / 3))';

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

  const containerStyle: CSSProperties = useMemo(() => ({
    position: 'absolute',
    left,
    top,
    width,
    height,
  }), [left, top, width, height]);

  useEffect(() => {
    if(editorOptions){
      setCurrentPreviewDimensions({x: editorOptions.imageWidth, y: editorOptions.imageHeight});
    }
  }, [editorOptions])

  useEffect(() => {
    const initialX = (window.innerWidth - 600) / 2;
    const initialY = window.innerHeight * 0.2;
    setWindowCoordinates({ x: initialX, y: initialY });
  }, []);

  useEffect(() => {
    if (isFullScreen) {
      setIsGrabbing(false);
    } else if (savedCoordinates) {
      setWindowCoordinates(savedCoordinates);
    }
  }, [isFullScreen, savedCoordinates]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isGrabbing || isFullScreen || isMinimized) return;
      const newX = e.clientX - mouseOffset.x;
      const newY = e.clientY - mouseOffset.y;
      setWindowCoordinates({ x: newX, y: newY });
    },
    [isGrabbing, mouseOffset, isFullScreen, isMinimized]
  );

  useEffect(() => {
    const handleMouseUp = () => setIsGrabbing(false);
  
    const onMouseMove = (e: MouseEvent) => {
      if (!isGrabbing || isFullScreen || isMinimized) return;
      const newX = e.clientX - mouseOffset.x;
      const newY = e.clientY - mouseOffset.y;
      setWindowCoordinates({ x: newX, y: newY });
    };
  
    if (isGrabbing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isGrabbing, handleMouseMove]);

  const toggleIsFullScreen = () => {
    setIsFullScreen((prev) => {
      if (!prev) {
        setSavedCoordinates(windowCoordinates);
      }
      return !prev;
    });
  };

  const handleMinimize = () => {
    setBackToFullScreen(isFullScreen);
    setIsFullScreen(false);
    if (!isFullScreen) {
      setSavedCoordinates(windowCoordinates);
    }
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    if (backToFullScreen) {
      setIsFullScreen(true);
    } else {
      setIsFullScreen(false);
      if (savedCoordinates) {
        setWindowCoordinates(savedCoordinates);
      }
    }
  };

  const handleSave = () => {
    if(currentEditorOptions){
       const editorDataString = JSON.stringify(currentEditorOptions.editorData);
       const imageDataString = JSON.stringify(currentEditorOptions.imageData)
       updateBlockProperty('editorOptions', {
        ...currentEditorOptions,
        editorData: editorDataString,
        imageData: imageDataString,
      })
    }
  }

  if (!isOpened){
    return (
      <>
        <div className="flex justify-center items-center border rounded-md shadow-md bg-white cursor-pointer"
          style={{
            width: `${currentEditorOptions.imageWidth}px`,
            height: `${currentEditorOptions.imageHeight}px`
          }}
        >
          {currentEditorOptions.imageData ? (
            <div
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(currentEditorOptions.imageData.svg) 
              }}
              className="w-full h-full rounded-md"
              onClick={toggleIsOpened}
            />
          ) : (
            <img 
              src="/assets/images/default-image.jpg"
              alt="Handwritten note preview"
              className="w-full h-full rounded-md cursor-pointer"
              onClick={toggleIsOpened}
            />
          )}
        </div>
      </>
    )
  }

  if (step === 1 && !editorOptions.editorData) {
    return (
      <HandwrittenStepChooseNoteType
        toggleIsOpened={toggleIsOpened}
        allNoteTypes={allNoteTypes}
        getNoteClass={getNoteClass}
        noteType={noteType}
        setNoteType={setNoteType}
        setStep={setStep}
        currentEditorOptions={currentEditorOptions}
        setCurrentEditorOptions={setCurrentEditorOptions}
      />
    );
  }

  return (
    <>
      <HandwrittenStepCreateNote
        handleMinimize={handleMinimize}
        handleRestore={handleRestore}
        toggleIsOpened={toggleIsOpened}
        windowRef={null}
        isMinimized={isMinimized}
        isGrabbing={isGrabbing}
        setIsGrabbing={setIsGrabbing}
        setMouseOffset={setMouseOffset}
        isFullScreen={isFullScreen}
        toggleIsFullScreen={toggleIsFullScreen}
        containerStyle={containerStyle}
        windowCoordinates={windowCoordinates}
        noteType={noteType}

        currentEditorOptions={currentEditorOptions}
        setCurrentEditorOptions={setCurrentEditorOptions}
        updateBlockProperty={updateBlockProperty}
        handleSave={handleSave}
      />
    </>
  )
};