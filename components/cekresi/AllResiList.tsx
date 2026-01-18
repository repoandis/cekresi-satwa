'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, Calendar, MapPin, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

interface Satwa {
  id: string
  kode_resi: string
  nama: string
  spesies: string
  asal: string
  tujuan: string
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED"
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface ApiResponse {
  success: boolean
  data: Satwa[]
  pagination: Pagination
  error?: string
}

interface AllResiListProps {
  onViewDetail?: (satwa: Satwa) => void
}

export function AllResiList({ onViewDetail }: AllResiListProps) {
  const [resiList, setResiList] = useState<Satwa[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [limit, setLimit] = useState('10')

  useEffect(() => {
    fetchResi()
  }, [searchTerm, statusFilter, limit, pagination.page])

  const fetchResi = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      })

      const res = await fetch(`/api/resi/all?${params}`)
      const data: ApiResponse = await res.json()

      if (res.ok && data.success) {
        setResiList(data.data)
        setPagination(data.pagination)
      } else {
        setError(data.error || 'Failed to fetch resi')
      }
    } catch (error) {
      console.error('Error fetching resi:', error)
      setError('Error fetching resi')
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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === 'all' ? '' : status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleLimitChange = (newLimit: string) => {
    setLimit(newLimit)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleViewDetail = (satwa: Satwa) => {
    console.log('🔍 handleViewDetail called for:', satwa.kode_resi)
    
    // Use callback if provided, otherwise fallback to navigation
    if (onViewDetail) {
      onViewDetail(satwa)
    } else {
      // Fallback: Navigate to detail view
      window.location.href = `/dashboard?tab=resi&search=${satwa.kode_resi}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Semua Resi</span>
          </CardTitle>
          <CardDescription>
            Lihat semua data resi yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <Label htmlFor="search">Cari Resi</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Cari kode resi, nama, atau spesies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter === 'all' ? '' : statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="IN_TRANSIT">Dalam Perjalanan</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="limit">Tampilkan</Label>
              <Select value={limit} onValueChange={handleLimitChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Menampilkan {resiList.length} dari {pagination.total} resi
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-8 text-center text-muted-foreground">
              Loading...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="py-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Data Table */}
          {!loading && !error && (
            <>
              {resiList.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  {searchTerm || statusFilter
                    ? 'Tidak ada resi yang cocok dengan filter'
                    : 'Belum ada data resi'
                  }
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode Resi</TableHead>
                        <TableHead>Nama Satwa</TableHead>
                        <TableHead>Spesies</TableHead>
                        <TableHead>Asal</TableHead>
                        <TableHead>Tujuan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resiList.map((resi: Satwa) => (
                        <TableRow key={resi.id}>
                          <TableCell className="font-medium">
                            {resi.kode_resi}
                          </TableCell>
                          <TableCell>{resi.nama}</TableCell>
                          <TableCell>{resi.spesies}</TableCell>
                          <TableCell>{resi.asal}</TableCell>
                          <TableCell>{resi.tujuan}</TableCell>
                          <TableCell>
                            {getStatusBadge(resi.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(resi.created_at).toLocaleDateString('id-ID')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetail(resi)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Halaman {pagination.page} dari {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
