import { useState, useEffect } from 'react';
import { useInterpretations } from '../api/hooks';
import { OshaInterpretation, PaginatedResponse } from '../api/types';
import '../styles/InterpretationsList.css';
import InterpretationCard from './InterpretationCard';

const InterpretationsList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sort, setSort] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  
  const { data, isLoading, error } = useInterpretations(
    page, 
    limit, 
    sort, 
    sortDirection, 
    submittedQuery
  );
  
  const interpretations = data as PaginatedResponse;
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value);
    setSubmittedQuery(searchQuery);
  };
  
  const handleSortDirectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortDirection(event.target.value);
    setSubmittedQuery(searchQuery);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedQuery(searchQuery);
  };
  
  useEffect(() => {
    setPage(1);
  }, [submittedQuery, sort, sortDirection]);

  // Calculate total pages
  const totalPages = interpretations?.total ? Math.ceil(interpretations.total / limit) : 0;
  
  return (
    <div className="interpretations-list">
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <p>Search interpretations by title, standard references, date, or matching content</p>
        <div className="input-group">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Enter search here..." 
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search interpretations"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setSubmittedQuery(searchQuery);
              }
            }}
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </div>
      </form>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <label className="me-2 mb-0">Sort by:</label>
            <select 
              className="form-select" 
              value={sort}
              onChange={handleSortChange}
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <label className="me-2 mb-0">Order:</label>
            <select 
              className="form-select" 
              value={sortDirection}
              onChange={handleSortDirectionChange}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading && <div className="d-flex justify-content-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>}
      
      {error && <div className="alert alert-danger">Error loading interpretations</div>}
      
      {interpretations && interpretations.results && (
        <div className="results-summary mb-3">
          <h6 className="text-muted">
            {interpretations.total === 0 
              ? 'No interpretations found matching your criteria.' 
              : `Found ${interpretations.total} interpretation${interpretations.total !== 1 ? 's' : ''}`
            }
          </h6>
        </div>
      )}

      {interpretations && interpretations.results && interpretations.results.length > 0 && (
        <>
          <div className="interpretation-cards">
            {interpretations.results.map((interpretation: OshaInterpretation) => (
              <InterpretationCard 
                key={interpretation._id} 
                interpretation={interpretation} 
                searchTerms={submittedQuery ? [submittedQuery] : []}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <li key={pageNum} className={`page-item ${pageNum === page ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default InterpretationsList;
