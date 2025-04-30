import React from 'react';
import { OshaInterpretation } from '../api/types';
import Highlighter from 'react-highlight-words';

interface InterpretationDetailProps {
  interpretation: OshaInterpretation;
  searchQuery: string;
}

const InterpretationDetail: React.FC<InterpretationDetailProps> = ({ interpretation, searchQuery }) => {
  const searchWords = searchQuery ? searchQuery.split(/\s+/) : [];

  return (
    <div className="interpretation-detail">
      <h4 className="mb-3">
        <Highlighter
          highlightClassName="bg-warning"
          searchWords={searchWords}
          autoEscape={true}
          textToHighlight={interpretation.title}
        />
      </h4>
      
      <div className="mb-3">
        <strong>Date:</strong> {interpretation.documentDate ? 
          new Date(interpretation.documentDate).toLocaleDateString() : 'No date available'}
      </div>
      
      {interpretation.standardNumberLinks && interpretation.standardNumberLinks.length > 0 && (
        <div className="mb-3">
          <strong>Standards:</strong>
          <div>
            {interpretation.standardNumberLinks.map((standard, index) => (
              <a 
                key={index} 
                href={standard} 
                target="_blank" 
                rel="noopener noreferrer"
                className="badge bg-secondary me-1 mb-1 text-decoration-none"
              >
                {standard.split('/').pop()}
              </a>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-3">
        <strong>Content:</strong>
        <div className="content-container p-3 bg-light rounded">
          <Highlighter
            highlightClassName="bg-warning"
            searchWords={searchWords}
            autoEscape={true}
            textToHighlight={interpretation.content}
          />
        </div>
      </div>
      
      {interpretation.images && interpretation.images.length > 0 && (
        <div className="mb-3">
          <strong>Images:</strong>
          <div className="row">
            {interpretation.images.map((imageUrl, index) => (
              <div key={index} className="col-md-4 mb-2">
                <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                  <img src={imageUrl} alt={`Image ${index + 1}`} className="img-fluid thumbnail" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-3">
        <a 
          href={interpretation.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary"
        >
          View Original Document
        </a>
      </div>
    </div>
  );
};

export default InterpretationDetail;
