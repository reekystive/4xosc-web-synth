import * as React from 'react';
import { FC, SVGProps } from 'react';

export const TriangleWaveIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1560 804" width={1560} height={804} {...props}>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={64}
      d="M 20 600 L 205 200 L 390 600 L 585 200 L 780 600 L 975 200 L 1170 600 L 1355 200 L 1540 600"
      paintOrder="fill stroke markers"
    />
  </svg>
); 