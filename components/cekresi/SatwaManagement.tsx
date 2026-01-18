'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, MapPin, Calendar, FileText, Upload, Download, Trash2, Route, Plus, Edit, Eye } from 'lucide-react'

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

export function SatwaManagement() {
  const [satwas, setSatwas] = useState<Satwa[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [openSatwa, setOpenSatwa] = useState(false)
  const [openDetailSatwa, setOpenDetailSatwa] = useState(false)
  const [openProgressDialog, setOpenProgressDialog] = useState(false)
  const [openDokumenDialog, setOpenDokumenDialog] = useState(false)

  const [selectedSatwa, setSelectedSatwa] = useState<Satwa | null>(null)
  const [progressList, setProgressList] = useState<Progress[]>([])
  const [dokumenList, setDokumenList] = useState<Dokumen[]>([])
  const [editingSatwa, setEditingSatwa] = useState<Satwa | null>(null)
  const [editingProgress, setEditingProgress] = useState<Progress | null>(null)

  // Form states
  const [satwaForm, setSatwaForm] = useState({
    kodeResi: "",
    nama: "",
    spesies: "",
    asal: "",
    tujuan: "",
    status: "PENDING" as "PENDING" | "IN_TRANSIT" | "COMPLETED",
  })

  const [progressForm, setProgressForm] = useState({
    status: "",
    lokasi: "",
    keterangan: "",
    tanggal: (() => {
      const now = new Date()
      return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    })(),
  })

  const [dokumenForm, setDokumenForm] = useState({
    nama: "",
    file: null as File | null,
  })

  useEffect(() => {
    fetchSatwas()
  }, [])

  const fetchSatwas = async () => {
    try {
      setError(null)
      setFetching(true)
      const res = await fetch("/api/satwas")
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data) {
          setSatwas(data.data)
        } else {
          setError(data.error || "Failed to fetch satwas")
        }
      } else {
        setError("Failed to fetch satwas")
      }
    } catch (error) {
      console.error("Error fetching satwas:", error)
      setError("Error fetching satwas")
    } finally {
      setFetching(false)
    }
  }

  const handleOpenSatwaDialog = (satwa?: Satwa) => {
    if (satwa) {
      setEditingSatwa(satwa)
      setSatwaForm({
        kodeResi: satwa.kode_resi,
        nama: satwa.nama,
        spesies: satwa.spesies,
        asal: satwa.asal,
        tujuan: satwa.tujuan,
        status: satwa.status,
      })
    } else {
      setEditingSatwa(null)
      setSatwaForm({
        kodeResi: "",
        nama: "",
        spesies: "",
        asal: "",
        tujuan: "",
        status: "PENDING",
      })
    }
    setOpenSatwa(true)
  }

  const handleSubmitSatwa = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingSatwa ? `/api/satwas/${editingSatwa.id}` : "/api/satwas"
      const method = editingSatwa ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(satwaForm),
      })

      if (res.ok) {
        setOpenSatwa(false)
        setSatwaForm({
          kodeResi: "",
          nama: "",
          spesies: "",
          asal: "",
          tujuan: "",
          status: "PENDING",
        })
        await fetchSatwas()
      } else {
        const error = await res.json()
        alert(error.error || "Error saving satwa")
      }
    } catch (error) {
      console.error("Error saving satwa:", error)
      alert("Error saving satwa")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSatwa = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus satwa ini?")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/satwas/${id}`, { method: "DELETE" })
      if (res.ok) {
        await fetchSatwas()
      } else {
        alert("Error deleting satwa")
      }
    } catch (error) {
      console.error("Error deleting satwa:", error)
      alert("Error deleting satwa")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (satwaId: string, newStatus: "PENDING" | "IN_TRANSIT" | "COMPLETED") => {
    setLoading(true)
    try {
      console.log('Updating status for satwa:', satwaId, 'to:', newStatus)
      
      const res = await fetch(`/api/satwas/${satwaId}/progress/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      console.log('Response status:', res.status)
      const responseText = await res.text()
      console.log('Response text:', responseText)

      if (res.ok) {
        await fetchSatwas()
        if (selectedSatwa?.id === satwaId) {
          setSelectedSatwa({ ...selectedSatwa, status: newStatus })
        }
      } else {
        try {
          const errorData = JSON.parse(responseText)
          alert(errorData.error || "Error updating status")
        } catch {
          alert(`Error updating status: ${responseText}`)
        }
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Error updating status: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetailSatwa = async (satwa: Satwa) => {
    setSelectedSatwa(satwa)
    setOpenDetailSatwa(true)
    
    try {
      const [progressRes, dokumenRes] = await Promise.all([
        fetch(`/api/satwas/${satwa.id}/progress`),
        fetch(`/api/satwas/${satwa.id}/dokumen`),
      ])

      if (progressRes.ok && dokumenRes.ok) {
        const progressData = await progressRes.json()
        setProgressList(progressData)

        const dokumenData = await dokumenRes.json()
        setDokumenList(dokumenData)
      }
    } catch (error) {
      console.error("Error fetching detail:", error)
    }
  }

  const handleOpenProgressDialog = (progress?: Progress) => {
    if (progress) {
      setEditingProgress(progress)
      const date = new Date(progress.tanggal)
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setProgressForm({
        status: progress.status,
        lokasi: progress.lokasi,
        keterangan: progress.keterangan || "",
        tanggal: localDateTime,
      })
    } else {
      setEditingProgress(null)
      const now = new Date()
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setProgressForm({
        status: "",
        lokasi: "",
        keterangan: "",
        tanggal: localDateTime,
      })
    }
    setOpenProgressDialog(true)
  }

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSatwa) return

    setLoading(true)
    try {
      const url = editingProgress
        ? `/api/satwas/${selectedSatwa.id}/progress/${editingProgress.id}`
        : `/api/satwas/${selectedSatwa.id}/progress`
      const method = editingProgress ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressForm),
      })

      if (res.ok) {
        setOpenProgressDialog(false)
        const progressRes = await fetch(`/api/satwas/${selectedSatwa.id}/progress`)
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          setProgressList(progressData)
        }
        setProgressForm({
          status: "",
          lokasi: "",
          keterangan: "",
          tanggal: new Date().toISOString().split("T")[0],
        })
      } else {
        const error = await res.json()
        alert(error.error || "Error saving progress")
      }
    } catch (error) {
      console.error("Error saving progress:", error)
      alert("Error saving progress")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDokumen = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSatwa || !dokumenForm.file) {
      alert("Pilih file terlebih dahulu")
      return
    }

    setLoading(true)
    try {
      console.log('Uploading dokumen for satwa:', selectedSatwa.id)
      console.log('File details:', {
        name: dokumenForm.file.name,
        size: dokumenForm.file.size,
        type: dokumenForm.file.type
      })

      const formData = new FormData()
      formData.append("file", dokumenForm.file)
      formData.append("nama", dokumenForm.nama)

      const res = await fetch(`/api/satwas/${selectedSatwa.id}/dokumen`, {
        method: "POST",
        body: formData,
      })

      console.log('Upload response status:', res.status)
      const responseText = await res.text()
      console.log('Upload response:', responseText)

      if (res.ok) {
        setOpenDokumenDialog(false)
        setDokumenForm({ nama: "", file: null })
        const dokumenRes = await fetch(`/api/satwas/${selectedSatwa.id}/dokumen`)
        if (dokumenRes.ok) {
          const dokumenData = await dokumenRes.json()
          setDokumenList(dokumenData)
        }
        alert('Dokumen berhasil diupload!')
      } else {
        try {
          const errorData = JSON.parse(responseText)
          alert(errorData.error || "Error uploading dokumen")
        } catch {
          alert(`Error uploading dokumen: ${responseText}`)
        }
      }
    } catch (error) {
      console.error("Error uploading dokumen:", error)
      alert("Error uploading dokumen: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProgress = async (progressId: string) => {
    if (!selectedSatwa || !confirm("Apakah Anda yakin ingin menghapus progress ini?")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/satwas/${selectedSatwa.id}/progress/${progressId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const progressRes = await fetch(`/api/satwas/${selectedSatwa.id}/progress`)
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          setProgressList(progressData)
        }
      } else {
        alert("Error deleting progress")
      }
    } catch (error) {
      console.error("Error deleting progress:", error)
      alert("Error deleting progress")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDokumen = async (dokumenId: string) => {
    if (!selectedSatwa || !confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/satwas/${selectedSatwa.id}/dokumen/${dokumenId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const dokumenRes = await fetch(`/api/satwas/${selectedSatwa.id}/dokumen`)
        if (dokumenRes.ok) {
          const dokumenData = await dokumenRes.json()
          setDokumenList(dokumenData)
        }
      } else {
        alert("Error deleting dokumen")
      }
    } catch (error) {
      console.error("Error deleting dokumen:", error)
      alert("Error deleting dokumen")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Data Satwa</span>
          </CardTitle>
          <Button onClick={() => handleOpenSatwaDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Satwa
          </Button>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : satwas.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Tidak ada data satwa
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Resi</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Spesies</TableHead>
                  <TableHead>Asal</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {satwas.map((satwa) => (
                  <TableRow key={satwa.id}>
                    <TableCell className="font-medium">
                      {satwa.kode_resi}
                    </TableCell>
                    <TableCell>{satwa.nama}</TableCell>
                    <TableCell>{satwa.spesies}</TableCell>
                    <TableCell>{satwa.asal}</TableCell>
                    <TableCell>{satwa.tujuan}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          satwa.status === "COMPLETED"
                            ? "default"
                            : satwa.status === "IN_TRANSIT"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {satwa.status === "COMPLETED"
                          ? "Selesai"
                          : satwa.status === "IN_TRANSIT"
                          ? "Dalam Perjalanan"
                          : "Menunggu"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenDetailSatwa(satwa)}
                          disabled={loading}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenSatwaDialog(satwa)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSatwa(satwa.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* SATWA DIALOG */}
      <Dialog open={openSatwa} onOpenChange={setOpenSatwa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSatwa ? "Edit Satwa" : "Tambah Satwa"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitSatwa}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="kodeResi">Kode Resi *</Label>
                <Input
                  id="kodeResi"
                  value={satwaForm.kodeResi}
                  onChange={(e) =>
                    setSatwaForm({ ...satwaForm, kodeResi: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama *</Label>
                <Input
                  id="nama"
                  value={satwaForm.nama}
                  onChange={(e) =>
                    setSatwaForm({ ...satwaForm, nama: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="spesies">Spesies *</Label>
                <Input
                  id="spesies"
                  value={satwaForm.spesies}
                  onChange={(e) =>
                    setSatwaForm({ ...satwaForm, spesies: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asal">Asal *</Label>
                <Input
                  id="asal"
                  value={satwaForm.asal}
                  onChange={(e) =>
                    setSatwaForm({ ...satwaForm, asal: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tujuan">Tujuan *</Label>
                <Input
                  id="tujuan"
                  value={satwaForm.tujuan}
                  onChange={(e) =>
                    setSatwaForm({ ...satwaForm, tujuan: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={satwaForm.status}
                  onValueChange={(value: "PENDING" | "IN_TRANSIT" | "COMPLETED") =>
                    setSatwaForm({ ...satwaForm, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Menunggu</SelectItem>
                    <SelectItem value="IN_TRANSIT">Dalam Perjalanan</SelectItem>
                    <SelectItem value="COMPLETED">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpenSatwa(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAIL SATWA DIALOG */}
      <Dialog open={openDetailSatwa} onOpenChange={setOpenDetailSatwa}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tracking Progress - {selectedSatwa?.kode_resi}
            </DialogTitle>
          </DialogHeader>

          {selectedSatwa && (
            <div className="space-y-6">
              {/* Info Satwa */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Informasi Satwa</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        selectedSatwa.status === "COMPLETED"
                          ? "default"
                          : selectedSatwa.status === "IN_TRANSIT"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {selectedSatwa.status === "COMPLETED"
                        ? "Selesai"
                        : selectedSatwa.status === "IN_TRANSIT"
                        ? "Dalam Perjalanan"
                        : "Menunggu"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nama</Label>
                    <p className="font-medium">{selectedSatwa.nama}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Spesies</Label>
                    <p className="font-medium">{selectedSatwa.spesies}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Asal</Label>
                    <p className="font-medium">{selectedSatwa.asal}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tujuan</Label>
                    <p className="font-medium">{selectedSatwa.tujuan}</p>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Label className="text-muted-foreground">Update Status Cepat</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant={selectedSatwa.status === "PENDING" ? "default" : "outline"}
                      onClick={() => handleUpdateStatus(selectedSatwa.id, "PENDING")}
                      disabled={loading}
                    >
                      Menunggu
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedSatwa.status === "IN_TRANSIT" ? "default" : "outline"}
                      onClick={() => handleUpdateStatus(selectedSatwa.id, "IN_TRANSIT")}
                      disabled={loading}
                    >
                      Dalam Perjalanan
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedSatwa.status === "COMPLETED" ? "default" : "outline"}
                      onClick={() => handleUpdateStatus(selectedSatwa.id, "COMPLETED")}
                      disabled={loading}
                    >
                      Selesai
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Timeline */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Progress Perjalanan
                  </CardTitle>
                  <Button onClick={() => handleOpenProgressDialog()} size="sm">
                    + Tambah Progress
                  </Button>
                </CardHeader>
                <CardContent>
                  {progressList.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Belum ada progress perjalanan
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {progressList.map((progress, index) => (
                        <div key={progress.id} className="relative pl-8 pb-4 border-l-2 border-primary">
                          {index < progressList.length - 1 && (
                            <div className="absolute left-[-1px] top-4 bottom-0 w-px bg-primary" />
                          )}
                          <div className="absolute left-[-10px] top-0 h-4 w-4 rounded-full bg-primary border-2 border-background" />
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="default">{progress.status}</Badge>
                                <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {progress.lokasi}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground inline-flex items-center gap-1 mb-2">
                                <Calendar className="h-3 w-3 shrink-0" />
                                {new Date(progress.tanggal).toLocaleString("id-ID")}
                              </p>
                              {progress.keterangan && (
                                <p className="text-sm">{progress.keterangan}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenProgressDialog(progress)}
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteProgress(progress.id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dokumen */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Dokumen Pendukung
                  </CardTitle>
                  <Button onClick={() => setOpenDokumenDialog(true)} size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Dokumen
                  </Button>
                </CardHeader>
                <CardContent>
                  {dokumenList.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Belum ada dokumen
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dokumenList.map((dokumen) => (
                        <div
                          key={dokumen.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{dokumen.nama}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(dokumen.uploaded_at).toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(dokumen.file_url, "_blank")}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteDokumen(dokumen.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PROGRESS DIALOG */}
      <Dialog open={openProgressDialog} onOpenChange={setOpenProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProgress ? "Edit Progress" : "Tambah Progress"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitProgress}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Input
                  id="status"
                  value={progressForm.status}
                  onChange={(e) =>
                    setProgressForm({ ...progressForm, status: e.target.value })
                  }
                  placeholder="Contoh: Diterima, Dalam Perjalanan, Tiba di Tujuan"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lokasi">Lokasi *</Label>
                <Input
                  id="lokasi"
                  value={progressForm.lokasi}
                  onChange={(e) =>
                    setProgressForm({ ...progressForm, lokasi: e.target.value })
                  }
                  placeholder="Contoh: Bandara Soekarno-Hatta"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tanggal">Tanggal *</Label>
                <Input
                  id="tanggal"
                  type="datetime-local"
                  value={progressForm.tanggal}
                  onChange={(e) =>
                    setProgressForm({ ...progressForm, tanggal: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={progressForm.keterangan}
                  onChange={(e) =>
                    setProgressForm({ ...progressForm, keterangan: e.target.value })
                  }
                  placeholder="Keterangan tambahan..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpenProgressDialog(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DOKUMEN DIALOG */}
      <Dialog open={openDokumenDialog} onOpenChange={setOpenDokumenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Dokumen Pendukung</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitDokumen}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dokumenNama">Nama Dokumen *</Label>
                <Input
                  id="dokumenNama"
                  value={dokumenForm.nama}
                  onChange={(e) =>
                    setDokumenForm({ ...dokumenForm, nama: e.target.value })
                  }
                  placeholder="Contoh: Surat Izin Transportasi"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dokumenFile">File *</Label>
                <Input
                  id="dokumenFile"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setDokumenForm({ ...dokumenForm, file })
                    }
                  }}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setOpenDokumenDialog(false)
                  setDokumenForm({ nama: "", file: null })
                }}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Mengupload..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
