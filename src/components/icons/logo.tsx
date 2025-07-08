import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c-2 0-4-2-4-4 0-2 2-4 4-4s4 2 4 4c0 2-2 4-4 4z" />
      <path d="M12 2c-2 0-4 2-4 4v.2" />
      <path d="M12 10v-6" />
      <path d="M14 4.8c1.3 2.6 1.3 5.2 0 7.8" />
      <path d="M10 4.8c-1.3 2.6-1.3 5.2 0 7.8" />
      <path d="M17 10c1.7-.8 3-2.5 3-4.5 0-2-1.3-3.8-3-4.5" />
      <path d="M7 10c-1.7-.8-3-2.5-3-4.5 0-2 1.3-3.8 3-4.5" />
    </svg>
  );
}
