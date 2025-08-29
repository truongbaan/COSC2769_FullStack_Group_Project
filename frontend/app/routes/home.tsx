import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import InteractiveFeatureCards from "~/components/home/interactive-feature-cards";
import { ShoppingBag, Package, Truck, Star } from "~/components/ui/icons";
import { useAuth } from "~/lib/auth";
import { Separator } from "~/components/ui/separator";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lazada Lite - E-Commerce Platform" },
    {
      name: "description",
      content: "Welcome to Lazada Lite - Your one-stop e-commerce solution",
    },
  ];
}

export default function Home() {
  const { user } = useAuth();
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-background border-b border-border'>
        <div className='container mx-auto px-4 py-16 lg:py-24'>
          <div className='grid lg:grid-cols-[1fr_1px_1fr] gap-6 items-center'>
            <div className='space-y-8'>
              <div className='space-y-5'>
                <p className='text-sm font-medium tracking-wider text-muted-foreground uppercase'>
                  E-commerce, simplified
                </p>
                <h1 className='text-6xl lg:text-7xl font-bold text-foreground leading-tight'>
                  Shop, sell and ship — in one place
                </h1>
                <p className='text-lg text-muted-foreground leading-relaxed max-w-xl'>
                  A clean e-commerce experience for customers, vendors and
                  shippers. No clutter, just the essentials.
                </p>
                <div className='h-px w-full bg-border'></div>
                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className='h-4 w-4 text-foreground fill-current'
                      />
                    ))}
                  </div>
                  <span>4.9/5 from 1,000+ users</span>
                  <span className='mx-2 h-3 w-px bg-border' />
                  <span>No ads • No noise</span>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-4'>
                {/* Only show Browse Products for customers and unauthenticated users */}
                {(!user || user.role === "customer") && (
                  <Link to='/products'>
                    <Button size='xl' className='text-md'>
                      <ShoppingBag className='mr-2 h-7 w-7' />
                      Browse Products
                    </Button>
                  </Link>
                )}
                {/* Show different CTAs based on user role */}
                {!user && (
                  <Link to='/register/vendor'>
                    <Button variant='outline' size='xl' className='text-md'>
                      Start Selling
                    </Button>
                  </Link>
                )}
                {user && user.role === "vendor" && (
                  <Link to='/vendor/products'>
                    <Button size='xl' className='text-md'>
                      <Package className='mr-2 h-7 w-7' />
                      My Products
                    </Button>
                  </Link>
                )}
                {user && user.role === "shipper" && (
                  <Link to='/shipper/orders'>
                    <Button size='xl' className='text-md'>
                      <Truck className='mr-2 h-7 w-7' />
                      Active Orders
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <Separator orientation='vertical' />
            <InteractiveFeatureCards />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-24 bg-muted'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl'>
            <h2 className='text-4xl lg:text-5xl font-bold text-foreground mb-6'>
              Join Our Community
            </h2>
            <p className='text-xl text-muted-foreground mb-16 max-w-2xl'>
              Choose your role and start your journey with us. Whether you're
              buying, selling, or delivering, we've built the perfect platform
              for you.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <Card className='group hover:shadow-2xl transition-all duration-500 border-2 border-border bg-card hover:border-primary'>
              <CardHeader className='space-y-6 pb-6'>
                <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <ShoppingBag className='h-8 w-8 text-primary-foreground' />
                </div>
                <div className='space-y-2'>
                  <CardTitle className='text-2xl font-bold text-foreground'>
                    For Customers
                  </CardTitle>
                  <CardDescription className='text-muted-foreground text-base'>
                    Discover and purchase amazing products from verified vendors
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                <ul className='space-y-3'>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Browse thousands of products
                  </li>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Secure shopping experience
                  </li>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Easy cart and checkout
                  </li>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Order tracking
                  </li>
                </ul>
                <Link to='/register/customer'>
                  <Button className='w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300'>
                    Sign Up as Customer
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='group hover:shadow-2xl transition-all duration-500 border-2 border-border bg-card hover:border-primary'>
              <CardHeader className='space-y-6 pb-6'>
                <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <Package className='h-8 w-8 text-primary-foreground' />
                </div>
                <div className='space-y-2'>
                  <CardTitle className='text-2xl font-bold text-foreground'>
                    For Vendors
                  </CardTitle>
                  <CardDescription className='text-muted-foreground text-base'>
                    Start your online business and reach thousands of customers
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                <ul className='space-y-3'>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    List and manage products
                  </li>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Business dashboard
                  </li>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Order management
                  </li>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Analytics and insights
                  </li>
                </ul>
                <Link to='/register/vendor'>
                  <Button className='w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300'>
                    Sign Up as Vendor
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className='group hover:shadow-2xl transition-all duration-500 border-2 border-border bg-card hover:border-primary'>
              <CardHeader className='space-y-6 pb-6'>
                <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  <Truck className='h-8 w-8 text-primary-foreground' />
                </div>
                <div className='space-y-2'>
                  <CardTitle className='text-2xl font-bold text-foreground'>
                    For Shippers
                  </CardTitle>
                  <CardDescription className='text-muted-foreground text-base'>
                    Join our delivery network and help connect buyers with
                    sellers
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                <ul className='space-y-3'>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Flexible delivery schedules
                  </li>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Multiple hub locations
                  </li>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Order tracking system
                  </li>
                  <li className='flex items-center text-muted-foreground'>
                    <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                    Competitive earnings
                  </li>
                </ul>
                <Link to='/register/shipper'>
                  <Button className='w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300'>
                    Sign Up as Shipper
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-24 bg-background border-t border-border'>
        <div className='container mx-auto px-4'>
          <div className='mb-10'>
            <p className='text-xs font-medium tracking-widest text-muted-foreground uppercase'>
              By the numbers
            </p>
            <h2 className='text-4xl lg:text-5xl font-bold text-foreground mb-4'>
              Platform Statistics
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl'>
              Growing community of users across Vietnam, building trust and
              connections every day.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='text-left rounded-xl p-6 bg-card border-2 border-border hover:border-primary transition-colors'>
              <div className='text-4xl lg:text-5xl font-extrabold mb-3 text-foreground  tracking-tight'>
                1,000+
              </div>
              <div className='text-muted-foreground text-base font-medium'>
                Active Customers
              </div>
            </div>
            <div className='text-left rounded-xl p-6 bg-card border-2 border-border hover:border-primary transition-colors'>
              <div className='text-4xl lg:text-5xl font-extrabold mb-3 text-foreground  tracking-tight'>
                200+
              </div>
              <div className='text-muted-foreground text-base font-medium'>
                Verified Vendors
              </div>
            </div>
            <div className='text-left rounded-xl p-6 bg-card border-2 border-border hover:border-primary transition-colors'>
              <div className='text-4xl lg:text-5xl font-extrabold mb-3 text-foreground  tracking-tight'>
                50+
              </div>
              <div className='text-muted-foreground text-base font-medium'>
                Trusted Shippers
              </div>
            </div>
            <div className='text-left rounded-xl p-6 bg-card border-2 border-border hover:border-primary transition-colors'>
              <div className='text-4xl lg:text-5xl font-extrabold mb-3 text-foreground  tracking-tight'>
                3
              </div>
              <div className='text-muted-foreground text-base font-medium'>
                Distribution Hubs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-24 bg-primary relative overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-10 left-10 w-32 h-32 bg-primary-foreground rounded-full opacity-5'></div>
          <div className='absolute bottom-10 right-10 w-48 h-48 bg-primary-foreground rounded-full opacity-3'></div>
          <div className='absolute top-1/2 left-1/3 w-24 h-24 bg-primary-foreground rounded-full opacity-5'></div>
        </div>
        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-3xl'>
            <p className='text-xs font-medium tracking-widest text-primary-foreground/70 uppercase'>
              Get started
            </p>
            <h2 className='text-4xl lg:text-6xl font-bold text-primary-foreground mb-6'>
              Ready to Get Started?
            </h2>
            <p className='text-md lg:text-lg text-primary-foreground/80 mb-10 leading-relaxed max-w-2xl'>
              Join thousands of users who trust Lazada Lite for their e-commerce
              needs. Whether you're buying, selling, or delivering, we've got
              you covered.
            </p>
            <div className='flex flex-col sm:flex-row gap-6 justify-start'>
              <Link to='/login'>
                <Button
                  size='lg'
                  variant='outline'
                  className='text-lg px-10 py-4 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-300 shadow-lg hover:shadow-xl'
                >
                  Sign In
                </Button>
              </Link>
              {/*show link according to user's role*/}
              {(!user || user.role === "customer") && (
                <Link to='/products'>
                  <Button
                    size='lg'
                    className='text-lg px-10 py-4 bg-background text-foreground hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-300'
                  >
                    Explore Products
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
