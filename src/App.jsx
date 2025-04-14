import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import EditPage from './components/EditPage';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<SearchPage setSelectedImage={setSelectedImage} />} />
          <Route path="/editor" element={<EditPage selectedImage={selectedImage} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;