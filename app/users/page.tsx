'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { UserManagement } from '@/components/auth/UserManagement'

export default function UsersPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Manajemen User</h1>
        <p className="text-slate-600">Kelola user dan role sistem</p>
      </div>
      <UserManagement />
    </AppLayout>
  )
}
