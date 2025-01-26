import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Tldraw,
  Editor,
  createShapeId,
  AssetRecordType,
  TLImageShape,
  TLEventMapHandler,
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

  // Реф на контейнер, где будет лежать Tldraw
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance)
  }, [])

  // Загружаем фон (SVG) и создаём шейп
  useEffect(() => {
    if (!editor || !assetLink || !containerRef.current) return

    const { width } = containerRef.current.getBoundingClientRect()
    const side = width // Делаем фон квадратным

    const run = async () => {
      const res = await fetch(assetLink)
      if (!res.ok) {
        throw new Error(`Failed to fetch SVG: ${res.status}`)
      }
      const svgText = await res.text()

      // Генерируем изображение из SVG, задавая ему размер side x side
      const finalImg = await svgToImage(svgText, side, side)
      if (!editor) return

      // Создаём asset
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

      // Создаём шейп-картинку (фон)
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

  // Задаём квадратную область для камеры
  useEffect(() => {
    if (!editor || !containerRef.current) return

    const { width } = containerRef.current.getBoundingClientRect()
    const side = width

    editor.setCameraOptions({
      constraints: {
        initialZoom: 'fit-max',
        baseZoom: 'default',
        bounds: { x: 0, y: 0, w: side, h: side }, // квадратная область
        padding: { x: 0, y: 0 },
        origin: { x: 0, y: 0 },
        behavior: 'contain',
      },
      // Оставляем isLocked = false, чтобы пользователь мог панировать (двигаться),
      // но по горизонтали "contain" не даст выходить за рамку.
      isLocked: false,
    })

    try {
      editor.setCamera({ x: 0, y: 0, zoom: 1 })
    } catch (e) {
      console.error("Error setting camera:", e)
    }
  }, [editor])

  // Если есть сохранённые шейпы, восстанавливаем их
  useEffect(() => {
    if (!editor || !currentEditorOptions.editorData) return
    try {
      const shapes = JSON.parse(currentEditorOptions.editorData as string)
      editor.createShapes(shapes)
    } catch (e) {
      console.log('No shapes data or wrong format')
    }
  }, [editor, currentEditorOptions.editorData])

  // Отслеживаем изменения в редакторе
  useEffect(() => {
    if (!editor) return

    const handleChangeEvent: TLEventMapHandler<"change"> = async () => {
      if (!editor) return

      const shapes = editor.getCurrentPageShapes()
      const image = await editor.getSvgString(shapes)
      const imageString = JSON.stringify(image)

      if (image !== currentEditorOptions.imageData) {
        updateBlockProperty("editorData", JSON.stringify(shapes))
        updateBlockProperty("imageData", imageString)

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

  // Если нужно фиксировать пропорции вставленных изображений
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