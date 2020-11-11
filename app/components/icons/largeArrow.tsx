import styled from 'styled-components';

interface LargeArrowProps {
  className?: string;
  percentFill?: number;
}

export const LargeDownArrow: React.FC<LargeArrowProps> = ({
  className,
  percentFill,
}) => {
  return (
    <svg
      className={className}
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M43.75 66.1612V12.5H56.25V66.1612L76.8306 45.5806L85.6694 54.4194L50 90.0888L14.3306 54.4194L23.1694 45.5806L43.75 66.1612V66.1612Z"
        fill="black"
      />
    </svg>
  );
};

export const LargeLeftArrow: React.FC<LargeArrowProps> = ({
  className,
  percentFill,
}) => {
  return (
    <svg
      className={className}
      width="78"
      height="72"
      viewBox="0 0 78 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="cut-off-left-arrow">
          <rect x="0" y="0" width={72 * (percentFill ?? 1) + 4} height="72" />
        </clipPath>
      </defs>
      <path
        clipPath="url(#cut-off-left-arrow)"
        d="M23.4248 28.3358L20.0106 31.75H24.839H76.5002V40.25H24.839H20.0106L23.4248 43.6642L42.5912 62.8306L36.5808 68.841L3.73981 36L36.5808 3.15901L42.5912 9.16942L23.4248 28.3358Z"
        fill="black"
      />
      <path
        d="M23.4248 28.3358L20.0106 31.75H24.839H76.5002V40.25H24.839H20.0106L23.4248 43.6642L42.5912 62.8306L36.5808 68.841L3.73981 36L36.5808 3.15901L42.5912 9.16942L23.4248 28.3358Z"
        stroke="black"
        strokeWidth="1"
      />
    </svg>
  );
};

export const LargeRightArrow: React.FC<LargeArrowProps> = ({
  className,
  percentFill,
}) => {
  return (
    <svg
      className={className}
      width="78"
      height="72"
      viewBox="0 0 78 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="cut-off-right-arrow">
          <rect
            x={78 - (72 * (percentFill ?? 1) + 4)}
            y="0"
            width="78"
            height="72"
          />
        </clipPath>
      </defs>
      <path
        clipPath="url(#cut-off-right-arrow)"
        d="M55.0754 43.6642L58.4896 40.25H53.6612H2.00003V31.75H53.6612H58.4896L55.0754 28.3358L35.909 9.16941L41.9194 3.159L74.7604 36L41.9194 68.841L35.909 62.8306L55.0754 43.6642Z"
        fill="black"
      />
      <path
        d="M55.0754 43.6642L58.4896 40.25H53.6612H2.00003V31.75H53.6612H58.4896L55.0754 28.3358L35.909 9.16941L41.9194 3.159L74.7604 36L41.9194 68.841L35.909 62.8306L55.0754 43.6642Z"
        stroke="black"
        strokeWidth="1"
      />
    </svg>
  );
};
