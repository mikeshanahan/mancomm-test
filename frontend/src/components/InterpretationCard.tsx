import React, { useState } from 'react';
import { OshaInterpretation } from '../api/types';
import Highlighter from 'react-highlight-words';
import StandardLinkButton from './StandardLinkButton';
import { getTruncatedTextWithMatch } from '../utils/textUtils';

interface InterpretationCardProps {
  interpretation: OshaInterpretation;
  searchTerms: string[];
}

const InterpretationCard: React.FC<InterpretationCardProps> = ({ interpretation, searchTerms }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const truncatedContent = expanded 
    ? interpretation.content 
    : getTruncatedTextWithMatch(interpretation.content, searchTerms, 500);
  
  return (
    <div className="card mb-3 interpretation-card">
      <div className="card-body">
        <h5 className="card-title">
          <Highlighter
            highlightClassName="bg-warning"
            searchWords={searchTerms}
            autoEscape={true}
            textToHighlight={interpretation.title}
            findChunks={(options) => {
              const { searchWords, textToHighlight } = options;
              const chunks = [];
              if (searchWords[0] && typeof searchWords[0] === 'string' && textToHighlight) {
                const searchTerm = searchWords[0].toLowerCase();
                const text = textToHighlight.toLowerCase();
                let index = text.indexOf(searchTerm);
                while (index !== -1) {
                  chunks.push({
                    start: index,
                    end: index + searchTerm.length
                  });
                  index = text.indexOf(searchTerm, index + 1);
                }
              }
              return chunks;
            }}
          />
        </h5>
        
        <div className="card-subtitle mb-2 text-muted">
          {interpretation.documentDate 
            ? new Date(interpretation.documentDate).toLocaleDateString() 
            : 'No date available'}
        </div>
        
        {interpretation.standardNumberLinks && interpretation.standardNumberLinks.length > 0 && (
          <div className="standards-container mb-3">
            <small className="text-muted d-block mb-1">Standards:</small>
            <div>
              {interpretation.standardNumberLinks.map((standard, index) => (
                <StandardLinkButton key={index} standard={standard} />
              ))}
            </div>
          </div>
        )}
        
        <div className="content-container mb-3 pre-wrap">
          <Highlighter
            highlightClassName="bg-warning"
            searchWords={searchTerms}
            autoEscape={true}
            textToHighlight={truncatedContent}
            findChunks={(options) => {
              const { searchWords, textToHighlight } = options;
              const chunks = [];
              if (searchWords[0] && typeof searchWords[0] === 'string' && textToHighlight) {
                const searchTerm = searchWords[0].toLowerCase();
                const text = textToHighlight.toLowerCase();
                let index = text.indexOf(searchTerm);
                while (index !== -1) {
                  chunks.push({
                    start: index,
                    end: index + searchTerm.length
                  });
                  index = text.indexOf(searchTerm, index + 1);
                }
              }
              return chunks;
            }}
          />
        </div>
        
        <div className="d-flex justify-content-between">
          <div>
            <button 
              className="btn btn-sm btn-outline-primary me-2"
              onClick={toggleExpand}
            >
              {expanded ? 'Show Less' : 'Show More'}
            </button>
            
            <a 
              href={interpretation.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-sm btn-outline-secondary"
            >
              <i className="bi bi-box-arrow-up-right me-1"></i>
              View Original
            </a>
          </div>
          
          {interpretation.images && interpretation.images.length > 0 && (
            <span className="badge bg-info">
              <i className="bi bi-image me-1"></i>
              {interpretation.images.length} image{interpretation.images.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterpretationCard;
