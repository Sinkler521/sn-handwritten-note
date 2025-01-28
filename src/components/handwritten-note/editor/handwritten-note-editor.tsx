import React, { useEffect, useState, useCallback, useRef } from 'react'
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

interface MyEditorData {
  background?: {
    shapeId: string
    assetId: string
    w: number
    h: number
  }
  assets?: AssetRecordType[]
  shapes?: TLShape[]
}

interface HandwrittenNoteEditorProps {
  assetLink: string | undefined
  updateBlockProperty: (key: string, value: any) => void
  currentEditorOptions: EditorOptions
  setCurrentEditorOptions: (newEditorOptions: EditorOptions) => void
}

export function HandwrittenNoteEditor({
  assetLink,
  currentEditorOptions,
  setCurrentEditorOptions
}: HandwrittenNoteEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance)
  }, [])

  function parseEditorData(): MyEditorData {
    const raw = currentEditorOptions.editorData
    if (!raw) return {}
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw)
      } catch {
        return {}
      }
    }
    return raw as MyEditorData
  }

  useEffect(() => {
    if (!editor || !containerRef.current) return

    const data = parseEditorData()
    const { width } = containerRef.current.getBoundingClientRect()
    const side = width

    async function loadEverything() {
      let bgShapeId: string | undefined

      if (data.background) {
        const bg = data.background
        editor.createAssets([
          {
            id: bg.assetId,
            typeName: 'asset',
            type: 'image',
            meta: {},
            props: {
              w: bg.w,
              h: bg.h,
              mimeType: 'image/png',
              src: '',
              name: 'paper-background',
              isAnimated: false,
            },
          },
        ])
        editor.createShape<TLImageShape>({
          id: bg.shapeId,
          type: 'image',
          parentId: editor.getCurrentPageId(),
          x: 0,
          y: 0,
          isLocked: true,
          props: {
            w: bg.w,
            h: bg.h,
            assetId: bg.assetId,
          },
        })
        bgShapeId = bg.shapeId
        editor.sendToBack([{ id: bg.shapeId, type: 'shape' }])
      } else if (!currentEditorOptions.isEverChanged && assetLink) {
        try {
          const res = await fetch(assetLink)
          if (!res.ok) {
            throw new Error(`Failed to fetch SVG: ${res.status}`)
          }
          const svgText = await res.text()
          const finalImg = await svgToImage(svgText, side, side)
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
          editor.createShape<TLImageShape>({
            id: shapeId,
            type: 'image',
            parentId: editor.getCurrentPageId(),
            x: 0,
            y: 0,
            isLocked: true,
            props: {
              w: side,
              h: side,
              assetId,
            },
          })
          bgShapeId = shapeId
          editor.sendToBack([{ id: shapeId, type: 'shape' }])

          const newData: MyEditorData = {
            ...data,
            background: {
              shapeId,
              assetId,
              w: side,
              h: side,
            },
          }
          setCurrentEditorOptions({
            ...currentEditorOptions,
            editorData: newData,
            isEverChanged: true,
          })
        } catch (err) {
          console.error('loadBackground error:', err)
        }
      }

      if (data.assets && data.assets.length > 0) {
        editor.createAssets(data.assets)
      }

      if (data.shapes && data.shapes.length > 0) {
        editor.createShapes(data.shapes)
      }

      if (bgShapeId) {
        editor.sendToBack([{ id: bgShapeId, type: 'shape' }])
      }
    }

    loadEverything()
  }, [editor, containerRef])

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
    } catch {}
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const handleChangeEvent: TLEventMapHandler<"change"> = async () => {
      if (!editor) return
      const shapes = editor.getCurrentPageShapes()
      const svgStr = await editor.getSvgString(shapes)
      let parsedData: MyEditorData = parseEditorData()
      const usedAssets: AssetRecordType[] = []
      const usedIds = new Set<string>()
      for (const shape of shapes) {
        if (shape.type === 'image') {
          const img = shape as TLImageShape
          if (img.props.assetId) {
            usedIds.add(img.props.assetId)
          }
        }
      }
      for (const id of usedIds) {
        const rec = editor.store.get(id)
        if (rec && rec.typeName === 'asset') {
          usedAssets.push(rec as AssetRecordType)
        }
      }
      const newData: MyEditorData = {
        background: parsedData.background,
        assets: usedAssets,
        shapes,
      }
      if (svgStr !== currentEditorOptions.imageData) {
        setCurrentEditorOptions({
          ...currentEditorOptions,
          editorData: newData,
          imageData: svgStr,
        })
      }
    }
    const stop = editor.store.listen(handleChangeEvent, {
      source: 'user',
      scope: 'all',
    })
    return () => {
      stop()
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
          TopPanel
        }}
      />
    </div>
  )
}