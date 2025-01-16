import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Tldraw,
  Editor,
  createShapeId,
  AssetRecordType,
  TLImageShape,
} from 'tldraw'
import "tldraw/tldraw.css"
import { svgToImage } from "../helpers/svgToImage"

interface HandwrittenNoteEditorProps{
  assetLink: string | undefined;
}

export function HandwrittenNoteEditor({
  assetLink
}: HandwrittenNoteEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance)
  }, [])

  useEffect(() => {
    if (!editor || !assetLink) return

    const windowW = window.innerWidth
    const windowH = window.innerHeight
    console.log("Window dimensions:", windowW, windowH)

    const run = async () => {
      const res = await fetch(assetLink)
      if (!res.ok) {
        throw new Error(`Failed to fetch SVG: ${res.status}`)
      }
      const svgText = await res.text()

      const finalImg = await svgToImage(svgText, windowW, windowH)
      if (!editor) return

      const assetId = AssetRecordType.createId()
      editor.createAssets([
        {
          id: assetId,
          typeName: 'asset',
          type: 'image',
          meta: {},
          props: {
            w: windowW,
            h: windowH,
            mimeType: 'image/png',
            src: finalImg.src,
            name: 'paper-squared',
            isAnimated: false,
          },
        },
      ])

      const shapeId = createShapeId()
      const pageId = editor.getCurrentPageId()
      editor.createShape<TLImageShape>({
        id: shapeId,
        type: 'image',
        parentId: pageId,
        x: 0,
        y: 0,
        isLocked: true,
        props: {
          w: windowW,
          h: windowH,
          assetId,
        },
      })

      editor.sendToBack([{ id: shapeId, type: 'shape' }])
      editor.clearHistory()
    }

    run().catch(err => {
      console.error("loadBackground error:", err)
    })
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const w = window.innerWidth
    const h = window.innerHeight

    editor.setCameraOptions({
      constraints: {
        initialZoom: 'fit-max',
        baseZoom: 'default',
        bounds: { x: 0, y: 0, w, h },
        padding: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        behavior: 'contain',
      },
      isLocked: true,
    })

    try {
      editor.setCamera({ x: 0, y: 0, zoom: 1 })
    } catch (e) {
      console.error("Error setting camera:", e)
    }
  }, [editor])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Tldraw onMount={handleMount} forceMobile/>
    </div>
  )
}