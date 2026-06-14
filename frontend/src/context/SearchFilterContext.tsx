import { createContext, useContext, useState, useMemo } from 'react';

interface SearchFilterState {
  search: string;
  tagFilter: string | null;
  setSearch: (query: string) => void;
  setTagFilter: (tag: string | null) => void;
}

const SearchFilterContext = createContext<SearchFilterState | undefined>(undefined);

export function SearchFilterProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const value = useMemo(() => ({ search, tagFilter, setSearch, setTagFilter }), [search, tagFilter]);

  return (
    <SearchFilterContext.Provider value={value}>
      {children}
    </SearchFilterContext.Provider>
  );
}

export function useSearchFilter(): SearchFilterState {
  const ctx = useContext(SearchFilterContext);
  if (!ctx) throw new Error('useSearchFilter must be used within SearchFilterProvider');
  return ctx;
}