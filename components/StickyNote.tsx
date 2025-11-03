
import React from 'react';
import { Note } from '../types';

interface StickyNoteProps {
  note: Note;
  color: string;
  rotation: string;
  onDelete: (noteId: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ note, color, rotation, onDelete }) => {
  return (
    <div
      className={`relative p-5 shadow-lg rounded-md transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-xl hover:z-10 ${color} ${rotation}`}
      style={{ fontFamily: "'Caveat', cursive" }}
    >
      <button 
        onClick={() => onDelete(note.id)}
        className="absolute top-1 right-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-sans text-xs font-bold w-5 h-5 bg-white/50 dark:bg-black/30 rounded-full flex items-center justify-center transition-colors"
        aria-label="Delete note"
      >
        X
      </button>
      <p className="text-lg text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{note.content}</p>
    </div>
  );
};

export default StickyNote;
