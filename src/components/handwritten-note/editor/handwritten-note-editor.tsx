import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Tldraw,
  Editor,
  createShapeId,
  AssetRecordType,
  TLImageShape,
  TLEventMapHandler,
  TLShape
} from 'tldraw'
import "tldraw/tldraw.css"
import { EditorOptions } from '../HandwrittenNote'
import { svgToImage } from "../helpers/svgToImage"
import { TopPanel } from './TopPanel'
import { lockImageAspectRatio } from './shapes/lockAspectRatio'

interface HandwrittenNoteEditorProps {
  assetLink: string | undefined
  updateBlockProperty: (key: string, value: any) => void
  currentEditorOptions: EditorOptions
  setCurrentEditorOptions: (newEditorOptions: EditorOptions) => void
}

export function HandwrittenNoteEditor({
  assetLink,
  currentEditorOptions,
  setCurrentEditorOptions,
  updateBlockProperty
}: HandwrittenNoteEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance)
  }, [])

  useEffect(() => {
    if (!editor || !assetLink || !containerRef.current) return

    const { width } = containerRef.current.getBoundingClientRect()
    const side = width

    const run = async () => {
      const res = await fetch(assetLink)
      if (!res.ok) {
        throw new Error(`Failed to fetch SVG: ${res.status}`)
      }
      const svgText = await res.text()

      const finalImg = await svgToImage(svgText, side, side)
      if (!editor) return

      const assetId = AssetRecordType.createId()
      editor.createAssets([
        {
          id: assetId,
          typeName: 'asset',
          type: 'image',
          meta: {},
          props: {
            w: side,
            h: side,
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
          w: side,
          h: side,
          assetId,
        },
      })

      editor.sendToBack([{ id: shapeId, type: 'shape' }])
      editor.clearHistory()
    }

    run().catch(err => {
      console.error("loadBackground error:", err)
    })
  }, [editor, assetLink])

  useEffect(() => {
    if (!editor || !containerRef.current) return

    const { width } = containerRef.current.getBoundingClientRect()
    const side = width

    editor.setCameraOptions({
      constraints: {
        initialZoom: 'fit-max',
        baseZoom: 'default',
        bounds: { x: 0, y: 0, w: side, h: side },
        padding: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        behavior: 'contain',
      },
      isLocked: false,
    })

    try {
      editor.setCamera({ x: 0, y: 0, zoom: 1 })
    } catch (e) {
      console.error("Error setting camera:", e)
    }
  }, [editor])

  useEffect(() => {
    if (!editor || !currentEditorOptions.editorData) return
  
    let shapes: TLShape[]
  
    // Проверяем тип editorData
    if (typeof currentEditorOptions.editorData === 'string') {
      try {
        shapes = JSON.parse(currentEditorOptions.editorData)
      } catch (e) {
        console.log('No shapes data or wrong format:', e)
        return
      }
    } else {
      shapes = currentEditorOptions.editorData
    }
  
    if (Array.isArray(shapes)) {
      editor.createShapes(shapes)
    } else {
      console.log('No shapes data or wrong format: not an array')
    }
  }, [editor, currentEditorOptions.editorData])

  useEffect(() => {
    if (!editor) return

    const handleChangeEvent: TLEventMapHandler<"change"> = async () => {
      if (!editor) return

      const shapes = editor.getCurrentPageShapes()
      const image = await editor.getSvgString(shapes)

      if (image !== currentEditorOptions.imageData) {
        setCurrentEditorOptions({
          ...currentEditorOptions,
          editorData: shapes,
          imageData: image,
        })
      }
    }

    const cleanupFunction = editor.store.listen(handleChangeEvent, {
      source: "user",
      scope: "all",
    })

    return () => {
      cleanupFunction()
    }
  }, [editor, currentEditorOptions.imageData])

  useEffect(() => {
    if (!editor) return
    const removeLockAspect = lockImageAspectRatio(editor)
    return () => {
      removeLockAspect()
    }
  }, [editor])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Tldraw
        onMount={handleMount}
        forceMobile
        components={{
          TopPanel: TopPanel,
        }}
      />
    </div>
  )
}