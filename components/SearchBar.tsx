
import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="w-full max-w-xs">
      <input
        type="text"
        placeholder="Filter tracks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 bg-tezos-gray-medium border border-tezos-gray-light rounded-full focus:ring-2 focus:ring-tezos-blue focus:outline-none transition-shadow duration-200 text-tezos-text-primary placeholder-tezos-text-secondary"
      />
    </div>
  );
};

export default SearchBar;
