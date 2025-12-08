// components/WithSearchParams.js
"use client";

import { Suspense } from 'react';

export function withSearchParams(Component) {
  return function WrappedComponent(props) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    );
  };
}