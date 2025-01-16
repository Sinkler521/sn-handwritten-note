import { Dispatch, SetStateAction, RefObject, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { MdMinimize, MdOutlineFullscreen, MdClose } from 'react-icons/md';
import { HandwrittenNoteEditor } from '../editor/handwritten-note-editor';
import { HandwrittenNoteType, getAssetLink } from "../HandwrittenNoteTypes"

interface HandwrittenStepCreateNoteProps {
  handleRestore: () => void;
  handleMinimize: () => void;
  onClose: () => void;
  windowRef: RefObject<HTMLDivElement> | null;
  isMinimized: boolean;
  isGrabbing: boolean;
  setIsGrabbing: Dispatch<SetStateAction<boolean>>;
  setMouseOffset: Dispatch<SetStateAction<{ x: number; y: number }>>;
  isFullScreen: boolean;
  toggleIsFullScreen: () => void;
  containerStyle: React.CSSProperties;
  windowCoordinates: { x: number; y: number };
  backgroundClass: string;
  noteType: HandwrittenNoteType | undefined;
}

export const HandwrittenStepCreateNote = (props: HandwrittenStepCreateNoteProps) => {
  const [assetLink, setAssetLink] = useState<string | undefined>()

  useEffect(() => {
    if(props.noteType){
      setAssetLink(getAssetLink(props.noteType))
    }
  }, [props.noteType])

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
      onClick={props.handleRestore}
    >
      <MdMinimize size={16} />
    </button>
  );

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={props.onClose}
    >
      <div
        ref={props.windowRef}
        style={props.containerStyle}
        className={`
          absolute
          rounded
          ${props.backgroundClass}
          ${props.isGrabbing ? '' : 'transition-all'}
          flex flex-col
        `}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {props.isMinimized ? (
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
                if (props.isFullScreen || props.isMinimized) return;
                props.setIsGrabbing(true);
                const offsetX = e.clientX - props.windowCoordinates.x;
                const offsetY = e.clientY - props.windowCoordinates.y;
                props.setMouseOffset({ x: offsetX, y: offsetY });
              }}
            >
              <button
                className="border-l p-1 bg-white transition-all hover:scale-95 hover:bg-gray-100 cursor-pointer"
                onClick={props.handleMinimize}
              >
                <MdMinimize size={24} />
              </button>
              <button
                className="border-l p-1 bg-white transition-all hover:scale-95 hover:bg-gray-100 cursor-pointer"
                onClick={props.toggleIsFullScreen}
              >
                <MdOutlineFullscreen size={24} />
              </button>
              <button
                className="border-l p-1 bg-red-white transition-all hover:scale-95 hover:bg-red-300 cursor-pointer"
                onClick={props.onClose}
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <HandwrittenNoteEditor assetLink={assetLink} />
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};