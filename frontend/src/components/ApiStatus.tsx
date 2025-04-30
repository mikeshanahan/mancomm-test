import { useHealthCheck } from '../api/hooks';

const ApiStatus = () => {
  const { data, isLoading } = useHealthCheck();
  
  return (
    <div className="api-status mb-4">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">API Status</h5>
          {isLoading ? (
            <p>Checking API status...</p>
          ) : (
            <div className="d-flex align-items-center">
              <div 
                className={`status-indicator me-2 ${data?.status === 'online' ? 'bg-success' : 'bg-danger'}`}
                style={{ width: '12px', height: '12px', borderRadius: '50%' }}
              ></div>
              <span>{data?.status === 'online' ? 'API is online' : 'API is offline'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;
