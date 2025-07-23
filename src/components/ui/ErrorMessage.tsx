import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'success';
}

const typeClasses = {
  error: {
    container: 'bg-destructive/10 border-destructive text-destructive',
    icon: 'text-destructive',
  },
  success: {
    container: 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-500',
    icon: 'text-green-600 dark:text-green-500',
  },
};

export const ErrorMessage = ({ message, type = 'error' }: ErrorMessageProps) => {
  if (!message) return null;

  const classes = typeClasses[type];
  const Icon = type === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`p-3 mt-4 rounded-md border flex items-center text-sm ${classes.container}`}
      role="alert"
    >
      <Icon className={`h-5 w-5 mr-3 ${classes.icon}`} />
      <span>{message}</span>
    </div>
  );
};