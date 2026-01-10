import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          conduit
        </Link>

        {!isAuthenticated ? (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/login">
                Sign in
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/register">
                Sign up
              </NavLink>
            </li>
          </ul>
        ) : (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/editor">
                <i className="ion-compose"></i>&nbsp;New Article
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/settings">
                <i className="ion-gear-a"></i>&nbsp;Settings
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to={`/profile/${user.username}`}>
                  {user.image && (
                    <img src={user.image} className="user-pic" alt="" />
                  )}
                  {user.username}
                </NavLink>
              </li>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}
