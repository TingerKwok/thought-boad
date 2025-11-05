import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { Topic, Note } from '../types';

// This hook now uses Local Storage instead of Firebase for data persistence.
// The function name is kept as `useFirebaseData` to minimize changes in App.tsx.
export function useFirebaseData() {
  const [topics, setTopics] = useLocalStorage<Topic[]>('thought-board-topics', []);

  const addTopic = useCallback((title: string) => {
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      title,
      notes: [],
    };
    // Add new topics to the end of the array so they appear at the bottom.
    setTopics(prevTopics => [...prevTopics, newTopic]);
  }, [setTopics]);
  
  const deleteTopic = useCallback((topicId: string) => {
    setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicId));
  }, [setTopics]);

  const addNoteToTopic = useCallback((topicId: string, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
    };

    setTopics(prevTopics => 
      prevTopics.map(topic => {
        if (topic.id === topicId) {
          return {
            ...topic,
            notes: [...topic.notes, newNote],
          };
        }
        return topic;
      })
    );
  }, [setTopics]);

  const deleteNoteFromTopic = useCallback((topicId: string, noteId: string) => {
    setTopics(prevTopics =>
      prevTopics.map(topic => {
        if (topic.id === topicId) {
          return {
            ...topic,
            notes: topic.notes.filter(note => note.id !== noteId),
          };
        }
        return topic;
      })
    );
  }, [setTopics]);

  return { topics, addTopic, deleteTopic, addNoteToTopic, deleteNoteFromTopic };
}
