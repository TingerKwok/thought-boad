import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { useFirebaseData } from './hooks/useFirebaseData';
import StickyNote from './components/StickyNote';
import AddNoteForm from './components/AddTopicForm';
import { isFirebaseConfigured } from './firebaseConfig';
import { Note } from './types';

function FirebaseConfigMessage() {
  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-2xl p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">Action Required: Configure Firebase</h2>
        <p className="mb-4">
          This collaborative board requires a Firebase Realtime Database to function.
        </p>
        <p className="mb-6">
          Please open the <code className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-sm font-mono">firebaseConfig.ts</code> file and replace the placeholder configuration with your own Firebase project's credentials.
        </p>
        <a 
          href="https://console.firebase.google.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-indigo-600 text-white font-semibold rounded-lg shadow-md px-6 py-3 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-105"
        >
          Go to Firebase Console
        </a>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          After configuring, also ensure your Realtime Database rules allow reads and writes.
        </p>
      </div>
    </div>
  );
}

function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-[100] p-4 text-white">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-semibold">{message}</p>
      </div>
    </div>
  );
}

function App() {
  const { notes, addNote, deleteNote, updateNote } = useFirebaseData();
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [draggingNote, setDraggingNote] = useState<{ id: string; offsetX: number; offsetY: number; width: number; height: number; } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    if (!draggingNote) {
      setLocalNotes(notes);
    }
  }, [notes, draggingNote]);
  
  // Initialize the AI client once.
  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }, []);

  const handleFormSubmit = async (promptText: string) => {
    if (!aiRef.current) return;
    setIsProcessing(true);
    setLoadingMessage("Thinking...");

    try {
      // Step 1: Check if the prompt is an English noun.
      const classificationResponse = await aiRef.current.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Is the following an English noun or a simple noun phrase that can be depicted as a single object? Answer only with "yes" or "no". Text: "${promptText}"`,
      });
      const isNoun = classificationResponse.text.trim().toLowerCase() === 'yes';

      // Step 2: Generate an image or a text note based on the classification.
      if (isNoun) {
        setLoadingMessage("Creating your image...");
        const imageResponse = await aiRef.current.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `A simple, cute, cartoon-style icon of a "${promptText}". Centered on a clean, white background.` }],
          },
          config: {
              responseModalities: [Modality.IMAGE],
          },
        });

        const part = imageResponse.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
          addNote(imageUrl, 'image');
        } else {
          throw new Error("Could not generate image from the response.");
        }
      } else {
        addNote(promptText, 'text');
      }
    } catch (error) {
      console.error("Processing failed:", error);
      alert("Sorry, something went wrong. Please try again!");
      // As a fallback, create a text note with the original prompt
      addNote(promptText, 'text');
    } finally {
      setIsProcessing(false);
    }
  };

  const bringToFront = useCallback((noteId: string) => {
    const maxZ = localNotes.reduce((max, note) => Math.max(max, note.zIndex || 1), 0);
    const targetNote = localNotes.find(n => n.id === noteId);
    if (targetNote && targetNote.zIndex <= maxZ) {
        const newZIndex = maxZ + 1;
        setLocalNotes(prev => prev.map(n => n.id === noteId ? { ...n, zIndex: newZIndex } : n).sort((a,b) => (a.zIndex || 0) - (b.zIndex || 0)));
        updateNote(noteId, { zIndex: newZIndex });
    }
  }, [localNotes, updateNote]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, noteId: string) => {
    const noteElement = e.currentTarget;
    const rect = noteElement.getBoundingClientRect();
    setDraggingNote({
      id: noteId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: noteElement.offsetWidth,
      height: noteElement.offsetHeight,
    });
    bringToFront(noteId);
    e.preventDefault();
  }, [bringToFront]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingNote || !whiteboardRef.current) return;
    
    const whiteboardRect = whiteboardRef.current.getBoundingClientRect();
    
    let x = e.clientX - whiteboardRect.left - draggingNote.offsetX;
    let y = e.clientY - whiteboardRect.top - draggingNote.offsetY;

    x = Math.max(10, Math.min(x, whiteboardRect.width - draggingNote.width - 10));
    y = Math.max(10, Math.min(y, whiteboardRect.height - draggingNote.height - 10));
    
    setLocalNotes(prevNotes => 
      prevNotes.map(n => 
          n.id === draggingNote.id ? { ...n, x, y } : n
      )
    );
  }, [draggingNote]);
  
  const handleMouseUp = useCallback(() => {
    if (!draggingNote) return;
    
    const finalNote = localNotes.find(n => n.id === draggingNote.id);
    if (finalNote) {
      updateNote(draggingNote.id, { x: finalNote.x, y: finalNote.y });
    }
    
    setDraggingNote(null);
  }, [draggingNote, updateNote, localNotes]);
  
  if (!isFirebaseConfigured) {
    return <FirebaseConfigMessage />;
  }

  return (
    <div className="min-h-screen font-sans">
      {isProcessing && <LoadingOverlay message={loadingMessage} />}
      <header className="text-center py-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Caveat', cursive" }}>
          Thought Board
        </h1>
      </header>

      <main 
        ref={whiteboardRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 pt-16"
      >
        {localNotes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onMouseDown={handleMouseDown}
            onDelete={deleteNote}
          />
        ))}
        {localNotes.length === 0 && !isProcessing && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-center p-10">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Whiteboard is Empty</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Add text or an English noun for an image!
                </p>
              </div>
           </div>
        )}
      </main>
      
      <AddNoteForm onSubmit={handleFormSubmit} isProcessing={isProcessing} />
    </div>
  );
}

export default App;