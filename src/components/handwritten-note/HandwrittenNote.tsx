import React, {
  useState,
  MouseEvent,
  useRef,
  useEffect,
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
import './handwritten-note-styles.css';

export interface EditorOptions {
  isEverChanged?: boolean;
  noteType?: string;
  imageWidth: number | string | null;
  imageHeight: number | string | null;

  shapesData?: string | undefined;
  previewImage: string | undefined;
}

interface HandwrittenNoteProps {
  isOpened: boolean;
  onClose: () => void;
  updateBlockProperty: (key: string, value: any) => void;
  editorOptions: EditorOptions;
}

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  isOpened,
  onClose,
  editorOptions,
}) => {
  const [step, setStep] = useState<number>(1);
  const [noteType, setNoteType] = useState<HandwrittenNoteType>();
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const [currentShapesData, setCurrentShapesData] = useState<object | undefined>();
  const [currentPreviewImage, setCurrentPreviewImage] = useState<string>('');

  const [currentPreviewDimensions, setCurrentPreviewDimensions] = useState<object | undefined>({x: 250, y: 250})

  const [windowCoordinates, setWindowCoordinates] = useState<{ x: number; y: number }>(
    { x: 0, y: 0 }
  );
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [savedCoordinates, setSavedCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [backToFullScreen, setBackToFullScreen] = useState<boolean>(false);

  useEffect(() => {
    if(editorOptions){
      const {shapesData, previewImage, noteType, imageWidth, imageHeight} = editorOptions
      if(shapesData) setCurrentShapesData(shapesData);
      if(previewImage) setCurrentPreviewImage(previewImage);
      if(noteType){
        const parsedNoteType = stringToNoteType(noteType);
        setNoteType(parsedNoteType);
      }
      if(imageWidth && imageHeight) setCurrentPreviewDimensions({x: imageWidth, y: imageHeight})
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

  if (!isOpened) return null;

  if (step === 1 && !editorOptions.shapesData) {
    return (
      <HandwrittenStepChooseNoteType
        onClose={onClose}
        allNoteTypes={allNoteTypes}
        getNoteClass={getNoteClass}
        noteType={noteType}
        setNoteType={setNoteType}
        setStep={setStep}
      />
    );
  }

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

  const containerStyle: CSSProperties = {
    position: 'absolute',
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

        shapesData={currentShapesData}
      />
    </>
  )
};