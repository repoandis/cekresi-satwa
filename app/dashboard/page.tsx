'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardContent } from '@/components/auth/DashboardContent'

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  )
}
