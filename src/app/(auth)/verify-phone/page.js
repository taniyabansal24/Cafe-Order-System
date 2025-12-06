// src/app/(auth)/verify-phone/page.js
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import VerifyPhonePage from './VerifyPhonePage';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading verification page...
      </div>
    }>
      <VerifyPhonePage />
    </Suspense>
  );
}