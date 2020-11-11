import { FC } from 'react';

export const ClutterIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="24 / grid / grid-small">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20 2H4C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V4C22 2.89543 21.1046 2 20 2ZM4 20V16H8V20H4ZM10 20H14V16H10V20ZM10 14H14V10H10V14ZM10 8H14V4H10V8ZM8 4V8H4V4H8ZM8 10V14H4V10H8ZM16 20V16H20V20H16ZM16 10V14H20V10H16ZM20 8H16V4H20V8Z"
          fill="black"
        />
      </g>
    </svg>
  );
};

export const DeclutterIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="24 / grid / grid-row-2">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20 2H4C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V4C22 2.89543 21.1046 2 20 2ZM4 20V4H20V20H4Z"
          fill="black"
        />
      </g>
    </svg>
  );
};
