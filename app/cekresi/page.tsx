'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { ResiSearch } from '@/components/cekresi/ResiSearch'

export default function CekResiPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cek Resi</h1>
        <p className="text-slate-600">Lacak status pengiriman satwa Anda</p>
      </div>
      <ResiSearch showAllResiTab={true} />
    </AppLayout>
  )
}
