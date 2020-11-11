import { FC } from 'react';

export const MenuIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="16 / menu">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 4.5V7.5H21V4.5H3ZM3 13.5V10.5H21V13.5H3ZM3 19.5V16.5H21V19.5H3Z"
          fill="black"
        />
      </g>
    </svg>
  );
};
