import { useState, useEffect } from 'react';

const TokenInput = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('bearerToken');
    if (savedToken) {
      setToken(savedToken);
      console.log('Token loaded from localStorage on component mount');
    }
  }, []);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const handleSaveToken = () => {
    localStorage.setItem('bearerToken', token);
    // Force reload to recreate the API client with the new token
    window.location.reload();
  };

  const handleClearToken = () => {
    localStorage.removeItem('bearerToken');
    setToken('');
    window.location.reload();
  };

  return (
    <div className="token-input-container mb-4">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Enter Bearer Token"
          value={token}
          onChange={handleTokenChange}
        />
        <button 
          className="btn btn-primary" 
          onClick={handleSaveToken}
          disabled={!token}
        >
          Save Token
        </button>
        {token && (
          <button 
            className="btn btn-outline-danger" 
            onClick={handleClearToken}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenInput;
