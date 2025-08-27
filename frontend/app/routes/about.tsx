import type { Route } from "./+types/about";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - Lazada Lite" },
    {
      name: "description",
      content: "Learn about Lazada Lite e-commerce platform",
    },
  ];
}

export default function About() {
  return (
    <div className='min-h-screen'>
      {/* Hero */}
      <section className='relative overflow-hidden bg-white border-b border-gray-200'>
        <div className='container mx-auto px-4 py-16 lg:py-24'>
          <div className='max-w-4xl'>
            <p className='text-sm font-medium tracking-wider text-gray-500 uppercase'>
              About
            </p>
            <h1 className='text-5xl lg:text-6xl font-bold text-black leading-tight mt-2'>
              Building a simpler way to shop, sell and ship
            </h1>
            <p className='text-lg text-gray-600 leading-relaxed max-w-2xl mt-6'>
              Lazada Lite is an educational e-commerce platform demonstrating
              modern full‑stack practices with a clean, distraction‑free UX.
            </p>
            <div className='h-px w-full bg-gray-200 mt-8'></div>
            <div className='flex items-center gap-6 text-sm text-gray-600 mt-6'>
              <span>Open architecture</span>
              <span className='h-3 w-px bg-gray-300' />
              <span>Role‑based access</span>
              <span className='h-3 w-px bg-gray-300' />
              <span>Modern tooling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className='py-20 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-black transition-colors'>
              <h3 className='text-xl font-semibold text-black mb-2'>
                Multi‑role system
              </h3>
              <p className='text-gray-600 text-sm'>
                Customers, vendors and shippers each get focused tools without
                the noise.
              </p>
            </div>
            <div className='rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-black transition-colors'>
              <h3 className='text-xl font-semibold text-black mb-2'>
                Modern stack
              </h3>
              <p className='text-gray-600 text-sm'>
                React 19, TypeScript, React Router v7 and Tailwind v4 with
                shadcn/ui.
              </p>
            </div>
            <div className='rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-black transition-colors'>
              <h3 className='text-xl font-semibold text-black mb-2'>
                Responsive by default
              </h3>
              <p className='text-gray-600 text-sm'>
                Thoughtful layouts that scale from mobile to desktop with
                clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mb-8'>
            <h2 className='text-3xl lg:text-4xl font-bold text-black mb-3'>
              Technical stack
            </h2>
            <p className='text-gray-600'>
              Curated tools for a delightful developer experience and robust,
              type‑safe code.
            </p>
          </div>
          <div className='rounded-2xl border border-gray-200 p-8'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 text-sm'>
              <div>
                <p className='font-semibold text-black'>Frontend</p>
                <ul className='mt-2 space-y-1 text-gray-700'>
                  <li>React 19</li>
                  <li>TypeScript</li>
                  <li>React Router v7</li>
                  <li>Tailwind CSS v4</li>
                </ul>
              </div>
              <div>
                <p className='font-semibold text-black'>UI Components</p>
                <ul className='mt-2 space-y-1 text-gray-700'>
                  <li>shadcn/ui</li>
                  <li>Radix UI</li>
                  <li>Lucide Icons</li>
                  <li>CSS Variables</li>
                </ul>
              </div>
              <div>
                <p className='font-semibold text-black'>State & Forms</p>
                <ul className='mt-2 space-y-1 text-gray-700'>
                  <li>Redux Toolkit</li>
                  <li>React Hook Form</li>
                  <li>Zod Validation</li>
                  <li>Redux Persist</li>
                </ul>
              </div>
              <div>
                <p className='font-semibold text-black'>Development</p>
                <ul className='mt-2 space-y-1 text-gray-700'>
                  <li>Vite</li>
                  <li>ESLint</li>
                  <li>TypeScript</li>
                  <li>Hot Reload</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Purpose */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl'>
            <h2 className='text-3xl lg:text-4xl font-bold text-black mb-4'>
              Educational purpose
            </h2>
            <p className='text-gray-600 mb-6'>
              This project showcases practical full‑stack concepts used in real
              apps:
            </p>
            <ul className='grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700'>
              <li>Component‑based architecture</li>
              <li>Type‑safe development</li>
              <li>Modern routing</li>
              <li>Form handling and validation</li>
              <li>State management patterns</li>
              <li>Responsive design principles</li>
              <li>User authentication and authorization</li>
              <li>Role‑based access control</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 bg-black'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl'>
            <p className='text-xs font-medium tracking-widest text-gray-400 uppercase'>
              Explore
            </p>
            <h3 className='text-4xl font-bold text-white mt-2'>
              Ready to dive deeper?
            </h3>
            <p className='text-gray-300 mt-4 max-w-2xl'>
              Browse products, create a vendor account, or explore shipper tools
              — all within a clean, focused experience.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 mt-8'>
              <Link to='/products'>
                <Button className='text-lg px-8 py-4 bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-300'>
                  Explore Products
                </Button>
              </Link>
              <Link to='/register/vendor'>
                <Button
                  variant='outline'
                  className='text-lg px-8 py-4 border-2 bg-black border-white text-white hover:bg-white hover:text-black transition-all duration-300'
                >
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
