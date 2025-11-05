import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, remove, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { db, isFirebaseConfigured } from '../firebaseConfig';
import { Topic, Note } from '../types';

// This interface describes the shape of the data as it's stored in Firebase.
// Firebase Realtime Database doesn't natively support arrays, so we use objects with unique keys.
interface FirebaseTopics {
  [key: string]: Omit<Topic, 'id' | 'notes'> & {
    notes?: { [key: string]: Omit<Note, 'id'> }
  };
}

export function useFirebaseData() {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    // If Firebase is not configured, do nothing. The App component will display a setup message.
    if (!isFirebaseConfigured || !db) {
      return;
    }

    const topicsRef = ref(db, 'topics');
    
    // Set up a real-time listener. 'onValue' fires once with the initial data,
    // and then again every time the data changes in the database.
    const unsubscribe = onValue(topicsRef, (snapshot) => {
      const data: FirebaseTopics | null = snapshot.val();
      if (data) {
        // Transform the Firebase object data into the array format the app uses.
        const topicsArray: Topic[] = Object.entries(data).map(([topicId, topicData]) => {
          const notesArray: Note[] = topicData.notes 
            ? Object.entries(topicData.notes).map(([noteId, noteData]) => ({
              id: noteId,
              content: noteData.content,
              timestamp: noteData.timestamp || '', // Handle old notes without timestamps
            }))
            : [];
          return {
            id: topicId,
            title: topicData.title,
            createdAt: topicData.createdAt || '', // Handle old topics without dates
            notes: notesArray,
          };
        });
        // Reverse the array to show the most recently created topics first.
        setTopics(topicsArray.reverse());
      } else {
        // If there's no data in the database, set topics to an empty array.
        setTopics([]);
      }
    });

    // Return a cleanup function to detach the listener when the component unmounts.
    // This prevents memory leaks.
    return () => unsubscribe();
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  const addTopic = useCallback((title: string) => {
    if (!db) return;
    const topicsRef = ref(db, 'topics');
    const newTopicRef = push(topicsRef); // 'push' generates a unique ID.
    set(newTopicRef, {
      title,
      createdAt: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
      notes: {}, // Initialize with an empty notes object.
    });
  }, []);
  
  const deleteTopic = useCallback((topicId: string) => {
    if (!db) return;
    const topicRef = ref(db, `topics/${topicId}`);
    remove(topicRef);
  }, []);

  const addNoteToTopic = useCallback((topicId: string, content: string) => {
    if (!db) return;
    const notesRef = ref(db, `topics/${topicId}/notes`);
    const newNoteRef = push(notesRef);
    set(newNoteRef, {
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    });
  }, []);

  const deleteNoteFromTopic = useCallback((topicId: string, noteId: string) => {
    if (!db) return;
    const noteRef = ref(db, `topics/${topicId}/notes/${noteId}`);
    remove(noteRef);
  }, []);

  return { topics, addTopic, deleteTopic, addNoteToTopic, deleteNoteFromTopic };
}