import { useState, useEffect } from 'react';
import { useOshaInterpretations } from '../api/hooks';
import { OshaInterpretation, PaginatedResponse } from '../api/types';

const OshaInterpretationsList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sort, setSort] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading, error } = useOshaInterpretations(
    page, 
    limit, 
    sort, 
    sortDirection, 
    searchQuery
  );
  
  const interpretations = data as PaginatedResponse<OshaInterpretation>;
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value);
  };
  
  const handleSortDirectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortDirection(event.target.value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sort, sortDirection]);
  
  return (
    <div className="osha-interpretations-list">
      <div className="row mb-3">
        <div className="col-md-6">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search interpretations..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-md-3">
          <select 
            className="form-select" 
            value={sort}
            onChange={handleSortChange}
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select" 
            value={sortDirection}
            onChange={handleSortDirectionChange}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      
      {isLoading && <p>Loading interpretations...</p>}
      
      {error && <div className="alert alert-danger">Error loading interpretations</div>}
      
      {interpretations && interpretations.items && (
        <>
          <div className="list-group">
            {interpretations.items.map((interpretation) => (
              <div key={interpretation._id} className="list-group-item">
                <h5 className="mb-1">{interpretation.title}</h5>
                <p className="mb-1 text-muted">{new Date(interpretation.date).toLocaleDateString()}</p>
                {interpretation.standardNumberLinks && interpretation.standardNumberLinks.length > 0 && (
                  <div className="mb-2">
                    <small className="text-muted">Standards: </small>
                    {interpretation.standardNumberLinks.map((standard, index) => (
                      <span key={index} className="badge bg-secondary me-1">{standard}</span>
                    ))}
                  </div>
                )}
                <a href={interpretation.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">View Original</a>
              </div>
            ))}
          </div>
          
          {interpretations.totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {Array.from({ length: interpretations.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <li key={pageNum} className={`page-item ${pageNum === page ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${page === interpretations.totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === interpretations.totalPages}
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

export default OshaInterpretationsList;
