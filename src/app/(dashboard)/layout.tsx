"use client";

import { Suspense } from "react";
import PostLayout from "@/features/posts/layouts/PostLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // useSearchParams (filter ?is_me=1) membutuhkan Suspense boundary saat build.
  return (
    <Suspense fallback={null}>
      <PostLayout>{children}</PostLayout>
    </Suspense>
  );
}
