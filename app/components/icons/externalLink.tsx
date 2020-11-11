import { FC } from 'react';

export const ExternalLinkIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="16 / external-link">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.6689 13.9205L18.7496 6.84099V10.875H21.0001V3H13.1236V5.25H17.1584L10.0776 12.3295L11.6689 13.9205ZM19.8781 18.75V14.25H17.6277V18.75H5.25041V6.375H9.75122V4.125H5.25041C4.00754 4.125 3 5.13236 3 6.375V18.75C3 19.9926 4.00754 21 5.25041 21H17.6277C18.8705 21 19.8781 19.9926 19.8781 18.75Z"
          fill="black"
        />
      </g>
    </svg>
  );
};
