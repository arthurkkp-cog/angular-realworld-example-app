import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path ? 'active' : '';
    }
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          conduit
        </Link>

        {!isAuthenticated ? (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/login')}`} to="/login">
                Sign in
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/register')}`} to="/register">
                Sign up
              </Link>
            </li>
          </ul>
        ) : (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/', true)}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/editor')}`} to="/editor">
                <i className="ion-compose"></i>&nbsp;New Article
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/settings')}`} to="/settings">
                <i className="ion-gear-a"></i>&nbsp;Settings
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive(`/profile/${user.username}`)}`}
                  to={`/profile/${user.username}`}
                >
                  {user.image && <img src={user.image} className="user-pic" alt="" />}
                  {user.username}
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}
