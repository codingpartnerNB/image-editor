import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './SearchPage.module.css';

function SearchPage({ setSelectedImage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
  const PER_PAGE = 12;

  const searchImages = useCallback(async (newPage = 1) => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      setImages([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      const response = await fetch(
        `https://pixabay.com/api/?key=${API_KEY}&q=${encodedSearchTerm}&image_type=photo&per_page=${PER_PAGE}&page=${newPage}&safesearch=true`
      );

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      if (data.totalHits === 0) {
        setImages([]);
        setError('No images found for this search term');
      } else {
        setImages(data.hits);
        setPage(newPage);
        setTotalPages(Math.ceil(data.totalHits / PER_PAGE));
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to fetch images. Please try again later.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, API_KEY]);

  useEffect(() => {
    // Search immediately when searchTerm changes
    if (searchTerm.trim()) {
      const timer = setTimeout(() => {
        searchImages(1);
      }, 500); // 500ms debounce delay

      return () => clearTimeout(timer);
    } else {
      setImages([]);
      setHasSearched(false);
    }
  }, [searchTerm, searchImages]);

  const handleImageSelect = (image) => {
    setSelectedImage(image.largeImageURL);
    navigate('/editor');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      searchImages(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

//   const downloadImage = (url, tags) => {
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `image_${tags.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

  return (
    <div className={styles.searchPage}>
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>Image Editor</h1>
        <p className={styles.subtitle}>Discover, edit, and download high-resolution images Created By <span className={styles.myname}>Neha Bisht (nehab5314@gmail.com)</span></p>
        
        <div className={styles.searchInputContainer}>
          <div className={styles.inputWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              value={searchTerm}
              placeholder="Search for images..."
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {error && !loading && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <div>Loading premium images...</div>
        </div>
      )}

      <div className={styles.imageGrid}>
        {images.map((image) => (
          <div key={image.id} className={styles.imageCard}>
            <div className={styles.imageWrapper}>
              <img 
                src={image.webformatURL} 
                alt={image.tags} 
                loading="lazy"
                className={styles.image}
              />
              <div className={styles.imageOverlay}>
                {/* <div className={styles.imageActions}>
                    <button 
                        onClick={() => handleImageSelect(image)}
                        className={styles.addCaptionButton}
                        aria-label="Add caption to image"
                    >
                        <FaPlus className={styles.buttonIcon} />
                        <span>Add Caption</span>
                    </button>
                    <button 
                        onClick={() => downloadImage(image.webformatURL, image.tags)}
                        className={styles.downloadButton}
                        aria-label="Download image"
                    >
                        <FaDownload className={styles.buttonIcon} />
                        <span>Download</span>
                    </button>
                </div> */}
                <button 
                    onClick={() => handleImageSelect(image)}
                    className={styles.addCaptionButton}
                    aria-label="Add caption to image"
                    >
                    <FaPlus className={styles.plusIcon} />
                </button>
              </div>
            </div>
            <div className={styles.imageInfo}>
              <div className={styles.imageTags}>
                {image.tags.split(',').slice(0, 3).map((tag, index) => (
                  <span key={index} className={styles.tag}>#{tag.trim()}</span>
                ))}
              </div>
              <div className={styles.imageStats}>
                <span className={styles.statItem}>Likes: {image.likes}</span>
                <span className={styles.statItem}>Views: {image.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length > 0 && !loading && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className={styles.paginationButton}
            aria-label="Previous page"
          >
            <FaChevronLeft />
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className={styles.paginationButton}
            aria-label="Next page"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      {!loading && !hasSearched && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#5F7AFF" d="M45.2,-58.8C58.9,-49.6,70.8,-36.3,73.1,-21.1C75.4,-5.9,68.1,11.3,59.1,27.3C50.1,43.3,39.4,58.2,22.8,68.1C6.2,78,-16.3,82.9,-33.4,75.8C-50.5,68.7,-62.2,49.6,-68.1,29.7C-74,9.8,-74.1,-10.9,-65.9,-28.5C-57.7,-46.1,-41.2,-60.6,-24.6,-68.9C-8,-77.2,8.8,-79.2,23.6,-73.6C38.4,-68,51.1,-54.7,45.2,-58.8Z" transform="translate(100 100)" />
            </svg>
          </div>
          <h2>Unleash Your Creative Vision</h2>
          <p>Discover breathtaking images to transform into masterpieces</p>
        </div>
      )}

      {!loading && hasSearched && images.length === 0 && !error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FF6B6B" d="M49.5,-58.8C62.5,-48.1,69.5,-30.3,71.5,-11.9C73.5,6.5,70.5,25.5,58.4,39.7C46.3,53.9,25.1,63.3,2.9,61.3C-19.3,59.3,-38.6,45.9,-50.1,30.4C-61.6,14.9,-65.3,-2.7,-60.6,-18.5C-55.9,-34.3,-42.8,-48.3,-27.9,-58.2C-13,-68.1,3.7,-73.9,19.1,-69.9C34.5,-65.8,48.6,-51.9,49.5,-58.8Z" transform="translate(100 100)" />
            </svg>
          </div>
          <h2>No images found</h2>
          <p>Try a different search term to find amazing images</p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;