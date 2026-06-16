import Image from 'next/image'

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <p className="text-xs tracking-[0.4em] mb-4 opacity-70">OUR STORY</p>
          <h1 className="font-display text-4xl lg:text-6xl mb-4">Not Just Dark</h1>
          <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto">
            Designed in Italy. Crafted in India.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg lg:text-xl text-accent-700 leading-relaxed">
              At NOT JUST DARK, we believe clothing is more than fabric—it's a reflection of who we are,
              where we come from, and where we're going. Our journey begins in the heart of Milan,
              where fashion is woven into the very fabric of the city. Here, design is not just about trends,
              but about timeless elegance that transcends seasons.
            </p>
          </div>
        </div>
      </section>

      {/* Designed in Italy */}
      <section className="py-16 lg:py-24 bg-accent-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
                alt="Milan Fashion Design"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] text-accent-500 mb-3">WHERE ELEGANCE IS BORN</p>
              <h2 className="font-display text-3xl lg:text-4xl mb-6">Designed in Italy</h2>
              <div className="space-y-4 text-accent-700">
                <p>
                  In Milan, every piece we design is born from the city's love affair with fashion and detail.
                  The city has a way of combining old-world charm with cutting-edge style, creating a perfect
                  balance between tradition and modernity.
                </p>
                <p>
                  At Not Just Dark, we channel that balance into every design we create. Our t-shirts and
                  polo shirts are minimalist in form, focusing on clean lines and flawless fits. But beneath
                  this simplicity lies an extraordinary attention to detail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crafted in India */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-xs tracking-[0.3em] text-accent-500 mb-3">WHERE TRADITION MEETS CRAFTSMANSHIP</p>
              <h2 className="font-display text-3xl lg:text-4xl mb-6">Crafted in India</h2>
              <div className="space-y-4 text-accent-700">
                <p>
                  India, a land with a deep-rooted tradition of textile craftsmanship, is where our designs
                  come to life. We work with expert artisans whose skill has been handed down through generations.
                </p>
                <p>
                  Every t-shirt and polo is crafted with care, using only the finest fabrics, sourced sustainably
                  and ethically. Each stitch tells a story, and every shirt carries the mark of the hands that made it.
                  The result is a garment that feels as good as it looks—soft, durable, and designed to last.
                </p>
                <p className="font-medium text-accent-900">
                  It's not just clothing; it's a heritage woven into every fibre.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden order-1 lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800"
                alt="Indian Craftsmanship"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Power of Contrast */}
      <section className="py-16 lg:py-24 bg-accent-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs tracking-[0.3em] opacity-70 mb-3">THE PHILOSOPHY</p>
            <h2 className="font-display text-3xl lg:text-4xl mb-8">The Power of Contrast: Dark & White</h2>
            <div className="space-y-6 text-accent-300">
              <p>
                NOT JUST DARK is built around the beauty of simplicity, focusing on two iconic colours:
                dark and white. These shades are not just about fashion—they represent a balance that is
                at the heart of life itself.
              </p>
              <p>
                The deep, rich blacks and dark tones speak of power, mystery, and strength, while the clean,
                crisp whites symbolize purity, freshness, and clarity. Together, they reflect the duality in
                all of us—the bold and the gentle, the understated and the expressive.
              </p>
              <p className="text-white font-medium">
                Black is bold yet subtle, sophisticated yet daring. White is timeless, offering a canvas for
                self-expression. Together, they create a balance, much like the people who wear our clothes—strong,
                yet gentle; simple, yet full of depth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Him and Her */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"
                alt="For Him and Her"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] text-accent-500 mb-3">CRAFTED WITH CARE</p>
              <h2 className="font-display text-3xl lg:text-4xl mb-6">For Him and Her</h2>
              <div className="space-y-4 text-accent-700">
                <p>
                  We designed our t-shirts and polo shirts to suit both men and women, because style knows no
                  boundaries. Every piece is tailored to offer comfort without sacrificing elegance.
                </p>
                <p>
                  Whether you're dressing for a casual afternoon or an important meeting, Not Just Dark offers
                  versatility for every occasion—because what you wear should feel like an extension of who you are.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Story */}
      <section className="py-16 lg:py-24 bg-accent-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Image
              src="/logo-black.png"
              alt="NOT JUST DARK"
              width={120}
              height={75}
              className="mx-auto mb-8 object-contain"
            />
            <p className="text-xs tracking-[0.3em] text-accent-500 mb-3">TIMELESS • GLOBAL • YOURS</p>
            <h2 className="font-display text-3xl lg:text-4xl mb-8">Your Story, Our Craft</h2>
            <div className="space-y-6 text-accent-700">
              <p>
                Our pieces are for those who understand that true luxury doesn't shout—it speaks in quiet,
                confident tones. We believe that every person's style tells a story.
              </p>
              <p>
                Our t-shirts and polo shirts are designed to help you tell yours—whether you come from the
                world of heritage, where old money traditions shape your tastes, or from a Gen Z mindset,
                where you seek individuality with sophistication.
              </p>
              <p className="text-xl font-display text-accent-900 pt-4">
                We create not just for today, but for the moments you'll remember forever.
              </p>
            </div>
            <div className="mt-12 space-y-2">
              <p className="text-2xl font-display text-accent-900">WEAR YOUR STORY</p>
              <p className="text-lg tracking-[0.2em] text-accent-500">WORN BY YOU</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
