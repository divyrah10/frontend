'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input, PasswordInput } from '@/components/ui/input'

interface AdminUser {
  id: string
  email: string
  full_name: string
  role_name: string
  is_active: boolean
  created_at: string
  last_login?: string | null
}

const roles: Record<string, { label: string; access: string }> = {
  super_admin: { label: 'Super admin', access: 'Everything, including adding and removing super admins.' },
  store_manager: { label: 'Store manager', access: 'Catalogue, orders, customers and the team.' },
  customer_service: { label: 'Customer service', access: 'Orders and customers only.' },
}

// No look-alike characters (0/O, 1/l/I), so a password read aloud or retyped survives.
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'

function generatePassword(length = 16) {
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (n) => PASSWORD_ALPHABET[n % PASSWORD_ALPHABET.length]).join('')
}

const emptyInvite = { email: '', full_name: '', role: 'store_manager' }

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const roleName = user?.role.name ?? ''
  const canManageTeam = roleName === 'super_admin' || roleName === 'store_manager'
  const assignableRoles = roleName === 'super_admin'
    ? ['store_manager', 'customer_service', 'super_admin']
    : ['store_manager', 'customer_service']

  const [team, setTeam] = useState<AdminUser[]>([])
  const [invite, setInvite] = useState(emptyInvite)
  const [inviting, setInviting] = useState(false)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [savingPassword, setSavingPassword] = useState(false)

  const loadTeam = useCallback(async () => {
    try {
      setTeam((await adminApi.listUsers()).data)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Could not load the team')
    }
  }, [])

  useEffect(() => {
    if (canManageTeam) loadTeam()
  }, [canManageTeam, loadTeam])

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    const email = invite.email.trim().toLowerCase()
    const password = generatePassword()
    try {
      await adminApi.inviteUser({ ...invite, email, temporary_password: password })
      setCreated({ email, password })
      setCopied(false)
      setInvite(emptyInvite)
      await loadTeam()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Could not create the account')
    } finally {
      setInviting(false)
    }
  }

  const copyCredentials = async () => {
    if (!created) return
    await navigator.clipboard.writeText(
      `NOT JUST DARK admin\n${window.location.origin}/admin/login\nEmail: ${created.email}\nTemporary password: ${created.password}\nChange it under Settings after you sign in.`
    )
    setCopied(true)
  }

  const toggleActive = async (member: AdminUser) => {
    if (member.is_active && !confirm(`Deactivate ${member.email}? They will no longer be able to sign in.`)) return
    try {
      await (member.is_active ? adminApi.deactivateUser(member.id) : adminApi.activateUser(member.id))
      await loadTeam()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Could not update this account')
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.next !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    setSavingPassword(true)
    try {
      await adminApi.changePassword(passwords.current, passwords.next)
      setPasswords({ current: '', next: '', confirm: '' })
      toast.success('Password changed')
    } catch (error: any) {
      const detail = error.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Use at least 12 characters')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[.2em] text-accent-400 mb-2">Workspace</p>
        <h1 className="text-4xl">Settings</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white border border-accent-100 p-7">
          <h2 className="text-2xl mb-6">Signed-in administrator</h2>
          <dl className="space-y-4 text-sm">
            <div><dt className="text-accent-400">Name</dt><dd>{user?.full_name}</dd></div>
            <div><dt className="text-accent-400">Email</dt><dd>{user?.email}</dd></div>
            <div><dt className="text-accent-400">Role</dt><dd className="capitalize">{roleName.replaceAll('_', ' ')}</dd></div>
          </dl>
        </section>

        <section className="bg-white border border-accent-100 p-7">
          <h2 className="text-2xl mb-6">Change my password</h2>
          <form onSubmit={changePassword} className="space-y-3">
            <PasswordInput autoComplete="current-password" placeholder="Current password" required
              value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
            <PasswordInput autoComplete="new-password" placeholder="New password (12+ characters)" minLength={12} required
              value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
            <PasswordInput autoComplete="new-password" placeholder="Confirm new password" minLength={12} required
              value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
            <Button disabled={savingPassword}>{savingPassword ? 'Saving…' : 'Change password'}</Button>
          </form>
        </section>

        {canManageTeam && (
          <section className="bg-white border border-accent-100 p-7 lg:col-span-2">
            <h2 className="text-2xl mb-2">Team</h2>
            <p className="text-sm text-accent-500 mb-6">
              Give each person their own login. The store does not send email yet, so share the temporary
              password yourself, ideally over a different channel from the email address.
            </p>

            <form onSubmit={sendInvite} className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] mb-2">
              <Input type="email" placeholder="Email" required value={invite.email}
                onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
              <Input placeholder="Full name" required value={invite.full_name}
                onChange={(e) => setInvite({ ...invite, full_name: e.target.value })} />
              <select className="border border-accent-200 bg-white px-3 py-2.5 text-sm" value={invite.role}
                onChange={(e) => setInvite({ ...invite, role: e.target.value })} aria-label="Role">
                {assignableRoles.map((role) => <option key={role} value={role}>{roles[role].label}</option>)}
              </select>
              <Button disabled={inviting}><UserPlus size={16} className="mr-2" />{inviting ? 'Creating…' : 'Create login'}</Button>
            </form>
            <p className="text-xs text-accent-400 mb-6">{roles[invite.role].label}: {roles[invite.role].access}</p>

            {created && (
              <div className="mb-6 border-l-2 border-accent-900 bg-accent-50 p-4 text-sm">
                <p className="font-medium mb-1">Login created for {created.email}</p>
                <p className="text-accent-600 mb-3">This temporary password is shown only once.</p>
                <div className="flex flex-wrap items-center gap-3">
                  <code className="bg-white border border-accent-200 px-3 py-2 tracking-wider">{created.password}</code>
                  <Button type="button" variant="outline" onClick={copyCredentials}>
                    {copied ? <Check size={15} className="mr-2" /> : <Copy size={15} className="mr-2" />}
                    {copied ? 'Copied' : 'Copy login details'}
                  </Button>
                  <button type="button" className="text-xs text-accent-500 hover:text-accent-900" onClick={() => setCreated(null)}>Done</button>
                </div>
              </div>
            )}

            <div className="divide-y divide-accent-100 border border-accent-100">
              {team.map((member) => (
                <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">
                      {member.full_name}
                      {member.id === user?.id && <span className="ml-2 text-xs text-accent-400">(you)</span>}
                    </p>
                    <p className="text-xs text-accent-500">{member.email} · {member.role_name.replaceAll('_', ' ')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs ${member.is_active ? 'text-green-600' : 'text-accent-400'}`}>
                      {member.is_active ? (member.last_login ? 'Active' : 'Not signed in yet') : 'Deactivated'}
                    </span>
                    {member.id !== user?.id && (
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(member)}>
                        {member.is_active ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
