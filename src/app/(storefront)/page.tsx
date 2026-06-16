'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { ProductCard } from '@/components/storefront/product-card'
import { Reveal } from '@/components/reveal'
import { productsApi, categoriesApi } from '@/lib/api'
import { Product, Category } from '@/types'

const features = [
  {
    index: '01',
    title: 'Free Shipping',
    description: 'On orders over ₹5,000',
  },
  {
    index: '02',
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    index: '03',
    title: 'Secure Payment',
    description: '100% secure checkout',
  },
  {
    index: '04',
    title: '24/7 Support',
    description: 'Dedicated assistance',
  },
]

const marqueeItems = [
  'Not Just Dark',
  'New Collection',
  'Designed in Italy',
  'Crafted in India',
  'Where Darkness Meets Elegance',
]

function HeroPanel({
  href,
  image,
  alt,
  eyebrow,
  titleItalic,
  title,
  description,
  cta,
  loaded,
  delay,
}: {
  href: string
  image: string
  alt: string
  eyebrow: string
  titleItalic: string
  title: string
  description: string
  cta: string
  loaded: boolean
  delay: number
}) {
  return (
    <Link
      href={href}
      className="group relative flex-1 min-h-[50%] lg:min-h-full overflow-hidden cursor-pointer"
    >
      {/* Background Image — slow cinematic settle on load, gentle drift on hover */}
      <div className="absolute inset-0 overflow-hidden transition-transform duration-[1800ms] ease-luxury group-hover:scale-[1.04]">
        <Image
          src={image}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-700 ${
            loaded ? 'animate-kenburns opacity-100' : 'scale-[1.12] opacity-0'
          }`}
          priority
        />
      </div>

      {/* Monochrome gradient veil */}
      <div className="absolute inset-0 bg-gradient-to-t from-noir-950/70 via-noir-950/10 to-transparent group-hover:from-noir-950/80 transition-all duration-700" />

      {/* Content — masked line reveals */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-8 lg:p-14 text-white ${
          loaded ? 'is-revealed' : ''
        }`}
      >
        <span className="reveal-mask mb-4">
          <span
            className="reveal-mask-inner text-[10px] tracking-[0.45em] uppercase text-white/70 font-light"
            style={{ transitionDelay: `${delay}ms` }}
          >
            {eyebrow}
          </span>
        </span>

        <h2 className="font-display text-5xl lg:text-7xl mb-5 text-white leading-[1.02]">
          <span className="reveal-mask">
            <span
              className="reveal-mask-inner"
              style={{ transitionDelay: `${delay + 100}ms` }}
            >
              <span className="italic font-normal">{titleItalic}</span> {title}
            </span>
          </span>
        </h2>

        <span className="reveal-mask mb-8">
          <span
            className="reveal-mask-inner text-sm text-white/80 max-w-md font-light leading-relaxed"
            style={{ transitionDelay: `${delay + 200}ms` }}
          >
            {description}
          </span>
        </span>

        <span className="reveal-mask">
          <span
            className="reveal-mask-inner"
            style={{ transitionDelay: `${delay + 300}ms` }}
          >
            <span className="inline-flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase font-light text-white">
              <span className="link-editorial">{cta}</span>
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="transform group-hover:translate-x-1.5 transition-transform duration-500 ease-luxury"
              />
            </span>
          </span>
        </span>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsApi.getFeatured(8),
          categoriesApi.list(),
        ])
        setFeaturedProducts(productsRes.data)
        setCategories(categoriesRes.data.slice(0, 4))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
    setHeroLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Cinematic Split */}
      <section
        ref={heroRef}
        className="relative h-[calc(100svh-7.7rem)] lg:h-[calc(100vh-8.2rem)] flex flex-col lg:flex-row overflow-hidden bg-noir-950"
      >
        <HeroPanel
          href="/products?category=women"
          image="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1200&q=90"
          alt="Women's Collection"
          eyebrow="Not Just Dark"
          titleItalic="For"
          title="Women"
          description="Elegant pieces crafted for the modern woman. Discover timeless sophistication that commands attention."
          cta="Shop Women"
          loaded={heroLoaded}
          delay={200}
        />

        {/* Center hairline */}
        <div className="hidden lg:block w-px bg-white/15 relative z-10" />

        <HeroPanel
          href="/products?category=men"
          image="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=90"
          alt="Men's Collection"
          eyebrow="Not Just Dark"
          titleItalic="For"
          title="Men"
          description="Bold statements for the distinguished gentleman. Redefine your wardrobe with pieces that speak volumes."
          cta="Shop Men"
          loaded={heroLoaded}
          delay={400}
        />

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3 text-white/60 transition-all duration-1000 ${
            heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '1200ms' }}
        >
          <span className="text-[9px] tracking-[0.4em] uppercase">Scroll</span>
          <ArrowDown size={14} strokeWidth={1.5} className="animate-bounce-soft" />
        </div>
      </section>

      {/* Editorial Marquee */}
      <div className="bg-noir-950 text-white border-t border-white/10 overflow-hidden py-3.5 select-none">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {marqueeItems.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center gap-10 px-5 text-[10px] tracking-[0.4em] uppercase font-light whitespace-nowrap"
                >
                  {item}
                  <span className="block w-1 h-1 rotate-45 bg-white/40" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-24 lg:py-36 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <Reveal>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-6">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase text-noir-400 mb-5 font-light">
                  New Arrivals
                </p>
                <h2 className="font-display text-5xl lg:text-7xl text-noir-950">
                  <span className="reveal-mask">
                    <span className="reveal-mask-inner">
                      Latest <span className="italic font-normal">Collection</span>
                    </span>
                  </span>
                </h2>
              </div>

              <Link
                href="/products?is_featured=true"
                className="group hidden lg:inline-flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-noir-950 pb-2"
              >
                <span className="link-editorial">View All</span>
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="transform group-hover:translate-x-1.5 transition-transform duration-500 ease-luxury"
                />
              </Link>
            </div>
            <div className="rule-grow mb-14 lg:mb-20" />
          </Reveal>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 lg:gap-x-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] skeleton !rounded-none" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 skeleton w-1/3 !rounded-none" />
                    <div className="h-4 skeleton w-2/3 !rounded-none" />
                    <div className="h-4 skeleton w-1/4 !rounded-none" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 lg:gap-x-6">
              {featuredProducts.map((product, index) => (
                <Reveal key={product.id} delay={(index % 4) * 100}>
                  <ProductCard product={product} index={index} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-noir-400 text-sm tracking-wide">
                No featured products available yet.
              </p>
            </div>
          )}

          {/* Mobile View All */}
          <div className="mt-14 text-center lg:hidden">
            <Link
              href="/products?is_featured=true"
              className="inline-flex items-center justify-center gap-3 h-12 px-10 border border-noir-950 text-noir-950 text-[11px] tracking-[0.3em] uppercase hover:bg-noir-950 hover:text-white transition-colors duration-500"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 lg:py-36 bg-cream-200/60 hairline-t">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <Reveal>
            <div className="text-center mb-14 lg:mb-20">
              <p className="text-[10px] tracking-[0.4em] uppercase text-noir-400 mb-5 font-light">
                Explore
              </p>
              <h2 className="font-display text-5xl lg:text-7xl text-noir-950">
                <span className="reveal-mask">
                  <span className="reveal-mask-inner">
                    Shop by <span className="italic font-normal">Category</span>
                  </span>
                </span>
              </h2>
            </div>
          </Reveal>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-noir-950/10 border border-noir-950/10">
            {(categories.length > 0
              ? categories.map((c) => ({
                  key: c.id,
                  href: `/products?category=${c.slug}`,
                  name: c.name,
                  image: c.image_url,
                }))
              : ['Women', 'Men', 'Accessories', 'New Arrivals'].map((name, i) => ({
                  key: `placeholder-${i}`,
                  href: `/products?category=${name.toLowerCase().replace(' ', '-')}`,
                  name,
                  image: null as string | null,
                }))
            ).map((category, index) => (
              <Reveal key={category.key} delay={index * 100} className="bg-white">
                <Link
                  href={category.href}
                  className="group relative block aspect-[3/4] overflow-hidden"
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-[1.4s] ease-luxury group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-noir-200 to-noir-400 transition-transform duration-[1.4s] ease-luxury group-hover:scale-[1.06]" />
                  )}

                  {/* Veil */}
                  <div className="absolute inset-0 bg-noir-950/25 group-hover:bg-noir-950/45 transition-colors duration-700" />

                  {/* Index number */}
                  <span className="absolute top-5 left-5 text-[10px] tracking-[0.3em] text-white/70 font-light">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="font-display text-2xl lg:text-4xl text-white mb-3 transition-transform duration-700 ease-luxury group-hover:-translate-y-1">
                      {category.name}
                    </h3>
                    <span className="text-[10px] text-white tracking-[0.35em] uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-luxury">
                      Discover
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Banner */}
      <section className="relative py-32 lg:py-48 overflow-hidden bg-noir-950">
        {/* Oversized watermark */}
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display italic text-[28vw] leading-none text-white/[0.03] whitespace-nowrap pointer-events-none select-none"
          aria-hidden
        >
          NJD
        </span>

        <div className="relative container mx-auto px-4 text-center">
          <Reveal>
            {/* Logo */}
            <Image
              src="/logo-white.png"
              alt="NOT JUST DARK"
              width={96}
              height={60}
              className="mx-auto mb-8 object-contain opacity-90"
            />

            {/* Tagline */}
            <p className="text-[10px] tracking-[0.45em] uppercase text-white/50 mb-10 font-light">
              Designed in Italy &middot; Crafted in India
            </p>

            {/* Heading */}
            <h2 className="font-display text-5xl lg:text-8xl text-white mb-10 max-w-4xl mx-auto leading-[1.05]">
              <span className="reveal-mask">
                <span className="reveal-mask-inner">Clothing Is More</span>
              </span>
              <span className="reveal-mask">
                <span
                  className="reveal-mask-inner"
                  style={{ transitionDelay: '150ms' }}
                >
                  Than <span className="italic font-normal">Fabric</span>
                </span>
              </span>
            </h2>

            {/* Description */}
            <p className="text-white/60 max-w-xl mx-auto mb-12 text-sm lg:text-base leading-loose font-light">
              At NOT JUST DARK, we believe clothing is a reflection of who we are.
              Our journey begins in the heart of Milan, where fashion meets timeless
              elegance, and comes to life in India, where craftsmanship is an art
              passed down through generations.
            </p>

            {/* CTA */}
            <Link
              href="/about"
              className="group inline-flex items-center justify-center gap-3 px-12 py-4 border border-white/40 text-white text-[11px] tracking-[0.3em] uppercase hover:bg-white hover:text-noir-950 hover:border-white transition-all duration-500"
            >
              Discover Our Story
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="transform group-hover:translate-x-1.5 transition-transform duration-500 ease-luxury"
              />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 lg:gap-x-12">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 100}>
                <div className="group pt-6 border-t border-noir-950/15 hover:border-noir-950 transition-colors duration-700">
                  <span className="block font-display italic text-lg text-noir-300 mb-6 group-hover:text-noir-950 transition-colors duration-700">
                    {feature.index}
                  </span>
                  <h4 className="font-body text-[11px] tracking-[0.25em] uppercase text-noir-950 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-noir-400 font-light">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
