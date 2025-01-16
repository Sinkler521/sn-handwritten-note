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

export const getAssetLink = (noteType: HandwrittenNoteType): string => {
  const dirPath = '/assets/svg/paper-types/';

  switch (noteType) {
    case HandwrittenNoteType.SQUARED:
      return dirPath + 'paper-squared.svg';
    case HandwrittenNoteType.RULED:
      return dirPath + 'paper-ruled.svg';
    default:
      return dirPath + 'paper-squared.svg';
  }
}  

  export const allNoteTypes = [
    HandwrittenNoteType.SQUARED,
    HandwrittenNoteType.RULED,

    // HandwrittenNoteType.SQUARED,
    // HandwrittenNoteType.RULED,
    // HandwrittenNoteType.SQUARED,
    // HandwrittenNoteType.RULED,
    // HandwrittenNoteType.SQUARED,
    // HandwrittenNoteType.RULED,
    // HandwrittenNoteType.SQUARED,
    // HandwrittenNoteType.RULED,
    // HandwrittenNoteType.SQUARED,
    // HandwrittenNoteType.RULED,
    // HandwrittenNoteType.SQUARED,
    // HandwrittenNoteType.RULED,
    // HandwrittenNoteType.SQUARED,
    // HandwrittenNoteType.RULED
  ]