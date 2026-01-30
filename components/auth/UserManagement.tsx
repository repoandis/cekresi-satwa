'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Plus, Edit, Trash2, Loader2, Users, Shield, User as UserIcon } from 'lucide-react'

interface User {
  id: string
  username: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

// API functions for user management
const userAPI = {
  getAll: async () => {
    const response = await fetch('/api/users')
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },
  
  create: async (userData: { username: string; password: string; role: string }) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    if (!response.ok) throw new Error('Failed to create user')
    return response.json()
  },
  
  updatePassword: async (userId: string, password: string) => {
    const response = await fetch(`/api/users/${userId}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    if (!response.ok) throw new Error('Failed to update password')
    return response.json()
  },
  
  updateRole: async (userId: string, role: string) => {
    const response = await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    })
    if (!response.ok) throw new Error('Failed to update role')
    return response.json()
  },
  
  delete: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete user')
    return response.json()
  }
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form states
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user')
  const [isCreateLoading, setIsCreateLoading] = useState(false)
  
  // Edit states
  const [editUserId, setEditUserId] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user')
  const [isEditLoading, setIsEditLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const result = await userAPI.getAll()
      if (result.users) {
        setUsers(result.users)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Gagal memuat data user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsCreateLoading(true)

    try {
      const result = await userAPI.create({ username: newUsername, password: newPassword, role: newRole })
      if (result.user) {
        setSuccess(`User ${newUsername} berhasil dibuat!`)
        setNewUsername('')
        setNewPassword('')
        setNewRole('user')
        loadUsers()
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Gagal membuat user')
    } finally {
      setIsCreateLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsEditLoading(true)

    try {
      const user = users.find(u => u.id === editUserId)
      if (!user) return

      // Update password if provided
      if (editPassword) {
        const passwordResult = await userAPI.updatePassword(editUserId, editPassword)
        if (passwordResult.error) {
          setError(passwordResult.error)
          return
        }
      }

      // Update role if changed
      if (editRole !== user.role) {
        const roleResult = await userAPI.updateRole(editUserId, editRole)
        if (roleResult.error) {
          setError(roleResult.error)
          return
        }
      }

      setSuccess(`User ${user.username} berhasil diperbarui!`)
      setEditPassword('')
      loadUsers()
    } catch (err) {
      setError('Gagal mengupdate user')
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${username}"?`)) {
      return
    }

    try {
      const result = await userAPI.delete(userId)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`User ${username} berhasil dihapus!`)
        loadUsers()
      }
    } catch (err) {
      setError('Gagal menghapus user')
    }
  }

  const openEditDialog = (user: User) => {
    setEditUserId(user.id)
    setEditPassword('')
    setEditRole(user.role)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Manajemen User</span>
          </CardTitle>
          <CardDescription>
            Tambah, edit, dan hapus user sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Create User Form */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Tambah User Baru</h3>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="new-username">Username</Label>
                <Input
                  id="new-username"
                  type="text"
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  disabled={isCreateLoading}
                />
              </div>
              <div>
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isCreateLoading}
                />
              </div>
              <div>
                <Label htmlFor="new-role">Role</Label>
                <Select value={newRole} onValueChange={(value: 'admin' | 'user') => setNewRole(value)} disabled={isCreateLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isCreateLoading} className="w-full">
                  {isCreateLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menambah...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm mb-4">
              {success}
            </div>
          )}

          {/* Users Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Daftar User</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Diupdate</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      Belum ada user
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? (
                            <>
                              <Shield className="inline h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <UserIcon className="inline h-3 w-3 mr-1" />
                              User
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{new Date(user.updated_at).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>
                                Ubah password atau role untuk user {user.username}
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                              <div>
                                <Label htmlFor="edit-password">Password Baru (kosongkan jika tidak diubah)</Label>
                                <Input
                                  id="edit-password"
                                  type="password"
                                  placeholder="Password baru"
                                  value={editPassword}
                                  onChange={(e) => setEditPassword(e.target.value)}
                                  disabled={isEditLoading}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-role">Role</Label>
                                <Select value={editRole} onValueChange={(value: 'admin' | 'user') => setEditRole(value)} disabled={isEditLoading}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button type="submit" disabled={isEditLoading} className="w-full">
                                {isEditLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                  </>
                                ) : (
                                  'Simpan Perubahan'
                                )}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
