'use client'

import { useEffect, useState } from 'react'
import { Check, Star, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { reviewsApi } from '@/lib/api'
import { Review } from '@/types'
import { Button } from '@/components/ui/button'

export default function AdminReviewsPage(){
 const [reviews,setReviews]=useState<Review[]>([]); const load=async()=>setReviews((await reviewsApi.getPending()).data); useEffect(()=>{load()},[])
 const act=async(id:string,approve:boolean)=>{try{if(approve){await reviewsApi.approve(id)}else{await reviewsApi.reject(id)}await load();toast.success(approve?'Review published':'Review rejected')}catch{toast.error('Could not update review')}}
 return <div><div className="mb-8"><p className="text-xs uppercase tracking-[.2em] text-accent-400 mb-2">Editorial moderation</p><h1 className="text-4xl">Pending reviews</h1></div>{!reviews.length?<div className="bg-white border border-accent-100 p-16 text-center text-accent-500">All caught up — no reviews await moderation.</div>:<div className="grid lg:grid-cols-2 gap-5">{reviews.map(review=><article key={review.id} className="bg-white border border-accent-100 p-6 hover-lift"><div className="flex gap-1 text-gold-500 mb-4">{Array.from({length:review.rating},(_,i)=><Star key={i} size={14} fill="currentColor"/>)}</div><h2 className="text-2xl mb-2">{review.title||'Untitled review'}</h2><p className="text-sm text-accent-600 min-h-16">{review.comment||'No written comment.'}</p><p className="mt-5 text-xs uppercase tracking-wider text-accent-400">By {review.user_name}{review.is_verified_purchase?' · Verified purchase':''}</p><div className="flex gap-3 mt-6 pt-5 border-t border-accent-100"><Button size="sm" onClick={()=>act(review.id,true)}><Check size={15} className="mr-2"/>Publish</Button><Button size="sm" variant="outline" onClick={()=>act(review.id,false)}><X size={15} className="mr-2"/>Reject</Button></div></article>)}</div>}</div>
}
