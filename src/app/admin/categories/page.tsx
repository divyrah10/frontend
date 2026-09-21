'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoriesApi } from '@/lib/api'
import { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const load = async () => setCategories((await categoriesApi.list()).data)
  useEffect(() => { load() }, [])
  const create = async (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return; try { await categoriesApi.create({name}); setName(''); await load(); toast.success('Category created') } catch (error:any) { toast.error(error.response?.data?.detail || 'Could not create category') } }
  const remove = async (id:string) => { if (!confirm('Delete this category?')) return; try { await categoriesApi.delete(id); await load() } catch(error:any) { toast.error(error.response?.data?.detail || 'Category cannot be deleted') } }
  return <div><div className="mb-8"><p className="text-xs uppercase tracking-[.2em] text-accent-400 mb-2">Catalog structure</p><h1 className="text-4xl">Categories</h1></div><form onSubmit={create} className="bg-white border border-accent-100 p-5 mb-6 flex gap-3"><Input value={name} onChange={e=>setName(e.target.value)} placeholder="New category name" /><Button><Plus size={16} className="mr-2"/>Add</Button></form><div className="bg-white border border-accent-100 divide-y divide-accent-100">{categories.map((category,index)=><div key={category.id} className="p-5 flex items-center justify-between hover:bg-accent-50 transition-colors"><div className="flex items-center gap-4"><span className="text-xs text-accent-300 tabular-nums">{String(index+1).padStart(2,'0')}</span><div><p className="font-medium">{category.name}</p><p className="text-xs text-accent-400">/{category.slug}</p></div></div><Button variant="ghost" size="sm" onClick={()=>remove(category.id)} className="text-red-500"><Trash2 size={16}/></Button></div>)}</div></div>
}
