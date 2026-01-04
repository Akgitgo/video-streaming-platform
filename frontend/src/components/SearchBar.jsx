import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const SearchBar = ({ onSearch, onFilter }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        sensitivity: '',
        sort: 'newest'
    });

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchTerm, filters);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onSearch(searchTerm, newFilters);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ sensitivity: '', sort: 'newest' });
        onSearch('', { sensitivity: '', sort: 'newest' });
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search
                        size={20}
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)'
                        }}
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search videos by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '3rem' }}
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Filter size={18} />
                    Filters
                </button>
                {(searchTerm || filters.sensitivity || filters.sort !== 'newest') && (
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={clearFilters}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <X size={18} />
                        Clear
                    </button>
                )}
            </form>

            {showFilters && (
                <div style={{
                    padding: '1.5rem',
                    background: 'var(--surface-dark)',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div>
                        <label className="form-label">Sensitivity Status</label>
                        <select
                            className="form-input"
                            value={filters.sensitivity}
                            onChange={(e) => handleFilterChange('sensitivity', e.target.value)}
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="">All Videos</option>
                            <option value="safe">Safe Only</option>
                            <option value="flagged">Flagged Only</option>
                            <option value="pending">Pending Review</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Sort By</label>
                        <select
                            className="form-input"
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="views">Most Views</option>
                            <option value="title">Title (A-Z)</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
