import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, remove, push, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { Note } from '../types';

interface FirebaseNotes {
  [key: string]: Omit<Note, 'id'>;
}

const noteColors = [
  'bg-yellow-200 dark:bg-yellow-700',
  'bg-green-200 dark:bg-green-700',
  'bg-pink-200 dark:bg-pink-700',
  'bg-blue-200 dark:bg-blue-700',
  'bg-purple-200 dark:bg-purple-700',
  'bg-orange-200 dark:bg-orange-700',
];

const rotations = ['-rotate-2', 'rotate-2', '-rotate-1', 'rotate-1', '-rotate-3', 'rotate-3'];

export function useFirebaseData() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      return;
    }

    const notesRef = ref(db, 'notes');
    
    const unsubscribe = onValue(notesRef, (snapshot) => {
      const data: FirebaseNotes | null = snapshot.val();
      const notesArray: Note[] = data 
        ? Object.entries(data).map(([noteId, noteData]) => ({ id: noteId, ...noteData }))
        : [];
      setNotes(notesArray);
    });

    return () => unsubscribe();
  }, []);

  const addNote = useCallback((content: string, type: 'text' | 'image') => {
    if (!db) return;
    const notesRef = ref(db, 'notes');
    const newNoteRef = push(notesRef);
    
    const maxZ = notes.reduce((max, note) => Math.max(max, note.zIndex || 1), 0);

    const newNote: Omit<Note, 'id'> = {
      content,
      type,
      x: window.innerWidth / 2 - 100 + (Math.random() * 100 - 50),
      y: window.innerHeight / 3 + (Math.random() * 100 - 50),
      color: type === 'image' 
        ? 'bg-white dark:bg-gray-200' 
        : noteColors[Math.floor(Math.random() * noteColors.length)],
      rotation: type === 'image' 
        ? '' 
        : rotations[Math.floor(Math.random() * rotations.length)],
      zIndex: maxZ + 1,
    };

    set(newNoteRef, newNote);
  }, [notes]);
  
  const deleteNote = useCallback((noteId: string) => {
    if (!db) return;
    const noteRef = ref(db, `notes/${noteId}`);
    remove(noteRef);
  }, []);

  const updateNote = useCallback((noteId: string, newValues: Partial<Omit<Note, 'id'>>) => {
      if (!db) return;
      const noteRef = ref(db, `notes/${noteId}`);
      update(noteRef, newValues);
  }, []);

  return { notes, addNote, deleteNote, updateNote };
}
