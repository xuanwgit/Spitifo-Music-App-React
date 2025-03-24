import { useState, useEffect } from "react";
import { useSignup } from "../hooks/useSignup";
import { BsCheckCircleFill, BsXCircleFill, BsShieldLock } from "react-icons/bs";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const { signup, error, isLoading } = useSignup();
  const [showNotification, setShowNotification] = useState(false);
  
  // Password validation states
  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Calculate overall password strength
  const getPasswordStrength = () => {
    const validCount = Object.values(validations).filter(Boolean).length;
    if (validCount === 0) return { text: "Very Weak", class: "danger" };
    if (validCount <= 2) return { text: "Weak", class: "warning" };
    if (validCount <= 4) return { text: "Moderate", class: "info" };
    return { text: "Strong", class: "success" };
  };

  // Check if all validations pass
  const isPasswordValid = Object.values(validations).every(Boolean);

  // Check password requirements in real-time
  useEffect(() => {
    if (password) {
      setShowNotification(true);
      setValidations({
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*]/.test(password)
      });
    } else {
      setShowNotification(false);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setShowNotification(true);
      return;
    }
    await signup(email, password);
  };

  const ValidationIcon = ({ isValid }) => (
    isValid ? (
      <BsCheckCircleFill className="text-success ms-2" />
    ) : (
      <BsXCircleFill className="text-danger ms-2" />
    )
  );

  const strength = getPasswordStrength();

  return (
    <div className="container mt-4">
      <form onSubmit={handleSubmit} className="signup">
        <h3 className="mb-4">Sign up</h3>

        <div className="mb-3 col-md-6">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            name="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <div className="mb-3 col-md-6">
          <label htmlFor="password" className="form-label">
            Password: 
            {password && (
              <span className={`badge bg-${strength.class} ms-2`}>
                {strength.text}
              </span>
            )}
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <BsShieldLock />
            </span>
            <input
              type="password"
              className={`form-control ${showNotification && !isPasswordValid ? 'is-invalid' : ''}`}
              name="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
          {showNotification && !isPasswordValid && (
            <div className="invalid-feedback d-block">
              Please meet all password requirements below
            </div>
          )}
        </div>

        {showNotification && (
          <div className="password-requirements mb-3 col-md-6">
            <h6 className="mt-3">Password Requirements:</h6>
            <ul className="list-unstyled">
              <li className={`d-flex align-items-center ${validations.minLength ? 'text-success' : 'text-danger'}`}>
                <ValidationIcon isValid={validations.minLength} />
                <span className="ms-2">At least 8 characters</span>
              </li>
              <li className={`d-flex align-items-center ${validations.hasUpperCase ? 'text-success' : 'text-danger'}`}>
                <ValidationIcon isValid={validations.hasUpperCase} />
                <span className="ms-2">At least one uppercase letter</span>
              </li>
              <li className={`d-flex align-items-center ${validations.hasLowerCase ? 'text-success' : 'text-danger'}`}>
                <ValidationIcon isValid={validations.hasLowerCase} />
                <span className="ms-2">At least one lowercase letter</span>
              </li>
              <li className={`d-flex align-items-center ${validations.hasNumber ? 'text-success' : 'text-danger'}`}>
                <ValidationIcon isValid={validations.hasNumber} />
                <span className="ms-2">At least one number</span>
              </li>
              <li className={`d-flex align-items-center ${validations.hasSpecialChar ? 'text-success' : 'text-danger'}`}>
                <ValidationIcon isValid={validations.hasSpecialChar} />
                <span className="ms-2">At least one special character (!@#$%^&*)</span>
              </li>
            </ul>
          </div>
        )}

        <button 
          className="btn btn-primary"
          disabled={isLoading || !isPasswordValid || !email}
        >
          Sign up
        </button>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default Signup;
