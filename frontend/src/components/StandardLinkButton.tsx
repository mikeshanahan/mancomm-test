interface StandardLinkButtonProps {
  standard: string;
}

const StandardLinkButton: React.FC<StandardLinkButtonProps> = ({ standard }) => {
  const displayText = standard.split('/').pop() || standard;
  
  return (
    <span className="standard-link-container d-inline-flex align-items-center me-2 mb-1">
      <a 
        href={standard} 
        target="_blank" 
        rel="noopener noreferrer"
        className="badge bg-secondary text-decoration-none"
      >
        {displayText}
      </a>
    </span>
  );
};

export default StandardLinkButton;
