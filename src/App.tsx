import React, { useState } from 'react';
import { HandwrittenNote } from './components/handwritten-note/HandwrittenNote';
import { Toaster, toast } from 'sonner'
import './styles.css';

const editorDataString = '[{"x":0,"y":0,"rotation":0,"isLocked":true,"opacity":1,"meta":{},"id":"shape:V6isPkxdWCJ7majj0Xh0-","type":"image","parentId":"page:page","props":{"w":1536,"h":738,"assetId":"asset:iyBGRIJOW0FuYlc7bqK-Y","playing":true,"url":"","crop":null,"flipX":false,"flipY":false},"index":"a1","typeName":"shape"},{"x":57.5999755859375,"y":54.00004577636719,"rotation":0,"isLocked":false,"opacity":1,"meta":{},"id":"shape:HqQgbYf1uolFC2fUGCUX8","type":"image","props":{"w":120,"h":120,"assetId":"asset:KUws9vTrnDlygz7TOhrbl","playing":true,"url":"","crop":null,"flipX":false,"flipY":false},"parentId":"page:page","index":"a21km","typeName":"shape"}]';

function App() {
  const [componentsCreated, setComponentsCreated] = useState<any[]>([]);

  const [showNote, setShowNote] = useState<boolean>(false);

  return (
    <div className="container w-full min-h-screen flex flex-col bg-gray-100">
      <Toaster position="top-right" />
      <div className="p-4 pt-10 flex-1 justify-center items-center overflow-auto">
        <HandwrittenNote
            updateBlockProperty={() => {}}
            editorOptions={{
              isEverChanged: false,
              noteType: 'squared',
              imageHeight: '200',
              imageWidth: '200',
              editorData: undefined,
              imageData: undefined,
            }}
          />
      </div>
    </div>
  );
}

export default App;
