import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Login form submitted with:', formData.email);

    try {
      const result = await login(formData.email, formData.password);
      
      // Redirect based on user role
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else if (result.user.role === 'recruiter') {
        navigate('/recruiter');
      } else if (result.user.role === 'student') {
        navigate('/student');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login form error:', error);
      setError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-secondary)'
    }}>
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                Welcome Back
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Sign in to your PlaceVerse account
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: 'var(--error)',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <Link 
                  to="/forgot-password" 
                  style={{ 
                    color: 'var(--primary)', 
                    textDecoration: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Don't have an account?{' '}
                </span>
                <Link 
                  to="/register" 
                  style={{ 
                    color: 'var(--primary)', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Sign up here
                </Link>
              </div>
            </form>
          </div>

          {/* Demo Credentials */}
          <div className="card" style={{ marginTop: '1rem', background: 'var(--bg-tertiary)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Demo Accounts (for testing):
            </h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Student:</strong> student@demo.com / password123
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Recruiter:</strong> recruiter@demo.com / password123
              </div>
              <div>
                <strong>Admin:</strong> admin@demo.com / password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function Login() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const from = location.state?.from?.pathname || '/';

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (error) setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     console.log('🔑 Login attempt:', formData.email);

//     try {
//       const result = await login(formData.email, formData.password);
      
//       console.log('✅ Login successful, result:', result);
//       console.log('🎯 User role:', result?.user?.role);

//       // Check if we have user data and role
//       if (!result || !result.user || !result.user.role) {
//         throw new Error('Invalid login response - missing user role');
//       }

//       const userRole = result.user.role;
      
//       // Navigate with small delay to ensure state updates
//       setTimeout(() => {
//         switch (userRole) {
//           case 'admin':
//             navigate('/admin', { replace: true });
//             break;
//           case 'recruiter':
//             navigate('/recruiter', { replace: true });
//             break;
//           case 'student':
//             navigate('/student', { replace: true });
//             break;
//           default:
//             navigate(from, { replace: true });
//         }
//       }, 100);

//     } catch (error) {
//       console.error('❌ Login error:', error);
      
//       let errorMessage = 'Login failed. Please try again.';
      
//       if (error.message) {
//         if (error.message.includes('Invalid email or password')) {
//           errorMessage = 'Invalid email or password. Please check your credentials.';
//         } else if (error.message.includes('Network Error')) {
//           errorMessage = 'Network error. Please check your connection and try again.';
//         } else {
//           errorMessage = error.message;
//         }
//       }
      
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ 
//       minHeight: '100vh', 
//       display: 'flex', 
//       alignItems: 'center', 
//       justifyContent: 'center',
//       background: 'var(--bg-secondary)',
//       padding: '2rem 1rem'
//     }}>
//       <div className="container">
//         <div style={{ maxWidth: '400px', margin: '0 auto' }}>
//           <div className="card">
//             <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
//               <h1>Welcome Back</h1>
//               <p style={{ color: 'var(--text-secondary)' }}>
//                 Sign in to your PlaceVerse account
//               </p>
//             </div>

//             {error && (
//               <div style={{
//                 background: 'rgba(244, 67, 54, 0.1)',
//                 border: '1px solid var(--error)',
//                 borderRadius: 'var(--radius)',
//                 padding: '1rem',
//                 marginBottom: '1.5rem',
//                 color: 'var(--error)',
//                 fontSize: '0.875rem',
//                 textAlign: 'center'
//               }}>
//                 <strong>Login Failed:</strong> {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit}>
//               <div className="form-group">
//                 <label className="form-label">Email Address</label>
//                 <input
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="form-input"
//                   placeholder="Enter your email"
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Password</label>
//                 <input
//                   name="password"
//                   type="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   className="form-input"
//                   placeholder="Enter your password"
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="btn btn-primary"
//                 style={{ width: '100%', marginBottom: '1rem' }}
//               >
//                 {loading ? (
//                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
//                     <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
//                     Signing in...
//                   </div>
//                 ) : (
//                   'Sign In'
//                 )}
//               </button>

//               <div style={{ textAlign: 'center' }}>
//                 <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
//                   Don't have an account? Sign up here
//                 </Link>
//               </div>
//             </form>
//           </div>

//           {/* Demo Credentials */}
//           <div className="card" style={{ marginTop: '1rem', background: 'var(--bg-tertiary)' }}>
//             <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
//               🧪 Demo Accounts:
//             </h4>
//             <div style={{ fontSize: '0.75rem' }}>
//               <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
//                 <strong style={{ color: 'var(--primary)' }}>Student:</strong> student@demo.com / password123
//               </div>
//               <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
//                 <strong style={{ color: 'var(--success)' }}>Recruiter:</strong> recruiter@demo.com / password123
//               </div>
//               <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
//                 <strong style={{ color: 'var(--error)' }}>Admin:</strong> admin@demo.com / password123
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
