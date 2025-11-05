import React from 'react';
import { useFirebaseData } from './hooks/useFirebaseData';
import TopicBoard from './components/TopicBoard';
import AddTopicForm from './components/AddTopicForm';
import { isFirebaseConfigured } from './firebaseConfig';

// A component to display a helpful message if Firebase is not configured.
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

function App() {
  const { topics, addTopic, deleteTopic, addNoteToTopic, deleteNoteFromTopic } = useFirebaseData();

  // If Firebase is not configured, show the setup message instead of the app.
  if (!isFirebaseConfigured) {
    return <FirebaseConfigMessage />;
  }

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
