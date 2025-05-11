import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Helmet } from "react-helmet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

const checkoutSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  cardNumber: z.string().min(16, "Card number must be at least 16 digits"),
  cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cardCvv: z.string().length(3, "CVV must be 3 digits"),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// Static cart items for demo
const staticCartItems = [
  {
    id: 1,
    quantity: 2,
    product: {
      id: 101,
      name: "Wireless Headphones",
      price: 79.99,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    }
  },
  {
    id: 2,
    quantity: 1,
    product: {
      id: 102,
      name: "Smart Watch",
      price: 149.99,
      imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
    }
  },
  {
    id: 3,
    quantity: 3,
    product: {
      id: 103,
      name: "Wireless Earbuds",
      price: 59.99,
      imageUrl: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689",
    }
  }
];

// Calculate static totals
const staticCartTotal = staticCartItems.reduce(
  (sum, item) => sum + (item.product.price * item.quantity), 
  0
);
const staticShippingCost = 10.00;

const Checkout = () => {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "John Doe",
      email: "john.doe@example.com",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      cardNumber: "4111111111111111",
      cardExpiry: "12/25",
      cardCvv: "123",
      notes: "",
    },
  });
  
  return (
    <>
      <Helmet>
        <title>Checkout | ShopEase</title>
        <meta name="description" content="Complete your purchase securely. Fast shipping and easy returns." />
        <meta property="og:title" content="Checkout | ShopEase" />
        <meta property="og:description" content="Complete your purchase securely. Fast shipping and easy returns." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="bg-primary/5 py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-neutral-800">Checkout</h1>
          <p className="text-neutral-600 mt-2">
            Complete your order
          </p>
        </div>
      </div>
      
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form className="space-y-6">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                    <CardDescription>
                      Enter your shipping details to complete your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>
                      All transactions are secure and encrypted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="1234 5678 9012 3456" 
                              {...field} 
                              maxLength={16}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cardExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiration Date (MM/YY)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="MM/YY" 
                                {...field} 
                                maxLength={5}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cardCvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="123" 
                                type="password"
                                {...field} 
                                maxLength={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                      Optional notes for your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Special instructions for delivery" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Button 
                  type="button" 
                  className="w-full lg:w-auto"
                  size="lg"
                >
                  Complete Order ({formatPrice(staticCartTotal + staticShippingCost)})
                </Button>
              </form>
            </Form>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {staticCartItems.map(item => (
                  <div key={item.id} className="flex justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded bg-neutral-100 mr-4 overflow-hidden">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(staticCartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(staticShippingCost)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(staticCartTotal + staticShippingCost)}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-neutral-50 text-sm text-neutral-600 px-6 py-4 rounded-b-lg">
                <p>
                  By completing your purchase, you agree to our{' '}
                  <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{' '}
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
