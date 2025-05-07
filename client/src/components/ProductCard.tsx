import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { formatPrice, generateStarRating } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@shared/schema";

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  // Default value for cart context
  let addToCart = (_productId: number, _quantity: number) => {};
  
  try {
    const cart = useCart();
    addToCart = cart.addToCart;
  } catch (error) {
    console.log('Cart context not available in ProductCard');
  }
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const productUrl = `/products/${product.slug}`;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link href={productUrl} className="block relative">
        {product.isOnSale && (
          <div className="absolute top-2 right-2 z-10 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-2 right-2 z-10 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
            NEW
          </div>
        )}
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-48 object-contain p-4" 
        />
      </Link>
      <div className="p-4">
        <Link href={productUrl}>
          <h3 className="font-medium text-neutral-800 mb-1">{product.name}</h3>
          <div className="flex items-center mb-1">
            <div className="flex text-accent">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-[#F59E0B]">
                  {star <= Math.round(product.rating || 0) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="text-sm text-neutral-500 ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-neutral-800">
                {product.isOnSale && product.salePrice 
                  ? formatPrice(product.salePrice) 
                  : formatPrice(product.price)}
              </span>
              {product.isOnSale && product.salePrice && (
                <span className="text-sm text-neutral-500 line-through ml-2">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <Button 
              size="icon"
              className="bg-primary hover:bg-primary/90 text-white rounded-full" 
              onClick={handleAddToCart}
            >
              <ShoppingCart size={16} />
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
