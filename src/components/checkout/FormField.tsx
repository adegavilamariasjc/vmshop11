
import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, required = false, children }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
        {label} {required && '*'}
      </label>
      {children}
    </div>
  );
};

export default FormField;
