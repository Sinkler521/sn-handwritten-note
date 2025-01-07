export enum HandwrittenNoteType {
    SQUARED = 'squared',
    RULED = 'ruled',
  }

export const getNoteClass = (noteType: HandwrittenNoteType): string => {
    switch (noteType) {
      case HandwrittenNoteType.SQUARED:
        return 'paper-squared';
      case HandwrittenNoteType.RULED:
        return 'paper-ruled';
      default:
        return 'paper-squared';
    }
  };

  export const allNoteTypes = [
    HandwrittenNoteType.SQUARED,
    HandwrittenNoteType.RULED
  ]