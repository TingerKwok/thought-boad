import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { Topic, Note } from '../types';

const topicsRef = ref(db, 'topics');

export function useFirebaseData() {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    // Listen for data changes at the 'topics' path
    const unsubscribe = onValue(topicsRef, (snapshot) => {
      const data = snapshot.val();
      // If data is null (e.g., first time), use empty array
      setTopics(data || []);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const addTopic = useCallback(async (title: string) => {
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      title,
      notes: [],
    };
    
    await runTransaction(topicsRef, (currentData: Topic[]) => {
      const currentTopics = currentData || [];
      return [newTopic, ...currentTopics];
    });
  }, []);
  
  const deleteTopic = useCallback(async (topicId: string) => {
     await runTransaction(topicsRef, (currentData: Topic[]) => {
      if (currentData === null) {
        return [];
      }
      return currentData.filter(topic => topic.id !== topicId);
    });
  }, [setTopics]);

  const addNoteToTopic = useCallback(async (topicId: string, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
    };
    
    await runTransaction(topicsRef, (currentData: Topic[]) => {
       if (currentData === null) {
        return [];
      }
      return currentData.map(topic =>
        topic.id === topicId ? { ...topic, notes: [...(topic.notes || []), newNote] } : topic
      );
    });
  }, []);

  const deleteNoteFromTopic = useCallback(async (topicId: string, noteId: string) => {
    await runTransaction(topicsRef, (currentData: Topic[]) => {
      if (currentData === null) {
        return [];
      }
      return currentData.map(topic =>
        topic.id === topicId
          ? { ...topic, notes: topic.notes.filter(note => note.id !== noteId) }
          : topic
      );
    });
  }, []);

  return { topics, addTopic, deleteTopic, addNoteToTopic, deleteNoteFromTopic };
}
