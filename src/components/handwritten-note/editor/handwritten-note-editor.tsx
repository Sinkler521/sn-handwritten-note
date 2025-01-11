import React from 'react'
import { Tldraw } from 'tldraw'
import "tldraw/tldraw.css"

export const HandwrittenNoteEditor = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tldraw
        // showMenu={false} // можно скрыть меню
        // showPages={false}
        // disableAssets={true}
        // background="transparent" // фон, если нужно
        
      />
    </div>
  )
}