import { useNavigate } from "@tanstack/react-router"
import { Button } from '../ui/button'
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  to: string
  label?: string
}

export function BackButton({ to, label = "Back" }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate({ to })}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
