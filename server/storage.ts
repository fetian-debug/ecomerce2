import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  cartItems, type CartItem, type InsertCartItem
} from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByIds(ids: number[]): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Order operations
  getOrders(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Order Item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(userId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private cartItems: Map<number, CartItem>;
  
  private userId: number;
  private categoryId: number;
  private productId: number;
  private orderId: number;
  private orderItemId: number;
  private cartItemId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.cartItemId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Create sample categories
    const categories: InsertCategory[] = [
      { name: "Electronics", slug: "electronics", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9" },
      { name: "Fashion", slug: "fashion", imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5" },
      { name: "Home & Living", slug: "home-living", imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6" },
      { name: "Beauty", slug: "beauty", imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b" }
    ];
    
    categories.forEach(category => this.createCategory(category));
    
    // Create sample products
    const products: InsertProduct[] = [
      {
        name: "Wireless Headphones",
        slug: "wireless-headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 79.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        stock: 50,
        categoryId: 1,
        isOnSale: true,
        salePrice: 59.99,
        isNew: false
      },
      {
        name: "Smart Watch",
        slug: "smart-watch",
        description: "Advanced smartwatch with health tracking features",
        price: 149.99,
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
        stock: 30,
        categoryId: 1,
        isOnSale: false,
        salePrice: null,
        isNew: false
      },
      {
        name: "Smartphone Pro",
        slug: "smartphone-pro",
        description: "Latest smartphone with advanced camera and long battery life",
        price: 899.99,
        imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd",
        stock: 20,
        categoryId: 1,
        isOnSale: false,
        salePrice: null,
        isNew: false
      },
      {
        name: "Wireless Earbuds",
        slug: "wireless-earbuds",
        description: "Comfortable wireless earbuds with crystal clear sound",
        price: 59.99,
        imageUrl: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689",
        stock: 100,
        categoryId: 1,
        isOnSale: false,
        salePrice: null,
        isNew: true
      },
      {
        name: "Red Sneakers",
        slug: "red-sneakers",
        description: "Stylish and comfortable red sneakers for everyday wear",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        stock: 45,
        categoryId: 2,
        isOnSale: false,
        salePrice: null,
        isNew: false
      },
      {
        name: "Digital Camera",
        slug: "digital-camera",
        description: "Professional digital camera with high resolution sensor",
        price: 599.99,
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
        stock: 15,
        categoryId: 1,
        isOnSale: true,
        salePrice: 499.99,
        isNew: false
      },
      {
        name: "Laptop Pro",
        slug: "laptop-pro",
        description: "Powerful laptop for professionals and creators",
        price: 1299.99,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        stock: 10,
        categoryId: 1,
        isOnSale: false,
        salePrice: null,
        isNew: false
      },
      {
        name: "Travel Backpack",
        slug: "travel-backpack",
        description: "Durable backpack with multiple compartments for travel",
        price: 99.99,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
        stock: 60,
        categoryId: 2,
        isOnSale: true,
        salePrice: 79.99,
        isNew: false
      }
   ,
        // Electronics (continued)
        {
          name: "Bluetooth Speaker",
          slug: "bluetooth-speaker",
          description: "Portable waterproof speaker with 20hr battery life",
          price: 129.99,
          imageUrl: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb",
          stock: 35,
          categoryId: 1,
          isOnSale: true,
          salePrice: 99.99,
          isNew: false
        },
        {
          name: "Fitness Tracker",
          slug: "fitness-tracker",
          description: "Track steps, heart rate, and sleep patterns",
          price: 79.99,
          imageUrl: "https://images.unsplash.com/photo-1585123388860-6e79dc0f6230",
          stock: 40,
          categoryId: 1,
          isOnSale: false,
          salePrice: null,
          isNew: true
        },
        {
          name: "Tablet",
          slug: "tablet",
          description: "10-inch tablet with high-resolution display",
          price: 349.99,
          imageUrl: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7",
          stock: 18,
          categoryId: 1,
          isOnSale: false,
          salePrice: null,
          isNew: false
        },
      
        // Fashion (continued)
        {
          name: "Leather Belt",
          slug: "leather-belt",
          description: "Genuine leather belt with stainless steel buckle",
          price: 49.99,
          imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea",
          stock: 55,
          categoryId: 2,
          isOnSale: false,
          salePrice: null,
          isNew: false
        },
        {
          name: "Winter Coat",
          slug: "winter-coat",
          description: "Waterproof insulated coat for extreme cold",
          price: 199.99,
          imageUrl: "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d",
          stock: 25,
          categoryId: 2,
          isOnSale: true,
          salePrice: 159.99,
          isNew: false
        },
        {
          name: "Silk Scarf",
          slug: "silk-scarf",
          description: "Luxury silk scarf with elegant pattern",
          price: 69.99,
          imageUrl: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9",
          stock: 30,
          categoryId: 2,
          isOnSale: false,
          salePrice: null,
          isNew: true
        },
      
        // Home & Kitchen
        {
          name: "Non-Stick Pan Set",
          slug: "non-stick-pan-set",
          description: "3-piece ceramic non-stick cookware set",
          price: 89.99,
          imageUrl: "https://images.unsplash.com/photo-1583778176476-4a8b02b64e01",
          stock: 22,
          categoryId: 3,
          isOnSale: false,
          salePrice: null,
          isNew: false
        },
        {
          name: "Smart Lighting Kit",
          slug: "smart-lighting-kit",
          description: "Color-changing LED bulbs with app control",
          price: 129.99,
          imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e616d",
          stock: 15,
          categoryId: 3,
          isOnSale: true,
          salePrice: 99.99,
          isNew: false
        },
        {
          name: "Robot Vacuum",
          slug: "robot-vacuum",
          description: "Self-charging robot vacuum with smart mapping",
          price: 399.99,
          imageUrl: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd",
          stock: 12,
          categoryId: 3,
          isOnSale: false,
          salePrice: null,
          isNew: true
        },
      
        // Beauty & Personal Care
        {
          name: "Electric Toothbrush",
          slug: "electric-toothbrush",
          description: "Sonic toothbrush with 3 cleaning modes",
          price: 79.99,
          imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2",
          stock: 40,
          categoryId: 4,
          isOnSale: false,
          salePrice: null,
          isNew: false
        },
        {
          name: "Hair Dryer",
          slug: "hair-dryer",
          description: "Professional ionic hair dryer with diffuser",
          price: 59.99,
          imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
          stock: 28,
          categoryId: 4,
          isOnSale: true,
          salePrice: 49.99,
          isNew: false
        },
        {
          name: "Makeup Mirror",
          slug: "makeup-mirror",
          description: "LED vanity mirror with magnification",
          price: 89.99,
          imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
          stock: 20,
          categoryId: 4,
          isOnSale: false,
          salePrice: null,
          isNew: true
        },
      
        // Sports & Outdoors
        {
          name: "Camping Tent",
          slug: "camping-tent",
          description: "4-person waterproof tent with rainfly",
          price: 199.99,
          imageUrl: "https://images.unsplash.com/photo-1537905569824-f89f14cceb68",
          stock: 18,
          categoryId: 5,
          isOnSale: false,
          salePrice: null,
          isNew: false
        },
        {
          name: "Mountain Bike",
          slug: "mountain-bike",
          description: "21-speed aluminum frame mountain bike",
          price: 599.99,
          imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
          stock: 8,
          categoryId: 5,
          isOnSale: true,
          salePrice: 549.99,
          isNew: false
        },
        {
          name: "Fitness Dumbbells",
          slug: "fitness-dumbbells",
          description: "Adjustable weight set (5-25 lbs per dumbbell)",
          price: 149.99,
          imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
          stock: 25,
          categoryId: 5,
          isOnSale: false,
          salePrice: null,
          isNew: true
        },
      
        // Toys & Games
        {
          name: "Drone with Camera",
          slug: "drone-with-camera",
          description: "4K camera drone with 30min flight time",
          price: 299.99,
          imageUrl: "https://images.unsplash.com/photo-1579829366248-204fe8413f31",
          stock: 15,
          categoryId: 6,
          isOnSale: false,
          salePrice: null,
          isNew: false
        },
        {
          name: "Building Blocks Set",
          slug: "building-blocks-set",
          description: "250-piece creative construction set",
          price: 39.99,
          imageUrl: "https://images.unsplash.com/photo-1594787319145-948796f1369e",
          stock: 50,
          categoryId: 6,
          isOnSale: true,
          salePrice: 29.99,
          isNew: false
        },
        {
          name: "RC Car",
          slug: "rc-car",
          description: "1:10 scale remote control car with 2.4GHz controller",
          price: 89.99,
          imageUrl: "https://images.unsplash.com/photo-1589254065909-b7086229d08c",
          stock: 30,
          categoryId: 6,
          isOnSale: false,
          salePrice: null,
          isNew: true
        }
      
    ];
    
    products.forEach(product => this.createProduct(product));
    
    // Create sample user (admin)
    this.createUser({
      username: "admin",
      password: "$2b$10$XvQAFjafkxqOj6d5KcEZYe1h9kGX0G3JM2g2O5jK5g3XfynC6QN3i", // "password123"
      email: "admin@shopease.com",
      fullName: "Admin User",
      address: "123 Admin St, Admin City, AC 12345"
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, isAdmin: false };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.slug === slug);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === categoryId);
  }
  
  async getProductsByIds(ids: number[]): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => ids.includes(product.id));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { 
      ...product, 
      id, 
      rating: 4.5, 
      reviewCount: Math.floor(Math.random() * 200) + 1 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const date = new Date();
    const newOrder: Order = { ...order, id, createdAt: date };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }
  
  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.productId === productId
    );
  }
  
  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const cartItemsToRemove = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    for (const item of cartItemsToRemove) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }
}

// PostgreSQL Storage Implementation
export class PgStorage implements IStorage {
  private db: any;
  
  constructor(db: any) {
    this.db = db;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values({
      ...user,
      isAdmin: false
    }).returning();
    return result[0];
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return this.db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(category).returning();
    return result[0];
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return this.db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return result[0];
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async getProductsByIds(ids: number[]): Promise<Product[]> {
    return this.db.select().from(products).where(inArray(products.id, ids));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await this.db.insert(products).values({
      ...product,
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 200) + 1
    }).returning();
    return result[0];
  }

  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    return this.db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const result = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await this.db.insert(orders).values(order).returning();
    return result[0];
  }

  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await this.db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return this.db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    const result = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
      .limit(1);
    return result[0];
  }

  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const result = await this.db.insert(cartItems).values(cartItem).returning();
    return result[0];
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const result = await this.db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return result[0];
  }

  async deleteCartItem(id: number): Promise<boolean> {
    await this.db.delete(cartItems).where(eq(cartItems.id, id));
    return true;
  }

  async clearCart(userId: number): Promise<boolean> {
    await this.db.delete(cartItems).where(eq(cartItems.userId, userId));
    return true;
  }
}

// Create a common storage instance that we can switch between implementations
// MongoDB Storage Implementation
export class MongoDbStorage implements IStorage {
  private client: any;
  
  constructor(client: any) {
    this.client = client;
  }

  private getCollection(name: string) {
    return this.client.db('ecommerce').collection(name);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.getCollection('users').findOne({ id });
    return result || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.getCollection('users').findOne({ username });
    return result || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.getCollection('users').findOne({ email });
    return result || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = { 
      ...user, 
      id: await this.getNextId('users'),
      isAdmin: false 
    };
    await this.getCollection('users').insertOne(newUser);
    return newUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return this.getCollection('categories').find().toArray();
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await this.getCollection('categories').findOne({ id });
    return result || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await this.getCollection('categories').findOne({ slug });
    return result || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = { 
      ...category, 
      id: await this.getNextId('categories') 
    };
    await this.getCollection('categories').insertOne(newCategory);
    return newCategory;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return this.getCollection('products').find().toArray();
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const result = await this.getCollection('products').findOne({ id });
    return result || undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await this.getCollection('products').findOne({ slug });
    return result || undefined;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.getCollection('products').find({ categoryId }).toArray();
  }

  async getProductsByIds(ids: number[]): Promise<Product[]> {
    return this.getCollection('products').find({ id: { $in: ids } }).toArray();
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = { 
      ...product, 
      id: await this.getNextId('products'),
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 200) + 1
    };
    await this.getCollection('products').insertOne(newProduct);
    return newProduct;
  }

  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    return this.getCollection('orders').find({ userId }).toArray();
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const result = await this.getCollection('orders').findOne({ id });
    return result || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder = { 
      ...order, 
      id: await this.getNextId('orders'),
      createdAt: new Date()
    };
    await this.getCollection('orders').insertOne(newOrder);
    return newOrder;
  }

  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.getCollection('orderItems').find({ orderId }).toArray();
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const newOrderItem = { 
      ...orderItem, 
      id: await this.getNextId('orderItems') 
    };
    await this.getCollection('orderItems').insertOne(newOrderItem);
    return newOrderItem;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return this.getCollection('cartItems').find({ userId }).toArray();
  }

  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    const result = await this.getCollection('cartItems').findOne({ userId, productId });
    return result || undefined;
  }

  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const newCartItem = { 
      ...cartItem, 
      id: await this.getNextId('cartItems') 
    };
    await this.getCollection('cartItems').insertOne(newCartItem);
    return newCartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const result = await this.getCollection('cartItems').findOneAndUpdate(
      { id },
      { $set: { quantity } },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    const result = await this.getCollection('cartItems').deleteOne({ id });
    return result.deletedCount > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await this.getCollection('cartItems').deleteMany({ userId });
    return result.deletedCount > 0;
  }

  // Helper method to get the next ID for a collection
  private async getNextId(collectionName: string): Promise<number> {
    // Get counters collection
    const countersCollection = this.client.db('ecommerce').collection('counters');
    
    // Update the counter or create it if it doesn't exist
    const result = await countersCollection.findOneAndUpdate(
      { _id: collectionName },
      { $inc: { sequence_value: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    
    return result.sequence_value;
  }
}

export let storage: IStorage = new MemStorage();
