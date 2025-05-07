import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const HeroBanner = () => {
  return (
    <div className="relative bg-neutral-900">
      <div className="relative h-[500px] md:h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1607083206968-13611e3d76db" 
            alt="Ecommerce banner with products" 
            className="w-full h-full object-cover object-center" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 to-neutral-900/30"></div>
        </div>
        <div className="relative container-custom h-full flex items-center">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Summer Collection
            </h1>
            <p className="mt-3 text-xl text-neutral-200">
              Discover the latest trends and get up to 50% off new arrivals.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button 
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="text-white border-white hover:text-neutral-200 hover:border-neutral-200"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
