
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check on initial render
    checkIfMobile()
    
    // Set up event listener for resize
    window.addEventListener("resize", checkIfMobile)
    
    // Clean up event listener
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return isMobile
}
