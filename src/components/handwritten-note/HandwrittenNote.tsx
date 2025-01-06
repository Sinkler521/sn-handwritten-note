import React, {
  useState,
  MouseEvent,
  useRef,
  useEffect,
  useCallback,
  CSSProperties,
} from 'react';
import ReactDOM from 'react-dom';
import { HandwrittenNoteType, getNoteClass } from './HandwrittenNoteTypes';
import { HandwrittenNoteEditor } from './editor/handwritten-note-editor';
import { MdMinimize, MdOutlineFullscreen, MdClose } from 'react-icons/md';
import './handwritten-note-styles.css';

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

  if (!isOpened) return null;

  if (step === 1) {
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={onClose}
      >
        <div className="bg-white p-6 rounded shadow w-80" onClick={(e) => e.stopPropagation()}>
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
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
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

  const heightNormal = '90vh';
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
    top = 'calc(100vh - 60px)';
    width = '40px';
    height = '40px';
  }

  const containerStyle: CSSProperties = {
    left,
    top,
    width,
    height,
  };

  const minimizedButton = (
    <button
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '30px',
        height: '30px',
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        background: '#ccc',
      }}
      onClick={handleRestore}
    >
      <MdMinimize size={16} />
    </button>
  );

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div
        ref={windowRef}
        style={containerStyle}
        className={`
          absolute
          overflow-hidden
          rounded
          bg-white
          ${backgroundClass}
          ${isGrabbing ? '' : 'transition-all'}
        `}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {isMinimized ? (
          minimizedButton
        ) : (
          <>
            <div
              className="
                w-full px-2 flex justify-end items-center
                bg-white border-b
                cursor-grab active:cursor-grabbing
              "
              onMouseDown={(e) => {
                if (isFullScreen || isMinimized) return;
                setIsGrabbing(true);
                const offsetX = e.clientX - windowCoordinates.x;
                const offsetY = e.clientY - windowCoordinates.y;
                setMouseOffset({ x: offsetX, y: offsetY });
              }}
            >
              <button
                className="border-l p-1 bg-white transition-all hover:scale-95 hover:bg-gray-50 cursor-pointer"
                onClick={handleMinimize}
              >
                <MdMinimize size={24} />
              </button>
              <button
                className="border-l p-1 bg-white transition-all hover:scale-95 hover:bg-gray-50 cursor-pointer"
                onClick={toggleIsFullScreen}
              >
                <MdOutlineFullscreen size={24} />
              </button>
              <button
                className="border-l p-1 bg-red-300 transition-all hover:scale-95 hover:bg-red-400 cursor-pointer"
                onClick={onClose}
              >
                <MdClose size={24} />
              </button>
            </div>
            <HandwrittenNoteEditor onChange={() => {}} canvasRef={undefined} />
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
