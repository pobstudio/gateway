import { FC } from 'react';

export const ChevronUpIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="16 / chevron-top">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0001 9.62132L4.06077 17.5607L1.93945 15.4393L12.0001 5.37868L22.0608 15.4393L19.9395 17.5607L12.0001 9.62132Z"
          fill="black"
        />
      </g>
    </svg>
  );
};
