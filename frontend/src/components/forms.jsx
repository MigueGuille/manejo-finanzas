export const FieldError = ({ message }) => (message ? <p className="mt-1 text-xs font-medium text-rose-600">{message}</p> : null);

export const FormGrid = ({ children }) => <div className="grid gap-4 sm:grid-cols-2">{children}</div>;

