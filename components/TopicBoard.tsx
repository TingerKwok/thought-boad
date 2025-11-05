import React, { useState, useMemo } from 'react';
import { Topic, Note } from '../types';
import StickyNote from './StickyNote';

interface TopicBoardProps {
  topic: Topic;
  addNote: (topicId: string, content: string) => void;
  deleteNote: (topicId: string, noteId: string) => void;
  deleteTopic: (topicId: string) => void;
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

const TopicBoard: React.FC<TopicBoardProps> = ({ topic, addNote, deleteNote, deleteTopic }) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  
  const memoizedRotations = useMemo(() => {
    return topic.notes.map((_, index) => rotations[index % rotations.length]);
  }, [topic.notes]);

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      addNote(topic.id, newNoteContent);
      setNewNoteContent('');
    }
  };
  
  const handleDeleteNote = (noteId: string) => {
    deleteNote(topic.id, noteId);
  };

  const handleDeleteTopic = () => {
    if (window.confirm(`Are you sure you want to delete the topic "${topic.title}" and all its notes?`)) {
      deleteTopic(topic.id);
    }
  };


  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex items-baseline">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{topic.title}</h2>
          {topic.createdAt && (
            <span className="ml-3 text-sm font-normal text-gray-400 dark:text-gray-500">{topic.createdAt}</span>
          )}
        </div>
        <button 
          onClick={handleDeleteTopic}
          className="font-sans text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-bold text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Delete topic"
        >
          &times;
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[100px]">
        {topic.notes.map((note, index) => (
          <StickyNote 
            key={note.id} 
            note={note} 
            color={noteColors[index % noteColors.length]}
            rotation={memoizedRotations[index]}
            onDelete={handleDeleteNote}
          />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Add your thought..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          rows={3}
        />
        <button
          onClick={handleAddNote}
          className="mt-2 w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
        >
          Add Thought
        </button>
      </div>
    </div>
  );
};

export default TopicBoard;