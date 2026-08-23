'use client';

import { useRouter, usePathname } from 'next/navigation';

export function useSafeRouter() {
  return useRouter();
}

export function useSafePathname() {
  return usePathname();
}
