import type { ButtonHTMLAttributes } from 'react';

import styles from './button.module.css';

type ButtonProps = {
  primary?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ primary, ...props }: ButtonProps) => {
  let className = styles.button;

  if (primary) className += ` ${styles.primary}`;

  return <button className={className} {...props} />;
};
