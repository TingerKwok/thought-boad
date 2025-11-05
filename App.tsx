import React from 'react';
import { useFirebaseData } from './hooks/useFirebaseData'; // This now uses local storage
import TopicBoard from './components/TopicBoard';
import AddTopicForm from './components/AddTopicForm';

function App() {
  const { topics, addTopic, deleteTopic, addNoteToTopic, deleteNoteFromTopic } = useFirebaseData();

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans p-4 sm:p-8 transition-colors duration-300">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
          Thought Board
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Share your thoughts, together.</p>
      </header>

      <main className="flex flex-col items-center gap-8">
        <AddTopicForm onAddTopic={addTopic} />
        {topics.length > 0 ? (
          <div className="w-full max-w-7xl flex flex-col gap-8">
            {topics.map(topic => (
              <TopicBoard
                key={topic.id}
                topic={topic}
                addNote={addNoteToTopic}
                deleteNote={deleteNoteFromTopic}
                deleteTopic={deleteTopic}
              />
            ))}
          </div>
        ) : (
          <div className="text-center mt-12 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">It's a bit quiet here...</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Create your first topic to get started!
            </p>
          </div>
        )}
      </main>
      
      <footer className="text-center mt-12 py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Built with ❤️.</p>
      </footer>
    </div>
  );
}

export default App;