import { FC } from 'react';

export const CloseIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="16 / x">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0001 14.1213L5.56077 20.5607L3.43945 18.4394L9.87879 12L3.43945 5.56068L5.56077 3.43936L12.0001 9.8787L18.4395 3.43936L20.5608 5.56068L14.1214 12L20.5608 18.4394L18.4395 20.5607L12.0001 14.1213Z"
          fill="black"
        />
      </g>
    </svg>
  );
};
