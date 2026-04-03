import { Suspense } from "react";
import { HomePage } from "./_components/HomePage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <HomePage />
    </Suspense>
  );
}
