import type { Errors } from '../types';

interface ListErrorsProps {
  errors: Errors | null;
}

export function ListErrors({ errors }: ListErrorsProps) {
  if (!errors || !errors.errors) {
    return null;
  }

  const errorList: string[] = [];
  Object.entries(errors.errors).forEach(([key, messages]) => {
    messages.forEach((message) => {
      errorList.push(`${key} ${message}`);
    });
  });

  if (errorList.length === 0) {
    return null;
  }

  return (
    <ul className="error-messages">
      {errorList.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  );
}
