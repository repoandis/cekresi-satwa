'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, BarChart3, Calendar, Download } from 'lucide-react'

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Laporan</h1>
        <p className="text-slate-600">Lihat laporan sistem dan analitik</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Laporan Pengiriman</span>
            </CardTitle>
            <CardDescription>
              Laporan lengkap pengiriman satwa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Bulan ini</span>
              <Download className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Statistik</span>
            </CardTitle>
            <CardDescription>
              Analitik dan statistik sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Real-time</span>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Aktivitas Log</span>
            </CardTitle>
            <CardDescription>
              Log aktivitas pengguna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">7 hari terakhir</span>
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Fitur Laporan</CardTitle>
          <CardDescription>
            Fitur laporan akan segera tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Fitur laporan sedang dalam pengembangan</p>
            <p className="text-sm mt-1">Silakan kembali lagi nanti</p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
