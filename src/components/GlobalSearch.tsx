import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, Layers, Hash, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  type: string;
  url: string;
  group: string;
}

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const performSearch = async (q: string) => {
    setIsLoading(true);
    try {
      const response = await api.get('/global-search', { params: { q } });
      setResults(response.data);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Page': return <FileText className="h-4 w-4" />;
      case 'Industry': return <Layers className="h-4 w-4" />;
      case 'Service': return <Hash className="h-4 w-4" />;
      default: return <Command className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <div className="relative">
        <button className="absolute left-0 top-1/2 -translate-y-1/2 p-2">
          <Search className="h-5 w-5 text-gray-400" />
        </button>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search pages, industries, services..."
          className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125 h-10"
        />

        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full rounded-md border border-stroke bg-white py-2 shadow-default dark:border-strokedark dark:bg-boxdark z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-meta-4 ${
                  index === selectedIndex ? 'bg-gray-100 dark:bg-meta-4' : ''
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {getIconForType(result.type)}
                </div>
                <div>
                  <h5 className="font-medium text-black dark:text-white">
                    {result.title}
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {result.description}
                  </p>
                </div>
                <span className="ml-auto text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-meta-4 text-gray-600 dark:text-gray-300">
                  {result.type}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
