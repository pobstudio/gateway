import { FC } from 'react';

export const PauseIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="24 / music / player-pause">
        <path
          id="icon"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H9C10.1046 22 11 21.1046 11 20V4C11 2.89543 10.1046 2 9 2ZM17 2H15C13.8954 2 13 2.89543 13 4V20C13 21.1046 13.8954 22 15 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2ZM7 4V20H9V4H7ZM15 20V4H17V20H15Z"
          fill="black"
        />
      </g>
    </svg>
  );
};

export const PlayIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 3.00005V21C5 21.7912 5.87525 22.2691 6.54076 21.8412L20.5408 12.8412C21.1531 12.4476 21.1531 11.5525 20.5408 11.1589L6.54076 2.15887C5.87525 1.73104 5 2.20888 5 3.00005ZM18.1507 12L7 19.1684V4.83171L18.1507 12Z"
        fill="black"
      />
    </svg>
  );
};
