'use client'

import { useEffect,useState } from 'react'
import { AlertTriangle, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { inventoryApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

type Item={id:string;name:string;sku?:string;stock_quantity:number;low_stock_threshold:number;is_low_stock:boolean}
export default function InventoryPage(){
 const [items,setItems]=useState<Item[]>([]);const [lowOnly,setLowOnly]=useState(false);const load=async()=>setItems((await inventoryApi.list({low_stock_only:lowOnly})).data);useEffect(()=>{load()},[lowOnly])
 const change=async(item:Item,delta:number)=>{const value=Math.max(0,item.stock_quantity+delta);try{await inventoryApi.updateStock(item.id,value);setItems(list=>list.map(i=>i.id===item.id?{...i,stock_quantity:value,is_low_stock:value<=i.low_stock_threshold}:i))}catch{toast.error('Could not update stock')}}
 return <div><div className="flex items-end justify-between mb-8"><div><p className="text-xs uppercase tracking-[.2em] text-accent-400 mb-2">Live units</p><h1 className="text-4xl">Inventory</h1></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lowOnly} onChange={e=>setLowOnly(e.target.checked)}/> Low stock only</label></div><div className="bg-white border border-accent-100 divide-y divide-accent-100">{items.map(item=><div key={item.id} className="p-4 flex items-center gap-4"><div className={`w-10 h-10 flex items-center justify-center ${item.is_low_stock?'bg-amber-50 text-amber-600':'bg-emerald-50 text-emerald-700'}`}>{item.is_low_stock?<AlertTriangle size={17}/>:item.stock_quantity}</div><div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-xs text-accent-400">{item.sku||'No SKU'} · alert at {item.low_stock_threshold}</p></div><div className="flex items-center border border-accent-200"><Button variant="ghost" size="sm" onClick={()=>change(item,-1)}><Minus size={14}/></Button><span className="w-12 text-center tabular-nums">{item.stock_quantity}</span><Button variant="ghost" size="sm" onClick={()=>change(item,1)}><Plus size={14}/></Button></div></div>)}</div></div>
}
