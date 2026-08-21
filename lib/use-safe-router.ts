'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useSafeRouter() {
  return useRouter();
}

export function useSafePathname() {
  return usePathname();
}

export function useSafeSearchParams() {
  return useSearchParams();
}
