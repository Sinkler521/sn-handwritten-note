import {HandwrittenNoteType} from "../HandwrittenNoteTypes"

export const stringToNoteType = (noteTypeString: string) => {
    const possibleValues = Object.values(HandwrittenNoteType);
    if (possibleValues.includes(noteTypeString as HandwrittenNoteType)) {
        return noteTypeString as HandwrittenNoteType;
    }
}