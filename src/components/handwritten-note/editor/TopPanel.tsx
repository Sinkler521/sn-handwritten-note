import React from 'react'
import { BenzeneButton } from './shapes/BenzeneButton';
import { HexaneButton } from './shapes/HexaneButton';

export function TopPanel() {
  return (
    <div className="relative flex items-center p-2 bg-gray-100 border-b border-gray-300 pointer-events-auto z-[9999]">
      <BenzeneButton />
      <HexaneButton />
    </div>
  )
}