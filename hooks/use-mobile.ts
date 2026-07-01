import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mediaQueryList.addEventListener("change", onStoreChange)

      return () => mediaQueryList.removeEventListener("change", onStoreChange)
    },
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false
  )
}
