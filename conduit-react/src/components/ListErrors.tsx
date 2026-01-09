import { Errors } from '../types';

interface ListErrorsProps {
  errors: Errors | null;
}

export function ListErrors({ errors }: ListErrorsProps) {
  if (!errors || !errors.errors) {
    return null;
  }

  const errorList = Object.keys(errors.errors).map(
    (key) => `${key} ${errors.errors[key]}`
  );

  return (
    <ul className="error-messages">
      {errorList.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  );
}
