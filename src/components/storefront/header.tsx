'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Search, ShoppingBag, Heart, User, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'

const navLinks = [
  { href: '/products', label: 'All Products' },
  { href: '/products?category=women', label: 'Women' },
  { href: '/products?category=men', label: 'Men' },
  { href: '/products?category=accessories', label: 'Accessories' },
  { href: '/products?is_featured=true', label: 'New Arrivals', highlight: true },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, logout } = useAuthStore()
  const { cart, fetchCart } = useCartStore()
  const { items: wishlistItems, fetchWishlist } = useWishlistStore()

  useEffect(() => {
    fetchCart()
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-500 ease-luxury border-b ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-xl border-noir-950/10'
        : 'bg-white/90 backdrop-blur-sm border-transparent'
    }`}>
      {/* Announcement Bar */}
      <div className={`bg-noir-950 text-white overflow-hidden transition-all duration-500 ${
        isScrolled ? 'h-0 opacity-0' : 'h-9 opacity-100'
      }`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <p className="text-[10px] tracking-[0.35em] uppercase font-light">
            Complimentary shipping on all orders over ₹5,000
          </p>
        </div>
      </div>

      {/* Main Header */}
      <div className={`container mx-auto px-4 transition-all duration-500 ${
        isScrolled ? 'py-3' : 'py-4 lg:py-5'
      }`}>
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-noir-100/50 transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className={`absolute w-5 h-[1.5px] bg-noir-900 transition-all duration-300 ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
              <span className={`absolute w-5 h-[1.5px] bg-noir-900 transition-all duration-300 ${isMenuOpen ? 'opacity-0 translate-x-2' : 'opacity-100'}`} />
              <span className={`absolute w-5 h-[1.5px] bg-noir-900 transition-all duration-300 ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
            </button>

            {/* Logo */}
            <Link href="/" className="relative group flex-shrink-0">
              <Image
                src="/wordmark-black.png"
                alt="NOT JUST DARK"
                width={132}
                height={55}
                className="object-contain transition-all duration-500"
                priority
              />
            </Link>
          </div>

          {/* Center - Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 transition-all duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-[11px] tracking-[0.22em] uppercase font-normal transition-colors duration-300 group text-noir-950 ${
                  link.highlight ? 'font-display italic normal-case text-sm tracking-[0.08em]' : ''
                }`}
              >
                {link.label}
                {/* Animated hairline */}
                <span className="absolute bottom-1 left-4 right-4 h-px bg-noir-950 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-luxury origin-left" />
              </Link>
            ))}
          </nav>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1 lg:gap-2 px-2 py-1.5 rounded-full transition-all duration-300">
            {/* Search Toggle */}
            <button
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-noir-100/50 transition-all duration-300 group"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search
                size={17}
                className={`transition-all duration-300 ${
                  isSearchOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                } text-noir-700 group-hover:text-noir-900`}
              />
              <X
                size={17}
                className={`absolute transition-all duration-300 ${
                  isSearchOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                } text-noir-700 group-hover:text-noir-900`}
              />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-noir-100/50 transition-all duration-300 group"
              aria-label="Wishlist"
            >
              <Heart
                size={17}
                className="text-noir-700 group-hover:text-noir-900 transition-colors duration-300 group-hover:scale-110 transform"
              />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-noir-950 text-white text-2xs font-medium flex items-center justify-center rounded-full animate-scale-in">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* User Account */}
            <div className="relative" ref={userMenuRef}>
              {isAuthenticated ? (
                <>
                  <button
                    className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-noir-100/50 transition-all duration-300 group"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label="Account menu"
                  >
                    <User
                      size={17}
                      className="text-noir-700 group-hover:text-noir-900 transition-colors duration-300"
                    />
                  </button>

                  {/* Dropdown */}
                  <div className={`absolute right-0 top-full mt-2 w-64 origin-top-right transition-all duration-300 ease-luxury ${
                    isUserMenuOpen
                      ? 'opacity-100 scale-100 translate-y-0'
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}>
                    <div className="bg-white shadow-xl border border-noir-950/10 overflow-hidden">
                      {/* User Info */}
                      <div className="px-5 py-4 border-b border-noir-950/10">
                        <p className="font-display italic text-lg text-noir-900">{user?.full_name}</p>
                        <p className="text-xs text-noir-500 mt-0.5 tracking-wide">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/account"
                          className="flex items-center justify-between px-5 py-2.5 text-sm text-noir-700 hover:bg-cream-100 hover:text-noir-900 transition-colors group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span>My Account</span>
                          <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center justify-between px-5 py-2.5 text-sm text-noir-700 hover:bg-cream-100 hover:text-noir-900 transition-colors group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span>Orders</span>
                          <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                        {user?.role.name !== 'customer' && (
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center justify-between px-5 py-2.5 text-sm text-noir-700 hover:bg-cream-100 hover:text-noir-900 transition-colors group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <span>Admin Panel</span>
                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </Link>
                        )}
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-noir-100/50 py-2">
                        <button
                          onClick={() => {
                            logout()
                            setIsUserMenuOpen(false)
                          }}
                          className="w-full flex items-center justify-between px-5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors group"
                        >
                          <span>Sign Out</span>
                          <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-noir-100/50 transition-all duration-300 group"
                  aria-label="Sign in"
                >
                  <User
                    size={17}
                    className="text-noir-700 group-hover:text-noir-900 transition-colors duration-300"
                  />
                </Link>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-noir-100/50 transition-all duration-300 group"
              aria-label="Shopping bag"
            >
              <ShoppingBag
                size={17}
                className="text-noir-700 group-hover:text-noir-900 transition-colors duration-300 group-hover:scale-110 transform"
              />
              {cart && cart.total_items > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-noir-900 text-cream-50 text-2xs font-medium flex items-center justify-center rounded-full animate-scale-in">
                  {cart.total_items}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar - Expandable */}
        <div className={`overflow-hidden transition-all duration-500 ease-luxury ${
          isSearchOpen ? 'max-h-24 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
        }`}>
          <form onSubmit={handleSearch} className="relative">
            <div className="relative group">
              <input
                ref={searchInputRef}
                type="search"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-0 pr-10 bg-transparent border-0 border-b border-noir-950/20 text-sm tracking-[0.15em] uppercase text-noir-950 placeholder:text-noir-300 placeholder:tracking-[0.3em] focus:outline-none focus:ring-0 focus:border-noir-950 transition-colors duration-500"
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-noir-950 hover:translate-x-1 transition-transform duration-300"
                aria-label="Submit search"
              >
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </div>
            {/* Quick suggestions */}
            <div className="flex items-center gap-4 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-[10px] tracking-[0.25em] uppercase text-noir-400 whitespace-nowrap">Popular</span>
              {['Dresses', 'Blazers', 'Accessories', 'New In'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="text-[10px] tracking-[0.2em] uppercase text-noir-600 hover:text-noir-950 whitespace-nowrap transition-colors duration-300 link-editorial"
                >
                  {term}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ${
        isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-noir-950/50 backdrop-blur-sm transition-opacity duration-500 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div className={`absolute top-0 left-0 w-4/5 max-w-sm h-full bg-white shadow-2xl transition-transform duration-500 ease-luxury ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-noir-100">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="/wordmark-black.png"
                alt="NOT JUST DARK"
                width={120}
                height={50}
                className="object-contain"
              />
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-noir-100 transition-colors"
            >
              <X size={20} className="text-noir-700" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-6">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-5 font-display text-2xl border-b border-noir-950/10 transition-all duration-500 ease-luxury text-noir-950 hover:pl-3 hover:italic ${
                  link.highlight ? 'italic' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-cream-100 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-noir-200 flex items-center justify-center">
                  <User size={18} className="text-noir-600" />
                </div>
                <div>
                  <p className="font-medium text-noir-900">{user?.full_name}</p>
                  <p className="text-xs text-noir-500">{user?.email}</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  logout()
                  setIsMenuOpen(false)
                }}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
