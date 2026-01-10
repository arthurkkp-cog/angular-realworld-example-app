import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Errors } from '../../types';
import { ListErrors } from '../../components/ListErrors';

interface AuthFormData {
  username?: string;
  email: string;
  password: string;
}

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register: registerUser, isAuthenticated } = useAuth();
  const [errors, setErrors] = useState<Errors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = location.pathname === '/login';
  const title = isLogin ? 'Sign in' : 'Sign up';

  const { register, handleSubmit } = useForm<AuthFormData>();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);
    setErrors(null);

    try {
      if (isLogin) {
        await login({ email: data.email, password: data.password });
      } else {
        await registerUser({
          username: data.username!,
          email: data.email,
          password: data.password,
        });
      }
      navigate('/');
    } catch (err) {
      setErrors(err as Errors);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">{title}</h1>
            <p className="text-xs-center">
              {isLogin ? (
                <Link to="/register">Need an account?</Link>
              ) : (
                <Link to="/login">Have an account?</Link>
              )}
            </p>

            <ListErrors errors={errors} />

            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting}>
                {!isLogin && (
                  <fieldset className="form-group">
                    <input
                      {...register('username')}
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Username"
                    />
                  </fieldset>
                )}
                <fieldset className="form-group">
                  <input
                    {...register('email')}
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Email"
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    {...register('password')}
                    className="form-control form-control-lg"
                    type="password"
                    placeholder="Password"
                  />
                </fieldset>
                <button
                  className="btn btn-lg btn-primary pull-xs-right"
                  type="submit"
                >
                  {title}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
