// @ts-nocheck
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
  isFullScreen: boolean
}

export function HandwrittenNoteEditor({
  assetLink,
  currentEditorOptions,
  setCurrentEditorOptions,
  isFullScreen
}: HandwrittenNoteEditorProps) {

  const windowParams = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  const [normalEditorParams, setNormalEditorParams] = useState<{ width: number; height: number } | null>(null)
  const [editor, setEditor] = useState<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [minEditorZoom, setMinEditorZoom] = useState(1)

  const currentEditorOptionsRef = useRef(currentEditorOptions)
  useEffect(() => {
    currentEditorOptionsRef.current = currentEditorOptions
  }, [currentEditorOptions])

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance)
  }, [])

  function parseEditorData(raw?: any): MyEditorData {
    const dataRaw = raw !== undefined ? raw : currentEditorOptionsRef.current.editorData
    if (!dataRaw) return {}
    if (typeof dataRaw === 'string') {
      try {
        return JSON.parse(dataRaw)
      } catch {
        return {}
      }
    }
    return dataRaw as MyEditorData
  }

  useEffect(() => {
    if (containerRef.current && !normalEditorParams) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setNormalEditorParams({ width, height })
    }
  }, [normalEditorParams])

  useEffect(() => {
    if (!editor || !normalEditorParams) return;
    let timer: NodeJS.Timeout | null = null;
    const handleResize = () => {
      const container = editor.getContainer();
      if (!container) return;
      let { width, height } = container.getBoundingClientRect();
      width = Math.floor(width);
      height = Math.floor(height);
      const [normalWidth, normalHeight] = [normalEditorParams.width, normalEditorParams.height];
      const [maxWidth, maxHeight] = [windowParams.width, windowParams.height];
      const minZoom = 1;
      const maxZoom = 2.75;
      const currentZoom = editor.getZoomLevel();
      let ratioW: number;
      if (width <= normalWidth) {
        ratioW = minZoom;
      } else if (width >= maxWidth) {
        ratioW = maxZoom;
      } else {
        const deltaW = (width - normalWidth) / (maxWidth - normalWidth);
        ratioW = minZoom + deltaW * (maxZoom - minZoom);
      }
      let ratioH: number;
      if (height <= normalHeight) {
        ratioH = minZoom;
      } else if (height >= maxHeight) {
        ratioH = maxZoom;
      } else {
        const deltaH = (height - normalHeight) / (maxHeight - normalHeight);
        ratioH = minZoom + deltaH * (maxZoom - minZoom);
      }

      let targetZoom = Math.max(ratioW, ratioH, minEditorZoom);
      const diff = Math.abs(targetZoom - currentZoom);
      if (diff < 0.01) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        editor.setCamera({ x: 0, y: 0, z: targetZoom });
      }, 100);
    };
    const stop = editor.store.listen(() => handleResize(), {
      source: 'user',
      scope: 'all',
    });
    return () => {
      if (timer) clearTimeout(timer);
      stop();
    };
  }, [editor, normalEditorParams, minEditorZoom])

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
    try {
      editor.setCamera({ x: 0, y: 0, zoom: 1 })
    } catch {}
  }, [editor])

  useEffect(() => {
    if (!editor) return
    let timer: NodeJS.Timeout | null = null;
    const handleChangeEvent: TLEventMapHandler<"change"> = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        if (!editor) return;
        const shapes = editor.getCurrentPageShapes();
        const svgStr = await editor.getSvgString(shapes);
        const parsedData: MyEditorData = parseEditorData();
        const usedAssets: AssetRecordType[] = [];
        const usedIds = new Set<string>();
        for (const shape of shapes) {
          if (shape.type === 'image') {
            const img = shape as TLImageShape;
            if (img.props.assetId) {
              usedIds.add(img.props.assetId);
            }
          }
        }
        for (const id of usedIds) {
          const rec = editor.store.get(id);
          if (rec && rec.typeName === 'asset') {
            usedAssets.push(rec as AssetRecordType);
          }
        }
        const newData: MyEditorData = {
          background: parsedData.background,
          assets: usedAssets,
          shapes,
        };
        setCurrentEditorOptions(prev => {
          if (svgStr !== prev.imageData) {
            return { ...prev, editorData: newData, imageData: svgStr };
          }
          return prev;
        });
      }, 100);
    }
    const stop = editor.store.listen(handleChangeEvent, {
      source: 'user',
      scope: 'all',
    });
    return () => {
      if (timer) clearTimeout(timer);
      stop();
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const removeLockAspect = lockImageAspectRatio(editor)
    return () => {
      removeLockAspect()
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return;
    if (isFullScreen) {
      setMinEditorZoom(2.75);
      setTimeout(() => {
        editor.setCamera({ x: 0, y: 0, z: 2.75 });
      }, 0);
    } else {
      setMinEditorZoom(1);
    }
  }, [editor, isFullScreen])

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