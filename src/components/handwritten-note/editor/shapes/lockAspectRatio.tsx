import { Editor } from 'tldraw'

export function lockImageAspectRatio(editor: Editor) {
  const removeHandler = editor.sideEffects.registerBeforeChangeHandler('shape', (prev, next) => {
    if (next.type !== 'image') return next

    const aspect = prev.props.w / prev.props.h
    const newW = next.props.w
    const newH = next.props.h
    const newAspect = newW / newH

    if (Math.abs(newAspect - aspect) > 0.001) {
      return {
        ...next,
        props: {
          ...next.props,
          h: next.props.w / aspect,
        }
      }
    }
    return next
  })

  return removeHandler
}