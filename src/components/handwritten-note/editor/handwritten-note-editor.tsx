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
  currentEditorOptions: EditorOptions
  setCurrentEditorOptions: (newEditorOptions: EditorOptions) => void
}

export function HandwrittenNoteEditor({
  assetLink,
  currentEditorOptions,
  setCurrentEditorOptions,
}: HandwrittenNoteEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance)
  }, [])

  function getParsedEditorData(): MyEditorData {
    const raw = currentEditorOptions.editorData
    if (!raw) return {}
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw)
      } catch (err) {
        console.warn('Wrong JSON format in editorData:', err)
        return {}
      }
    }
    return raw as MyEditorData
  }

  useEffect(() => {
    if (!editor || !containerRef.current) return
    const { width } = containerRef.current.getBoundingClientRect()

    editor.setCameraOptions({
      constraints: {
        initialZoom: 'fit-max',
        baseZoom: 'default',
        bounds: { x: 0, y: 0, w: width, h: width },
        padding: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        behavior: 'contain',
      },
      isLocked: false,
    })

    editor.setCamera({ x: 0, y: 0, zoom: 1 })
  }, [editor])

  useEffect(() => {
    if (!editor || !assetLink || !containerRef.current) return

    const { width } = containerRef.current.getBoundingClientRect()
    const side = width
    const data = getParsedEditorData()
    if (data.background) {
      const bg = data.background

      const assetRecord: AssetRecordType = {
        id: bg.assetId,
        typeName: 'asset',
        type: 'image',
        meta: {},
        props: {
          w: bg.w,
          h: bg.h,
          mimeType: 'image/png',
          src: '',
          name: 'paper',
          isAnimated: false,
        },
      }
      editor.createAssets([assetRecord])

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

      editor.sendToBack([{ id: bg.shapeId, type: 'shape' }])
      return
    }

    if (!currentEditorOptions.isEverChanged) {
      ;(async () => {
        try {
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

          editor.sendToBack([{ id: shapeId, type: 'shape' }])

          const oldData = getParsedEditorData()
          const newData: MyEditorData = {
            ...oldData,
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
          console.error("loadBackground error:", err)
        }
      })()
    }
  }, [editor, assetLink])

  useEffect(() => {
    if (!editor) return
    const data = getParsedEditorData()
    if (data.assets && data.assets.length > 0) {
      editor.createAssets(data.assets)
    }

    if (data.shapes && data.shapes.length > 0) {
      editor.createShapes(data.shapes)
    }
  }, [editor, currentEditorOptions.editorData])

  useEffect(() => {
    if (!editor) return

    const handleChangeEvent: TLEventMapHandler<"change"> = async () => {
      if (!editor) return

      const shapes = editor.getCurrentPageShapes()

      const assetsToSave: AssetRecordType[] = []
      const usedAssetIds = new Set<string>()

      for (const shape of shapes) {
        if (shape.type === 'image') {
          const img = shape as TLImageShape
          if (img.props.assetId) {
            usedAssetIds.add(img.props.assetId)
          }
        }
      }
      for (const assetId of usedAssetIds) {
        const record = editor.store.get(assetId)
        if (record && record.typeName === 'asset') {
          assetsToSave.push(record as AssetRecordType)
        }
      }

      const image = await editor.getSvgString(shapes)

      const oldData = getParsedEditorData()

      const background = oldData.background

      const newData: MyEditorData = {
        background,   
        assets: assetsToSave,
        shapes,
      }

      if (image !== currentEditorOptions.imageData) {
        setCurrentEditorOptions({
          ...currentEditorOptions,
          editorData: newData,
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