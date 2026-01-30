'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { Profile } from '@/components/auth/Profile'

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Profil Saya</h1>
        <p className="text-slate-600">Kelola informasi profil Anda</p>
      </div>
      <Profile />
    </AppLayout>
  )
}
