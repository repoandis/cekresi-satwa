'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, LogOut, Shield, Users, Settings, FileText, Package, Home, Search, BarChart3, Bell, UserCircle, Calendar } from 'lucide-react'
import { UserManagement } from './UserManagement'
import { Profile } from './Profile'
import { SatwaManagement } from '@/components/cekresi/SatwaManagement'
import { ResiSearch } from '@/components/cekresi/ResiSearch'

export function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchKode, setSearchKode] = useState('')

  const handleLogout = () => {
    logout()
  }

  const renderContent = () => {
    if (user?.role !== 'admin') {
      // User Dashboard
      switch (activeTab) {
        case 'resi':
          return <ResiSearch 
            showAllResiTab={true} 
            searchKode={searchKode}
            onResiDetail={(satwa) => {
              console.log('Dashboard received detail request:', satwa.kode_resi)
              setSearchKode(satwa.kode_resi)
            }} />
        case 'profile':
          return <Profile />
        default:
          return (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Selamat Datang, {user?.username}!</h2>
                <p className="text-blue-100">Sistem pelacakan pengiriman satwa yang terpercaya</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm" onClick={() => router.push('/cekresi')}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Search className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">Cek Resi</h3>
                        <p className="text-sm text-slate-600 mt-1">Lacak status pengiriman satwa</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm" onClick={() => router.push('/profile')}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <User className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">Profil Saya</h3>
                        <p className="text-sm text-slate-600 mt-1">Lihat dan edit profil</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Aktivitas Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Belum ada aktivitas terakhir</p>
                    <p className="text-sm mt-1">Mulai lacak pengiriman Anda</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
      }
    }

    // Admin Dashboard with tabs
    switch (activeTab) {
      case 'users':
        return <UserManagement />
      case 'satwa':
        return <SatwaManagement />
      case 'reports':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Laporan</span>
              </CardTitle>
              <CardDescription>
                Lihat laporan sistem dan analitik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Fitur laporan akan segera tersedia
              </div>
            </CardContent>
          </Card>
        )
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Selamat Datang, Admin {user?.username}!</h2>
                  <p className="text-purple-100">Kelola sistem pelacakan pengiriman satwa</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-slate-900">0</p>
                      <p className="text-sm text-slate-600">Total Satwa</p>
                      <p className="text-xs text-green-600 mt-1">+0% bulan ini</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-slate-900">0</p>
                      <p className="text-sm text-slate-600">Total User</p>
                      <p className="text-xs text-green-600 mt-1">+0% bulan ini</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-slate-900">0</p>
                      <p className="text-sm text-slate-600">Laporan</p>
                      <p className="text-xs text-green-600 mt-1">+0% bulan ini</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-slate-900">0</p>
                      <p className="text-sm text-slate-600">Dokumen</p>
                      <p className="text-xs text-green-600 mt-1">+0% bulan ini</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm" onClick={() => router.push('/satwa')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">Manajemen Satwa</h3>
                      <p className="text-sm text-slate-600 mt-1">Kelola data satwa dan tracking</p>
                      <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                        <span>Kelola</span>
                        <div className="ml-1 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm" onClick={() => router.push('/users')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">Manajemen User</h3>
                      <p className="text-sm text-slate-600 mt-1">Kelola user dan role</p>
                      <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
                        <span>Kelola</span>
                        <div className="ml-1 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-xs">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm" onClick={() => router.push('/reports')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">Laporan</h3>
                      <p className="text-sm text-slate-600 mt-1">Lihat laporan sistem</p>
                      <div className="mt-3 flex items-center text-purple-600 text-sm font-medium">
                        <span>Lihat</span>
                        <div className="ml-1 w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-xs">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-slate-900">Aktivitas Terakhir</span>
                    <p className="text-sm text-slate-600 font-normal mt-1">Aktivitas sistem terkini</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-medium">Belum ada aktivitas terakhir</p>
                  <p className="text-sm text-slate-400 mt-1">Aktivitas sistem akan muncul di sini</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0 bottom-0 overflow-y-auto">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">CekResi Satwa</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {user?.role === 'admin' ? (
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'overview'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => router.push('/satwa')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'satwa'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span>Data Satwa</span>
                </button>
                <button
                  onClick={() => router.push('/users')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'users'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Manajemen User</span>
                </button>
                <button
                  onClick={() => router.push('/reports')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'reports'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Laporan</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'overview'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => router.push('/cekresi')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'resi'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Search className="h-5 w-5" />
                  <span>Cek Resi</span>
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <UserCircle className="h-5 w-5" />
                  <span>Profil Saya</span>
                </button>
              </>
            )}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
