"use client"

import { useCustomer } from "autumn-js/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'

interface UsageDisplayProps {
  featureId: string
  featureName: string
  unit?: string
}

export function UsageDisplay({ featureId, featureName, unit = "units" }: UsageDisplayProps) {
  const { customer } = useCustomer()

  const feature = customer?.features?.[featureId]
  const balance = feature?.balance ?? 0
  const usageLimit = feature?.usage_limit ?? 0
  const used = usageLimit > 0 ? usageLimit - balance : 0
  const percentage = usageLimit > 0 ? (used / usageLimit) * 100 : 0

  if (!feature) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{featureName}</CardTitle>
          <CardDescription>No usage data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isUnlimited = feature?.unlimited || usageLimit === -1 || usageLimit === Infinity
  const isWarning = percentage >= 80 && percentage < 100
  const isExceeded = percentage >= 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{featureName}</CardTitle>
          {isUnlimited ? (
            <Badge variant="secondary">Unlimited</Badge>
          ) : isExceeded ? (
            <Badge variant="destructive">Limit Reached</Badge>
          ) : isWarning ? (
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
              Low Balance
            </Badge>
          ) : null}
        </div>
        <CardDescription>
          {isUnlimited
            ? "Unlimited " + unit
            : used + " / " + usageLimit + " " + unit + " used"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isUnlimited && (
          <div className="space-y-2">
            <Progress value={Math.min(percentage, 100)} />
            <p className="text-sm text-muted-foreground">
              {balance} {unit} remaining
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
