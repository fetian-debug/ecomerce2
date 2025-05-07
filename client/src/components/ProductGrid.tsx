import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type ProductGridProps = {
  products: Product[];
  title: string;
  showFilters?: boolean;
  isLoading?: boolean;
};

const ProductGrid = ({ products, title, showFilters = false, isLoading = false }: ProductGridProps) => {
  const [sortBy, setSortBy] = useState("default");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let sorted = [...products];
    
    // Apply sorting
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => {
          const priceA = a.isOnSale && a.salePrice ? a.salePrice : a.price;
          const priceB = b.isOnSale && b.salePrice ? b.salePrice : b.price;
          return priceA - priceB;
        });
        break;
      case "price-high":
        sorted.sort((a, b) => {
          const priceA = a.isOnSale && a.salePrice ? a.salePrice : a.price;
          const priceB = b.isOnSale && b.salePrice ? b.salePrice : b.price;
          return priceB - priceA;
        });
        break;
      case "newest":
        sorted.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
        break;
      case "popular":
        sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      default:
        // Keep original order
        break;
    }
    
    // Apply filters
    if (filter !== "all") {
      if (filter === "in-stock") {
        sorted = sorted.filter(p => p.stock > 0);
      } else if (filter === "on-sale") {
        sorted = sorted.filter(p => p.isOnSale);
      }
    }
    
    setFilteredProducts(sorted);
  }, [products, sortBy, filter]);

  const renderSkeletons = () => {
    return Array(4).fill(0).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
        <Skeleton className="w-full h-48 mb-4" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    ));
  };

  return (
    <section className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>
        
        {showFilters && !isLoading && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="on-sale">On Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading 
          ? renderSkeletons()
          : filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
        }
      </div>
    </section>
  );
};

export default ProductGrid;
