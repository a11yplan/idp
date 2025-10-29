"use client"


import { useCustomer } from "autumn-js/react"
import { useActiveOrganizationId } from "@/contexts/organization-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BillingPortalButton } from "@/components/billing/billing-portal-button"
import { UsageDisplay } from "@/components/billing/usage-display"
import { CreditCard, Calendar, TrendingUp, Building2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"


export const dynamic = 'force-dynamic'
export default function BillingPage() {
  const activeOrgId = useActiveOrganizationId()

  // Autumn automatically scopes billing to the active organization via better-auth integration
  const { customer } = useCustomer({
    expand: ["invoices", "payment_method"],
  })

  // Determine billing context
  const billingContext = activeOrgId ? "organization" : "personal"

  // Get active products from real customer data
  const activeProducts = customer?.products?.filter((p: any) => p.status === "active") || []
  const currentPlan = activeProducts[0]
  const hasPaymentMethod = customer?.payment_method !== null

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {billingContext === "organization" ? "Organization " : ""}Billing & Usage
          </h1>
          <p className="text-muted-foreground mt-1">
            {billingContext === "organization"
              ? "Manage organization subscription and view usage statistics"
              : "Manage your personal subscription and view usage statistics"}
          </p>
          {billingContext === "personal" && (
            <Alert className="mt-4">
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                You are viewing personal billing. To manage organization billing,
                <Link href="/organizations" className="ml-1 underline">
                  select an organization
                </Link>.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <BillingPortalButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              {currentPlan && (
                <Badge variant="default">{currentPlan.id}</Badge>
              )}
            </div>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            {currentPlan ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plan</p>
                  <p className="text-2xl font-bold capitalize">
                    {currentPlan.name || currentPlan.id}
                  </p>
                </div>
                {currentPlan.status && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={currentPlan.status === "active" ? "default" : "secondary"}>
                      {currentPlan.status}
                    </Badge>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full">
                      View All Plans
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  No active subscription
                </p>
                <Link href="/pricing">
                  <Button>Choose a Plan</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </CardHeader>
          <CardContent>
            {hasPaymentMethod ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Payment method on file</span>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/billing">Update Payment Method</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  No payment method configured
                </p>
                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Usage Overview
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UsageDisplay
            featureId="messages"
            featureName="Messages"
            unit="messages"
          />
          <UsageDisplay
            featureId="storage"
            featureName="Storage"
            unit="GB"
          />
          <UsageDisplay
            featureId="api_calls"
            featureName="API Calls"
            unit="calls"
          />
        </div>
      </div>
    </div>
  )
}
