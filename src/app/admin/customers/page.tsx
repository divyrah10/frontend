'use client'

import { useEffect, useState } from 'react'
import { Search, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi, adminApi } from '@/lib/api'
import { User } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AdminCustomersPage() {
  const [users,setUsers]=useState<User[]>([]); const [query,setQuery]=useState('')
  const load=async()=>setUsers((await usersApi.list({limit:100})).data)
  useEffect(()=>{load()},[])
  const toggle=async(user:User)=>{try{if(user.is_active){await adminApi.deactivateUser(user.id)}else{await adminApi.activateUser(user.id)}await load();toast.success(`Account ${user.is_active?'deactivated':'activated'}`)}catch(error:any){toast.error(error.response?.data?.detail||'Could not update account')}}
  const filtered=users.filter(user=>`${user.full_name} ${user.email}`.toLowerCase().includes(query.toLowerCase()))
  return <div><div className="mb-8"><p className="text-xs uppercase tracking-[.2em] text-accent-400 mb-2">Client directory</p><h1 className="text-4xl">Customers</h1></div><div className="relative mb-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-400" size={17}/><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name or email" className="pl-11 bg-white"/></div><div className="bg-white border border-accent-100 overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-accent-100 text-xs uppercase tracking-wider text-accent-400"><th className="p-4 text-left">Customer</th><th className="p-4 text-left">Role</th><th className="p-4 text-left">Joined</th><th className="p-4 text-right">Status</th></tr></thead><tbody className="divide-y divide-accent-100">{filtered.map(user=><tr key={user.id} className="hover:bg-accent-50"><td className="p-4"><p className="font-medium">{user.full_name}</p><p className="text-xs text-accent-500">{user.email}</p></td><td className="p-4 text-sm">{user.role.name.replaceAll('_',' ')}</td><td className="p-4 text-sm">{new Date(user.created_at).toLocaleDateString()}</td><td className="p-4 text-right"><Button variant="ghost" size="sm" onClick={()=>toggle(user)} className={user.is_active?'text-red-600':'text-emerald-700'}>{user.is_active?<UserX size={16}/>:<UserCheck size={16}/>}<span className="ml-2">{user.is_active?'Deactivate':'Activate'}</span></Button></td></tr>)}</tbody></table></div></div>
}
