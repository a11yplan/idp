"use client"

import { useState } from "react"
import { useCustomer } from "autumn-js/react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface BillingPortalButtonProps {
  returnUrl?: string
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
  className?: string
  children?: React.ReactNode
}

export function BillingPortalButton({
  returnUrl = "/billing",
  variant = "outline",
  size = "default",
  className,
  children,
}: BillingPortalButtonProps) {
  const { openBillingPortal } = useCustomer()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await openBillingPortal({ returnUrl })
    } catch (error) {
      console.error("Failed to open billing portal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        "Loading..."
      ) : (
        <>
          {children || "Manage Billing"}
          <ExternalLink className="h-4 w-4 ml-2" />
        </>
      )}
    </Button>
  )
}
