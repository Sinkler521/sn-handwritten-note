import React, { useState } from 'react'
import { HandwrittenNote } from './components/handwritten-note/HandwrittenNote'
import { Toaster } from 'sonner'
import './styles.css'

function App() {
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
  )
}

export default App