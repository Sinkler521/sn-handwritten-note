import { Dispatch, SetStateAction, RefObject, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { MdMinimize, MdOutlineFullscreen, MdClose } from 'react-icons/md'
import { HandwrittenNoteEditor } from '../editor/handwritten-note-editor'
import { HandwrittenNoteType, getAssetLink } from "../HandwrittenNoteTypes"
import { ResizableBox } from "react-resizable"
import 'react-resizable/css/styles.css'
import { EditorOptions } from '../HandwrittenNote'

interface HandwrittenStepCreateNoteProps {
  handleRestore: () => void;
  handleMinimize: () => void;
  toggleIsOpened: () => void;
  windowRef: RefObject<HTMLDivElement> | null;
  isMinimized: boolean;
  isGrabbing: boolean;
  setIsGrabbing: Dispatch<SetStateAction<boolean>>;
  setMouseOffset: Dispatch<SetStateAction<{ x: number; y: number }>>;
  isFullScreen: boolean;
  toggleIsFullScreen: () => void;

  containerStyle: React.CSSProperties;
  windowCoordinates: { x: number; y: number };

  noteType: HandwrittenNoteType | undefined;
  updateBlockProperty: (key: string, value: any) => void;
  currentEditorOptions: EditorOptions;
  setCurrentEditorOptions: (newEditorOptions: EditorOptions) => void;
}

export const HandwrittenStepCreateNote = (props: HandwrittenStepCreateNoteProps) => {
  const {
    handleRestore,
    handleMinimize,
    toggleIsOpened,
    windowRef,
    isMinimized,
    isGrabbing,
    setIsGrabbing,
    setMouseOffset,
    isFullScreen,
    toggleIsFullScreen,
    containerStyle,
    windowCoordinates,
    noteType,
    updateBlockProperty,
    currentEditorOptions,
    setCurrentEditorOptions,
  } = props

  const [assetLink, setAssetLink] = useState<string | undefined>()

  const [boxWidth, setBoxWidth] = useState<number>(600)
  const [boxHeight, setBoxHeight] = useState<number>(400)

  useEffect(() => {
    if (noteType) {
      setAssetLink(getAssetLink(noteType))
    }
  }, [noteType])

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
  )

  const windowContent = (
    <>
      <div
        className="
          w-full flex justify-end items-center
          bg-white border-b
          cursor-grab active:cursor-grabbing
        "
        onMouseDown={(e) => {
          if (isFullScreen || isMinimized) return
          setIsGrabbing(true)
          const offsetX = e.clientX - windowCoordinates.x
          const offsetY = e.clientY - windowCoordinates.y
          setMouseOffset({ x: offsetX, y: offsetY })
        }}
      >
        <button
          className="border-l p-1 bg-white transition-all hover:scale-95 hover:bg-gray-100 cursor-pointer"
          onClick={handleMinimize}
        >
          <MdMinimize size={24} />
        </button>
        <button
          className="border-l p-1 bg-white transition-all hover:scale-95 hover:bg-gray-100 cursor-pointer"
          onClick={toggleIsFullScreen}
        >
          <MdOutlineFullscreen size={24} />
        </button>
        <button
          className="border-l p-1 bg-red-white transition-all hover:scale-95 hover:bg-red-600 hover:text-white cursor-pointer"
          onClick={toggleIsOpened}
        >
          <MdClose size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <HandwrittenNoteEditor
          assetLink={assetLink}
          currentEditorOptions={currentEditorOptions}
          setCurrentEditorOptions={setCurrentEditorOptions}
          updateBlockProperty={updateBlockProperty}
        />
      </div>
    </>
  )

  const minimizedContent = (
    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
      {minimizedButton}
    </div>
  )

  const fullScreenWindow = (
    <div
      className="absolute inset-0 flex flex-col bg-white"
      style={{ zIndex:99999 }}
      onClick={(e) => e.stopPropagation()}
      ref={windowRef}
    >
      {windowContent}
    </div>
  )

  const resizableWindow = (
    <ResizableBox
      className="relative"
      width={boxWidth}
      height={boxHeight}
      minConstraints={[200, 200]}
      maxConstraints={[window.innerWidth, window.innerHeight]}
      axis="both"
      onResize={(e: Event, data: any) => {
        setBoxWidth(data.size.width)
        setBoxHeight(data.size.height)
      }}
      style={{
        position: 'absolute',
        left: windowCoordinates.x,
        top: windowCoordinates.y,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e: Event) => e.stopPropagation()}
    >
      <div
        ref={windowRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {windowContent}
      </div>
    </ResizableBox>
  )

  const minimizedWindow = (
    <div
      style={{
        position: 'absolute',
        left: 'calc(100vw - 60px)',
        top: 'calc(100vh - 180px)',
        width: '40px',
        height: '40px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {minimizedContent}
    </div>
  )

  let windowElement = null

  if (isMinimized) {
    windowElement = minimizedWindow
  } else if (isFullScreen) {
    windowElement = fullScreenWindow
  } else {
    windowElement = resizableWindow
  }

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
    >
      {windowElement}
    </div>,
    document.body
  )
}