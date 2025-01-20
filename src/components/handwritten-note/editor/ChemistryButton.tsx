import React from 'react'
import { useEditor } from 'tldraw'
import { AssetRecordType, createShapeId } from 'tldraw'
import { MdHexagon } from 'react-icons/md'

export function ChemistryButton() {
  const editor = useEditor()

  const addBenzeneRing = () => {
    if (!editor) return

    const screenBounds = editor.getViewportScreenBounds()
    const screenCenter = {
      x: (screenBounds.minX + screenBounds.maxX) / 2,
      y: (screenBounds.minY + screenBounds.maxY) / 2
    }
    const pageCenter = editor.screenToPage(screenCenter)

    const assetId = AssetRecordType.createId()
    editor.createAssets([
      {
        id: assetId,
        typeName: 'asset',
        type: 'image',
        meta: {},
        props: {
          name: 'benzene-ring',
          src: '/assets/images/benzenering.png',
          w: 120,
          h: 120,
          mimeType: 'image/png',
          isAnimated: false,
        },
      },
    ])

    const shapeId = createShapeId()
    editor.createShape({
      id: shapeId,
      type: 'image',
      x: pageCenter.x - 60,
      y: pageCenter.y - 60,
      props: {
        assetId,
        w: 120,
        h: 120,
      },
    })
  }

  return (
    <div style={{ marginRight: '1rem' }}>
      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: 4,
          border: '1px solid #ccc',
          background: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={addBenzeneRing}
      >
        <MdHexagon size={20} />
      </button>
    </div>
  )
}