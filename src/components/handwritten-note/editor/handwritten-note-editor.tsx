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

export function HandwrittenNoteEditor() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance)
  }, [])

  // 1) Создаём фоновое изображение размером с окно браузера
  useEffect(() => {
    if (!editor) return

    // Берём размеры окна, а НЕ контейнера
    const windowW = window.innerWidth
    const windowH = window.innerHeight
    console.log("Window dimensions:", windowW, windowH)

    const run = async () => {
      const res = await fetch('/assets/svg/paper-types/paper-squared.svg')
      if (!res.ok) {
        throw new Error(`Failed to fetch SVG: ${res.status}`)
      }
      const svgText = await res.text()

      // Генерируем PNG, "замостив" SVG на всю ширину/высоту окна
      const finalImg = await svgToImage(svgText, windowW, windowH)
      if (!editor) return

      // Создаём asset (из dataURL)
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

      // Создаём image shape размером во весь экран
      const shapeId = createShapeId()
      const pageId = editor.getCurrentPageId()
      editor.createShape<TLImageShape>({
        id: shapeId,
        type: 'image',
        parentId: pageId,
        x: 0,
        y: 0,
        isLocked: true, // нельзя изменить/переместить
        props: {
          w: windowW,
          h: windowH,
          assetId,
        },
      })

      // Отправляем вниз, очищаем историю
      editor.sendToBack([{ id: shapeId, type: 'shape' }])
      editor.clearHistory()
    }

    run().catch(err => {
      console.error("loadBackground error:", err)
    })
  }, [editor])

  // 2) Ограничиваем камеру
  useEffect(() => {
    if (!editor) return

    // Указываем границы, равные окну браузера (при обычном состоянии)
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
      // Заблокировать панорамирование камеры при обычном зуме
      // (пользователь может двигать камеру только при увеличении)
      isLocked: true,
    })

    // Устанавливаем камеру на (0,0) и zoom=1
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