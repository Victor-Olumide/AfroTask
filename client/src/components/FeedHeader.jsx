import { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';

const TABS = [
  { key: 'feed', label: 'Feed' },
  { key: 'jobs', label: 'Explore Jobs' },
  { key: 'snippets', label: 'Code Snippets' },
];


const FeedHeader = ({
  activeTab = 'feed',
  onTabChange = () => {},
  onRefresh = () => {},
  refreshing = false,
  searchValue = '',
  onSearchChange = () => {},
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  return (
    <div className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-gray-100 px-4 sm:px-6 py-3 rounded-t-2xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Refresh */}
        <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search posts, snippets, jobs..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-transparent focus:border-gray-200 focus:bg-white rounded-lg outline-none transition"
            />
          </form>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh feed"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedHeader;