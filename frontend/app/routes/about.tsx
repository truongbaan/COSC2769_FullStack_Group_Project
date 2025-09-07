/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Tran Hoang Linh
# ID: s4043097 */

import type { Route } from "./+types/about";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - MUCK" },
    {
      name: "description",
      content: "Learn about MUCK e-commerce platform",
    },
  ];
}

export default function About() {
  return (
    <div className='min-h-screen'>
      {/* Hero */}
      <section className='relative overflow-hidden bg-background border-b border-border'>
        <div className='container mx-auto px-4 py-16 lg:py-24'>
          <div className='max-w-4xl'>
            <p className='text-sm font-medium tracking-wider text-muted-foreground uppercase'>
              About
            </p>
            <h1 className='text-5xl lg:text-6xl font-bold text-foreground leading-tight mt-2'>
              Building a simpler way to shop, sell and ship
            </h1>
            <p className='text-lg text-muted-foreground leading-relaxed max-w-2xl mt-6'>
              MUCK is an educational e-commerce platform demonstrating
              modern full‑stack practices with a clean, distraction‑free UX.
            </p>
            <div className='h-px w-full bg-border mt-8'></div>
            <div className='flex items-center gap-6 text-sm text-muted-foreground mt-6'>
              <span>Open architecture</span>
              <span className='h-3 w-px bg-border' />
              <span>Role‑based access</span>
              <span className='h-3 w-px bg-border' />
              <span>Modern tooling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className='py-20 bg-muted'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='rounded-2xl border-2 border-border bg-card p-8 hover:border-primary transition-colors'>
              <h3 className='text-xl font-semibold text-foreground mb-2'>
                Multi‑role system
              </h3>
              <p className='text-muted-foreground text-sm'>
                Customers, vendors and shippers each get focused tools without
                the noise.
              </p>
            </div>
            <div className='rounded-2xl border-2 border-border bg-card p-8 hover:border-primary transition-colors'>
              <h3 className='text-xl font-semibold text-foreground mb-2'>
                Modern stack
              </h3>
              <p className='text-muted-foreground text-sm'>
                React 19, TypeScript, React Router v7 and Tailwind v4 with
                shadcn/ui.
              </p>
            </div>
            <div className='rounded-2xl border-2 border-border bg-card p-8 hover:border-primary transition-colors'>
              <h3 className='text-xl font-semibold text-foreground mb-2'>
                Responsive by default
              </h3>
              <p className='text-muted-foreground text-sm'>
                Thoughtful layouts that scale from mobile to desktop with
                clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className='py-20 bg-background'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mb-8'>
            <h2 className='text-3xl lg:text-4xl font-bold text-foreground mb-3'>
              Technical stack
            </h2>
            <p className='text-muted-foreground'>
              Curated tools for a delightful developer experience and robust,
              type‑safe code.
            </p>
          </div>
          <div className='rounded-2xl border border-border p-8'>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-sm'>
              <div>
                <p className='font-semibold text-foreground'>Frontend</p>
                <ul className='mt-2 space-y-1 text-muted-foreground'>
                  <li>React 19</li>
                  <li>TypeScript</li>
                  <li>React Router v7</li>
                  <li>Tailwind CSS v4</li>
                </ul>
              </div>
              <div>
                <p className='font-semibold text-foreground'>UI Components</p>
                <ul className='mt-2 space-y-1 text-muted-foreground'>
                  <li>shadcn/ui</li>
                  <li>Radix UI</li>
                  <li>Lucide Icons</li>
                  <li>CSS Variables</li>
                </ul>
              </div>
              <div>
                <p className='font-semibold text-foreground'>State & Forms</p>
                <ul className='mt-2 space-y-1 text-muted-foreground'>
                  <li>Redux Toolkit</li>
                  <li>React Hook Form</li>
                  <li>Zod Validation</li>
                  <li>Redux Persist</li>
                </ul>
              </div>
              <div>
                <p className='font-semibold text-foreground'>Development</p>
                <ul className='mt-2 space-y-1 text-muted-foreground'>
                  <li>Vite</li>
                  <li>ESLint</li>
                  <li>TypeScript</li>
                  <li>Hot Reload</li>
                </ul>
              </div>
              <div>
                <p className='font-semibold text-foreground'>Backend (API)</p>
                <ul className='mt-2 space-y-1 text-muted-foreground'>
                  <li>Express 5</li>
                  <li>TypeScript</li>
                  <li>Zod</li>
                  <li>CORS, Cookie‑Parser</li>
                  <li>Multer, UUID</li>
                </ul>
              </div>
              <div>
                <p className='font-semibold text-foreground'>Data & Auth</p>
                <ul className='mt-2 space-y-1 text-muted-foreground'>
                  <li>Supabase JS v2</li>
                  <li>Supabase Auth</li>
                  <li>Supabase Storage</li>
                  <li>Postgres via Supabase</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Purpose */}
      <section className='py-20 bg-background'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl'>
            <h2 className='text-3xl lg:text-4xl font-bold text-foreground mb-4'>
              Educational purpose
            </h2>
            <p className='text-muted-foreground mb-6'>
              This project showcases practical full‑stack concepts used in real
              apps:
            </p>
            <ul className='grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground'>
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
      <section className='py-20 bg-primary'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl'>
            <p className='text-xs font-medium tracking-widest text-primary-foreground/70 uppercase'>
              Explore
            </p>
            <h3 className='text-4xl font-bold text-primary-foreground mt-2'>
              Ready to dive deeper?
            </h3>
            <p className='text-primary-foreground/80 mt-4 max-w-2xl'>
              Browse products, create a vendor account, or explore shipper tools
              — all within a clean, focused experience.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 mt-8'>
              <Link to='/products'>
                <Button className='text-lg px-8 py-4 bg-background text-foreground hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-300'>
                  Explore Products
                </Button>
              </Link>
              <Link to='/register/vendor'>
                <Button
                  variant='outline'
                  className='text-lg px-8 py-4 border-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-300'
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
