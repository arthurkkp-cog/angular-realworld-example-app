import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../auth/AuthContext';
import { Errors } from '../../types';
import { ListErrors } from '../../components/ListErrors';

interface SettingsFormData {
  image: string;
  username: string;
  bio: string;
  email: string;
  password: string;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [errors, setErrors] = useState<Errors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue } = useForm<SettingsFormData>();

  useEffect(() => {
    if (user) {
      setValue('image', user.image || '');
      setValue('username', user.username || '');
      setValue('bio', user.bio || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    setErrors(null);

    try {
      const updatedUser = await updateUser({
        image: data.image,
        username: data.username,
        bio: data.bio,
        email: data.email,
        ...(data.password ? { password: data.password } : {}),
      });
      navigate(`/profile/${updatedUser.username}`);
    } catch (err) {
      setErrors(err as Errors);
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>

            <ListErrors errors={errors} />

            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting}>
                <fieldset className="form-group">
                  <input
                    {...register('image')}
                    className="form-control"
                    type="text"
                    placeholder="URL of profile picture"
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    {...register('username')}
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Username"
                  />
                </fieldset>

                <fieldset className="form-group">
                  <textarea
                    {...register('bio')}
                    className="form-control form-control-lg"
                    rows={8}
                    placeholder="Short bio about you"
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    {...register('email')}
                    className="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    {...register('password')}
                    className="form-control form-control-lg"
                    type="password"
                    placeholder="New Password"
                  />
                </fieldset>

                <button
                  className="btn btn-lg btn-primary pull-xs-right"
                  type="submit"
                >
                  Update Settings
                </button>
              </fieldset>
            </form>

            <hr />

            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
