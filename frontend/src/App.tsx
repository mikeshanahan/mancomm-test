import { useState, useEffect } from 'react'
import './index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import InterpretationsList from './components/InterpretationsList'
import TokenInput from './components/TokenInput'
import ApiStatus from './components/ApiStatus'

function App() {
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('bearerToken')
    setHasToken(!!token)
  }, [])

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center">OSHA Interpretations</h2>
              {!hasToken && (
                <>
                  <ApiStatus />
                  <TokenInput />
                </>
              )}
            </div>
          </div>

          {hasToken && (
            <div className="card">
              <div className="card-body">
                <InterpretationsList />
              </div>
            </div>
          )}

          {!hasToken && (
            <div className="alert alert-info">
              Please enter a bearer token above to access the OSHA interpretations.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
