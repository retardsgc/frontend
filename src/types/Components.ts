// Common component prop types
import React from 'react';

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface InputProps extends BaseComponentProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface SelectProps extends BaseComponentProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

// Navigation types
export interface MenuItem {
  name: string;
  link: string;
  hasSubmenu?: boolean;
  submenu?: MenuItem[];
}

export interface Navigation {
  mainMenu: MenuItem[];
  userActions: {
    search: {
      placeholder: string;
      buttonText: string;
      ariaLabel: string;
    };
    wishlist: {
      text: string;
      ariaLabel: string;
    };
    cart: {
      text: string;
      ariaLabel: string;
      emptyText: string;
    };
    account: {
      text: string;
      ariaLabel: string;
    };
  };
}
