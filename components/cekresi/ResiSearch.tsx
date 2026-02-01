'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, Package, MapPin, Calendar, AlertCircle, List, X, FileText, Download } from 'lucide-react'
import { AllResiList } from './AllResiList'

interface Satwa {
  id: string
  kode_resi: string
  nama: string
  spesies: string
  asal: string
  tujuan: string
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED"
  created_at?: string
  updated_at?: string
}

interface Progress {
  id: string
  satwa_id: string
  status: string
  lokasi: string
  keterangan: string | null
  tanggal: string
  created_at: string
}

interface Dokumen {
  id: string
  satwa_id: string
  nama: string
  file_url: string
  uploaded_at: string
}

interface ResiSearchProps {
  showAllResiTab?: boolean
  onResiDetail?: (satwa: Satwa) => void
  searchKode?: string
}

export function ResiSearch({ showAllResiTab = false, onResiDetail, searchKode: propSearchKode }: ResiSearchProps) {
  const { toast } = useToast()
  const [searchKode, setSearchKode] = useState(propSearchKode || '')
  const [searchResult, setSearchResult] = useState<Satwa | null>(null)
  const [progressList, setProgressList] = useState<Progress[]>([])
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'all'>('search')

  // Sync searchKode when prop changes
  useEffect(() => {
    if (propSearchKode && propSearchKode !== searchKode) {
      setSearchKode(propSearchKode)
      // Switch to search tab and trigger search
      setActiveTab('search')
      setTimeout(() => {
        const form = document.getElementById('resi-search-form') as HTMLFormElement
        if (form) {
          form.dispatchEvent(new Event('submit'))
        }
      }, 100)
    }
  }, [propSearchKode])

  const handleResiDetail = (satwa: Satwa) => {
    console.log('📥 ResiSearch received detail request:', satwa.kode_resi)
    
    // Switch to search tab and set search term
    setActiveTab('search')
    setSearchKode(satwa.kode_resi)
    
    // Trigger search automatically
    setTimeout(() => {
      console.log('🔍 Triggering automatic search for:', satwa.kode_resi)
      const form = document.getElementById('resi-search-form') as HTMLFormElement
      if (form) {
        form.dispatchEvent(new Event('submit'))
      } else {
        console.error('❌ Form not found with id "resi-search-form"')
      }
    }, 100)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchKode.trim()) return

    setLoading(true)
    setError('')
    setSearchResult(null)
    setProgressList([])
    setDokumenList([])

    try {
      const res = await fetch(`/api/resi?kode_resi=${searchKode.trim()}`)
      const data = await res.json()

      if (res.ok && data.success) {
        setSearchResult(data.data)
        
        // Add to search history
        if (!searchHistory.includes(searchKode.trim())) {
          setSearchHistory(prev => [searchKode.trim(), ...prev.slice(0, 4)])
        }

        // Fetch progress
        const progressRes = await fetch(`/api/satwas/${data.data.id}/progress`)
        if (progressRes.ok) {
          const progressResponse = await progressRes.json()
          const progressData = progressResponse.data || progressResponse
          setProgressList(Array.isArray(progressData) ? progressData : [])
        }

        // Fetch documents
        const dokumenRes = await fetch(`/api/satwas/${data.data.id}/dokumen`)
        if (dokumenRes.ok) {
          const dokumenResponse = await dokumenRes.json()
          const dokumenData = dokumenResponse.data || dokumenResponse
          setDokumenList(Array.isArray(dokumenData) ? dokumenData : [])
        }

        toast({
          title: "Success",
          description: `Resi ${searchKode.trim()} ditemukan`,
        })
      } else {
        setError(data.error || 'Kode resi tidak ditemukan')
        toast({
          title: "Error",
          description: data.error || 'Kode resi tidak ditemukan',
          variant: "destructive",
        })
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      toast({
        title: "Error",
        description: 'Terjadi kesalahan. Silakan coba lagi.',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">Selesai</Badge>
      case "IN_TRANSIT":
        return <Badge variant="secondary">Dalam Perjalanan</Badge>
      case "PENDING":
        return <Badge variant="outline">Menunggu</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      {showAllResiTab && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Cek Resi</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Semua Resi</span>
            </button>
          </nav>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'search' ? (
        <>
          {/* Search Form */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-xl font-bold text-slate-900">Cek Resi Satwa</span>
                  <p className="text-sm text-slate-600 font-normal mt-1">Masukkan kode resi untuk melacak status pengiriman satwa</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSearch} className="space-y-6" id="resi-search-form">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="kodeResi" className="text-sm font-medium text-slate-700">Kode Resi</Label>
                    <Input
                      id="kodeResi"
                      type="text"
                      placeholder="Masukkan kode resi..."
                      value={searchKode}
                      onChange={(e) => setSearchKode(e.target.value)}
                      className="mt-1 h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Mencari...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4" />
                          <span>Cari</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-slate-700">Pencarian Terakhir:</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {searchHistory.map((kode, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchKode(kode)}
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                        >
                          {kode}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50 border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 text-red-700">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Terjadi Kesalahan</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Result */}
          {searchResult && (
            <div className="space-y-6">
              {/* Satwa Info */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-slate-900">Informasi Satwa</span>
                      <p className="text-sm text-slate-600 font-normal mt-1">
                        Detail pengiriman untuk kode resi: <strong className="text-blue-600">{searchResult.kode_resi}</strong>
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-slate-700">Nama Satwa</Label>
                      <p className="font-semibold text-slate-900 text-base">{searchResult.nama}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-slate-700">Spesies</Label>
                      <p className="font-semibold text-slate-900 text-base">{searchResult.spesies}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-slate-700">Asal</Label>
                      <p className="font-semibold text-slate-900 text-base">{searchResult.asal}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-slate-700">Tujuan</Label>
                      <p className="font-semibold text-slate-900 text-base">{searchResult.tujuan}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-slate-700">Status</Label>
                      <div className="mt-2">
                        {getStatusBadge(searchResult.status)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-slate-700">Tanggal Dibuat</Label>
                      <p className="font-semibold text-slate-900 text-base">
                        {searchResult.created_at 
                          ? new Date(searchResult.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : '-'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Timeline */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-slate-900">Riwayat Perjalanan</span>
                      <p className="text-sm text-slate-600 font-normal mt-1">Timeline progress pengiriman satwa</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {progressList.length === 0 ? (
                    <div className="py-12 text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-500 font-medium">Belum ada riwayat perjalanan</p>
                      <p className="text-sm text-slate-400 mt-1">Progress akan muncul di sini ketika tersedia</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {progressList.map((progress, index) => (
                        <div key={progress.id} className="relative pl-8 pb-6 border-l-2 border-blue-200">
                          {index < progressList.length - 1 && (
                            <div className="absolute left-[-1px] top-4 bottom-0 w-px bg-blue-200" />
                          )}
                          <div className="absolute left-[-10px] top-0 h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">{progress.status}</Badge>
                              <span className="text-sm text-slate-600 inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {progress.lokasi}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3">
                              <Calendar className="h-3 w-3 shrink-0" />
                              {new Date(progress.tanggal).toLocaleString("id-ID", {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {progress.keterangan && (
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-700">{progress.keterangan}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents Section */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-slate-900">Dokumen Terkait</span>
                      <p className="text-sm text-slate-600 font-normal mt-1">Dokumen yang diunggah admin untuk pengiriman ini</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {dokumenList.length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-500 font-medium">Belum ada dokumen yang diunggah</p>
                      <p className="text-sm text-slate-400 mt-1">Dokumen akan muncul di sini ketika admin mengunggah</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dokumenList.map((dokumen) => (
                        <div key={dokumen.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{dokumen.nama}</p>
                              <p className="text-sm text-slate-500">
                                Diunggah: {new Date(dokumen.uploaded_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(dokumen.file_url, '_blank')}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Unduh
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary Table */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-slate-900">Ringkasan Pengiriman</span>
                      <p className="text-sm text-slate-600 font-normal mt-1">Informasi lengkap status pengiriman</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-200">
                          <TableHead className="text-slate-700 font-semibold">Kode Resi</TableHead>
                          <TableHead className="text-slate-700 font-semibold">Nama Satwa</TableHead>
                          <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                          <TableHead className="text-slate-700 font-semibold">Progress Terakhir</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-b border-slate-100">
                          <TableCell className="font-medium text-slate-900">{searchResult.kode_resi}</TableCell>
                          <TableCell className="text-slate-700">{searchResult.nama}</TableCell>
                          <TableCell>{getStatusBadge(searchResult.status)}</TableCell>
                          <TableCell>
                            {progressList.length > 0 ? (
                              <div>
                                <div className="font-medium text-slate-900">{progressList[progressList.length - 1].status}</div>
                                <div className="text-sm text-slate-500">
                                  {progressList[progressList.length - 1].lokasi}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500">Belum ada progress</span>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      ) : (
        <>
          {activeTab === 'all' ? (
            <AllResiList onViewDetail={handleResiDetail} />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Loading...
            </div>
          )}
        </>
      )}
    </div>
  )
}
