import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { Link } from "react-router-dom";
import { BsMusicNote } from "react-icons/bs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="auth-container">
      <div className="hero-section position-relative overflow-hidden py-5">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient"></div>
        <div className="container position-relative">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="auth-card">
                <div className="text-center mb-4">
                  <BsMusicNote className="text-success mb-3" size={48} />
                  <h1 className="display-6 fw-bold text-light mb-1">Welcome back</h1>
                  <p className="text-light opacity-75">Login to continue to Spitifo</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label text-light opacity-75">Email address</label>
                    <input
                      type="email"
                      className="form-control custom-input"
                      id="email"
                      placeholder="name@example.com"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="password" className="form-label text-light opacity-75">Password</label>
                    <input
                      type="password"
                      className="form-control custom-input"
                      id="password"
                      placeholder="Enter your password"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn custom-gradient w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Log In'}
                  </button>

                  {error && (
                    <div className="alert custom-alert mb-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  <p className="text-center text-light opacity-75 mb-0">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-success text-decoration-none">
                      Sign up
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          background: #121212;
          font-family: 'Circular Std', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .bg-gradient {
          background: linear-gradient(to bottom, 
            rgba(18, 18, 18, 0) 0%,
            #121212 100%
          ), 
          linear-gradient(to right, 
            #1DB954 0%, 
            #191414 100%
          );
          opacity: 0.95;
          mix-blend-mode: overlay;
        }

        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 2rem;
        }

        .custom-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 500px;
          color: white;
          padding: 12px 20px;
          transition: all 0.3s ease;
        }

        .custom-input:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: #1DB954;
          box-shadow: none;
          color: white;
        }

        .custom-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .custom-gradient {
          background: linear-gradient(45deg, #1DB954, #169C46);
          border: none;
          border-radius: 500px;
          color: white;
          font-weight: 600;
          letter-spacing: 0.1px;
          padding: 12px 32px;
          transition: all 0.3s cubic-bezier(0.3, 0, 0.2, 1);
        }

        .custom-gradient:hover:not(:disabled) {
          transform: scale(1.02);
          background: linear-gradient(45deg, #1ed760, #1DB954);
          box-shadow: 0 8px 16px rgba(29, 185, 84, 0.3);
        }

        .custom-gradient:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .custom-alert {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
          color: #dc3545;
          border-radius: 8px;
          padding: 1rem;
        }

        .text-success {
          color: #1DB954 !important;
        }

        .text-success:hover {
          color: #1ed760 !important;
        }

        @media (max-width: 768px) {
          .auth-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
