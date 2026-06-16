'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight, Instagram, Twitter, Facebook, Linkedin, MapPin, Phone, Mail } from 'lucide-react'

const shopLinks = [
  { href: '/products?is_featured=true', label: 'New Arrivals' },
  { href: '/products?category=women', label: 'Women' },
  { href: '/products?category=men', label: 'Men' },
  { href: '/products?category=accessories', label: 'Accessories' },
  { href: '/products', label: 'All Products' },
]

const customerLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/shipping', label: 'Shipping Information' },
  { href: '/returns', label: 'Returns & Exchanges' },
  { href: '/faq', label: 'FAQ' },
  { href: '/size-guide', label: 'Size Guide' },
]

const companyLinks = [
  { href: '/about', label: 'Our Story' },
  { href: '/sustainability', label: 'Sustainability' },
  { href: '/careers', label: 'Careers' },
  { href: '/press', label: 'Press' },
]

const socialLinks = [
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setIsSubscribed(true)
      setEmail('')
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <footer className="relative bg-noir-950 text-cream-200 overflow-hidden">
      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/50 mb-6 font-light">
              Join the Exclusive Circle
            </p>
            <h2 className="font-display text-4xl lg:text-6xl text-white mb-5">
              Subscribe to Our <span className="italic font-normal">Newsletter</span>
            </h2>
            <p className="text-white/50 mb-12 max-w-lg mx-auto text-sm leading-loose font-light">
              Be the first to discover new collections, exclusive offers, and the stories behind our craftsmanship.
            </p>

            <form onSubmit={handleSubscribe} className="relative max-w-md mx-auto">
              <div className="relative group">
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-0 pr-12 bg-transparent border-0 border-b border-white/25 text-sm tracking-[0.15em] text-white placeholder:text-white/30 placeholder:tracking-[0.3em] placeholder:text-xs focus:outline-none focus:ring-0 focus:border-white transition-colors duration-500"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white hover:translate-x-1.5 transition-transform duration-500 ease-luxury"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={18} strokeWidth={1.25} />
                </button>
              </div>

              {/* Success Message */}
              {isSubscribed && (
                <p className="absolute -bottom-10 left-0 right-0 text-white/80 text-xs tracking-[0.25em] uppercase animate-fade-in">
                  Thank you for subscribing
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/wordmark-white.png"
                alt="NOT JUST DARK"
                width={170}
                height={70}
                className="object-contain opacity-90"
              />
            </Link>
            <p className="text-cream-400 text-sm leading-relaxed mb-6 max-w-xs">
              Where darkness meets elegance. Bold fashion for those who embrace individuality
              and command attention. Designed in Italy, crafted with passion.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-white/15 text-white/60 hover:border-white hover:text-noir-950 hover:bg-white transition-all duration-500"
                  aria-label={social.label}
                >
                  <social.icon size={15} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-body text-white text-[10px] tracking-[0.35em] uppercase mb-6">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/50 hover:text-white transition-colors duration-300 inline-block relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Links */}
          <div>
            <h4 className="font-body text-white text-[10px] tracking-[0.35em] uppercase mb-6">
              Customer Care
            </h4>
            <ul className="space-y-3">
              {customerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/50 hover:text-white transition-colors duration-300 inline-block relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-body text-white text-[10px] tracking-[0.35em] uppercase mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-light text-white/50 hover:text-white transition-colors duration-300 inline-block relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-body text-white text-[10px] tracking-[0.35em] uppercase mb-6">
              Get in Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={15} strokeWidth={1.25} className="text-white/40 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-light text-white/50">
                  Mumbai, Maharashtra<br />
                  India 400001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} strokeWidth={1.25} className="text-white/40 flex-shrink-0" />
                <a
                  href="mailto:hello@notjustdark.com"
                  className="text-sm font-light text-white/50 hover:text-white transition-colors"
                >
                  hello@notjustdark.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} strokeWidth={1.25} className="text-white/40 flex-shrink-0" />
                <a
                  href="tel:+911234567890"
                  className="text-sm font-light text-white/50 hover:text-white transition-colors"
                >
                  +91 123 456 7890
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-cream-200/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-xs text-cream-500 tracking-wide">
              &copy; {new Date().getFullYear()} NOT JUST DARK. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-xs text-cream-500 hover:text-cream-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="w-1 h-1 rounded-full bg-cream-700" />
              <Link
                href="/terms"
                className="text-xs text-cream-500 hover:text-cream-300 transition-colors"
              >
                Terms of Service
              </Link>
              <span className="w-1 h-1 rounded-full bg-cream-700" />
              <Link
                href="/cookies"
                className="text-xs text-cream-500 hover:text-cream-300 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>

            {/* Payment Methods - Decorative */}
            <div className="flex items-center gap-2">
              <span className="text-2xs text-cream-600">We accept</span>
              <div className="flex items-center gap-1.5">
                {['Visa', 'MC', 'UPI'].map((method) => (
                  <span
                    key={method}
                    className="px-2 py-1 border border-white/15 text-2xs tracking-wider text-white/50"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Brand Watermark */}
      <div className="absolute bottom-16 right-8 opacity-[0.03] pointer-events-none hidden lg:block">
        <span className="font-display italic text-[20rem] text-white select-none">N</span>
      </div>
    </footer>
  )
}
