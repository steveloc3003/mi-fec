import { ChangeEvent, SelectHTMLAttributes, forwardRef } from 'react';

import styles from './select.module.css';

type Option = {
  label: string;
  value: string | number;
};

type BaseProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'multiple'> & {
  options: Option[];
  className?: string;
  onBlur?: () => void;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value: string | number;
  onChange: (value: string | number) => void;
};

type MultiProps = BaseProps & {
  multiple: true;
  value: Array<string | number>;
  onChange: (value: Array<string | number>) => void;
};

type SelectProps = SingleProps | MultiProps;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  if ('multiple' in props && props.multiple) {
    const { options, className, value, onChange, onBlur, multiple, ...rest } = props;
    const mergedClassName = className ? `${styles.select} ${className}` : styles.select;
    const current = Array.isArray(value) ? value.map(String) : value !== undefined && value !== null ? [String(value)] : [];

    const handleMultiChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const selected = Array.from(event.target.selectedOptions).map((opt) => opt.value);
      onChange(selected);
    };

    return (
      <select ref={ref} className={mergedClassName} multiple value={current} onChange={handleMultiChange} onBlur={onBlur} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const { options, className, onBlur, onChange, value, multiple, ...rest } = props as SingleProps;
  const mergedClassName = className ? `${styles.select} ${className}` : styles.select;

  // Default to first option when value is undefined/null to avoid empty select
  const normalizedValue = value === null || value === undefined ? (options.length > 0 ? String(options[0].value) : '') : String(value);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select ref={ref} className={mergedClassName} value={normalizedValue} onChange={handleChange} onBlur={onBlur} {...rest}>
      {options.map((option) => (
        <option key={option.value} value={String(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
  );
});
