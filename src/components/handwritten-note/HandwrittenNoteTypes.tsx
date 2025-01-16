
export enum HandwrittenNoteType {
  SQUARED = 'squared',
  RULED = 'ruled',

  // others
}

interface NoteTypeConfig {
  className: string
  assetLink: string
}

const NOTE_TYPE_CONFIG: Record<HandwrittenNoteType, NoteTypeConfig> = {
  [HandwrittenNoteType.SQUARED]: {
    className: 'paper-squared',
    assetLink: '/assets/svg/paper-types/paper-squared.svg',
  },
  [HandwrittenNoteType.RULED]: {
    className: 'paper-ruled',
    assetLink: '/assets/svg/paper-types/paper-ruled.svg',
  },
  // others
}

export function getNoteConfig(noteType: HandwrittenNoteType): NoteTypeConfig {
  return NOTE_TYPE_CONFIG[noteType]
}

export function getNoteClass(noteType: HandwrittenNoteType): string {
  return NOTE_TYPE_CONFIG[noteType].className
}

export function getAssetLink(noteType: HandwrittenNoteType): string {
  return NOTE_TYPE_CONFIG[noteType].assetLink
}

export const allNoteTypes = Object.keys(NOTE_TYPE_CONFIG) as HandwrittenNoteType[]