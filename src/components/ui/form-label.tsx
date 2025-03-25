
import React from 'react';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel: React.FC<FormLabelProps> = ({ children, ...props }) => {
  return (
    <label {...props} className={`text-base mb-2 block ${props.className || ''}`}>
      {children}
    </label>
  );
};

export default FormLabel;