import React from 'react'
import { BenzeneButton } from './shapes/BenzeneButton';
import { HexaneButton } from './shapes/HexaneButton';

export function TopPanel() {
  return (
    <div
      style={{
        position:'relative',
        display:'flex',
        alignItems:'center',
        padding:'0.5rem',
        background:'#f8f8f8',
        borderBottom:'1px solid #ccc',
        pointerEvents:'auto',
        zIndex:9999,
      }}
    >
      <BenzeneButton/>
      <HexaneButton/>
    </div>
  )
}