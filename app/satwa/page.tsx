'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import SatwaManagement from '@/components/cekresi/SatwaManagement'

export default function SatwaPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Manajemen Satwa</h1>
        <p className="text-slate-600">Kelola data satwa dan tracking pengiriman</p>
      </div>
      <SatwaManagement />
    </AppLayout>
  )
}
