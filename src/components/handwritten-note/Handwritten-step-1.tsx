import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { HandwrittenNoteType } from "./HandwrittenNoteTypes";
import { toast } from 'sonner';

interface HandwrittenChooseNoteTypeProps {
  onClose: () => void;
  allNoteTypes: HandwrittenNoteType[];
  getNoteClass: (type: HandwrittenNoteType) => string;
  noteType: HandwrittenNoteType | undefined;
  setNoteType: (newValue: HandwrittenNoteType | undefined) => void;
  setStep: (step: number) => void;
}

export const HandwrittenStepChooseNoteType = (props: HandwrittenChooseNoteTypeProps) => {
  const [isTypeSelected, setIsTypeSelected] = useState<boolean>(false);

  const handleSelectType = (clickedType: HandwrittenNoteType) => {
    if (props.noteType === clickedType) {
      props.setNoteType(undefined);
      setIsTypeSelected(false);
    } else {
      props.setNoteType(clickedType);
      setIsTypeSelected(true);
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={props.onClose}
    >
      <div
        className="
          w-[55vw] h-[80vh]
          bg-white rounded shadow
          overflow-hidden
          grid grid-cols-[1fr_4fr]
          gap-4
          p-4
          relative
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Левая колонка */}
        <div className="overflow-y-auto h-full shadow p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Available Note Types</h2>
          <ul className="space-y-2">
            {props.allNoteTypes.map((type) => (
              <li
                key={type}
                onClick={() => handleSelectType(type)}
                className={`
                  p-2 rounded cursor-pointer
                  transition-all hover:bg-gray-50
                  ${props.noteType === type ? 'bg-gray-100 font-semibold' : ''}
                `}
              >
                {type}
              </li>
            ))}
          </ul>
        </div>

        {/* Правая колонка */}
        <div className="relative flex flex-col h-full shadow rounded">
          {/* Прокрутка контента (сетка) */}
          <div className="overflow-y-auto flex-1 p-2 pb-20">
            <div className="grid grid-cols-3 gap-4">
              {props.allNoteTypes.map((type) => {
                const previewClass = props.getNoteClass(type);
                const isActive = props.noteType === type;
                return (
                  <div
                    key={type}
                    onClick={() => handleSelectType(type)}
                    className={`
                      h-[150px]
                      aspect-[210/297]
                      border-[3px]
                      ${isActive ? 'border-gray-400' : 'border-transparent shadow'}
                      hover:border-gray-300
                      hover:scale-105
                      transition-all
                      rounded
                      overflow-hidden
                      cursor-pointer
                      mx-auto
                      ${previewClass}
                    `}
                  />
                );
              })}
            </div>
          </div>

          {/* Нижняя панель - фиксируем снизу правой колонки */}
          <div
            className="
              absolute bottom-0 left-0 w-full
              border-t bg-white
              py-3 px-2
              flex justify-evenly items-center
            "
          >
            <button
              className="px-5 py-2 bg-gray-300 rounded shadow hover:opacity-90"
              onClick={props.onClose}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded shadow hover:opacity-90"
              onClick={() => {
                if (isTypeSelected) {
                  props.setStep(2);
                } else {
                  toast.warning('Please select note type first');
                }
              }}
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};