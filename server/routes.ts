import { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import {
  loginUserSchema,
  registerUserSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
} from "@shared/schema";
import MemoryStore from "memorystore";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const JWT_SECRET = process.env.JWT_SECRET || "very-secret-key-should-be-in-env";
const SESSION_SECRET = process.env.SESSION_SECRET || "very-secret-session-key";

// Configure the session store
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: SESSION_SECRET,
    })
  );

  // Create API router
  const apiRouter = Router();

  // Middleware to handle zod validation errors
  const validateRequest = (schema: any) => {
    return (req: any, res: any, next: any) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        next(error);
      }
    };
  };

  // Middleware to verify JWT
  const verifyToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ message: "Token error" });
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: "Token malformatted" });
    }
    
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      
      req.userId = decoded.id;
      next();
    });
  };

  // Auth routes
  apiRouter.post("/auth/register", validateRequest(registerUserSchema), async (req, res) => {
    try {
      // Destructure and remove confirmPassword
      const { confirmPassword, ...userData } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Return user without password and token
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  apiRouter.post("/auth/login", validateRequest(loginUserSchema), async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if user exists
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // Get current user
  apiRouter.get("/users/me", verifyToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Categories routes
  apiRouter.get("/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.get("/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Get category error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Products routes
  apiRouter.get("/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      let products;
      
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.get("/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get the category for the product
      const category = await storage.getCategoryById(product.categoryId || 0);
      
      res.json({ ...product, category });
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Cart routes
  apiRouter.get("/cart", verifyToken, async (req: any, res) => {
    try {
      const cartItems = await storage.getCartItems(req.userId);
      
      if (cartItems.length === 0) {
        return res.json({ items: [], total: 0 });
      }
      
      // Get product details for each cart item
      const productIds = cartItems.map(item => item.productId);
      const products = await storage.getProductsByIds(productIds);
      
      // Create a map for easy product lookup
      const productsMap = new Map(products.map(product => [product.id, product]));
      
      // Enhance cart items with product details and calculate total
      const enhancedItems = cartItems.map(item => {
        const product = productsMap.get(item.productId);
        if (!product) return null;
        
        const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
        
        return {
          id: item.id,
          quantity: item.quantity,
          product: {
            id: product.id,
            name: product.name,
            price,
            imageUrl: product.imageUrl,
            isOnSale: product.isOnSale,
            originalPrice: product.price,
          }
        };
      }).filter(Boolean);
      
      // Calculate total
      const total = enhancedItems.reduce((sum, item) => {
        return sum + (item.quantity * item.product.price);
      }, 0);
      
      res.json({ items: enhancedItems, total });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.post("/cart", verifyToken, validateRequest(insertCartItemSchema), async (req: any, res) => {
    try {
      const { productId, quantity } = req.body;
      
      // Check if product exists
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if already in cart
      const existingCartItem = await storage.getCartItem(req.userId, productId);
      
      if (existingCartItem) {
        // Update quantity
        const updatedCartItem = await storage.updateCartItem(
          existingCartItem.id,
          existingCartItem.quantity + quantity
        );
        return res.json(updatedCartItem);
      }
      
      // Add new item to cart
      const cartItem = await storage.createCartItem({
        userId: req.userId,
        productId,
        quantity
      });
      
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.put("/cart/:id", verifyToken, async (req: any, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedCartItem = await storage.updateCartItem(cartItemId, quantity);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedCartItem);
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.delete("/cart/:id", verifyToken, async (req: any, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const success = await storage.deleteCartItem(cartItemId);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Cart item removed" });
    } catch (error) {
      console.error("Delete cart item error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.delete("/cart", verifyToken, async (req: any, res) => {
    try {
      await storage.clearCart(req.userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Order routes
  apiRouter.get("/orders", verifyToken, async (req: any, res) => {
    try {
      const orders = await storage.getOrders(req.userId);
      
      // Enhance orders with items
      const enhancedOrders = await Promise.all(orders.map(async order => {
        const items = await storage.getOrderItems(order.id);
        return { ...order, items };
      }));
      
      res.json(enhancedOrders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.post("/orders", verifyToken, validateRequest(insertOrderSchema), async (req: any, res) => {
    try {
      const { address, total } = req.body;
      
      // Create order
      const order = await storage.createOrder({
        userId: req.userId,
        total,
        status: "pending",
        address
      });
      
      // Get cart items
      const cartItems = await storage.getCartItems(req.userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Get product details for each cart item
      const productIds = cartItems.map(item => item.productId);
      const products = await storage.getProductsByIds(productIds);
      
      // Create a map for easy product lookup
      const productsMap = new Map(products.map(product => [product.id, product]));
      
      // Create order items
      for (const item of cartItems) {
        const product = productsMap.get(item.productId);
        if (!product) continue;
        
        const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
        
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price
        });
      }
      
      // Clear cart
      await storage.clearCart(req.userId);
      
      res.status(201).json({ order });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  apiRouter.get("/orders/:id", verifyToken, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user owns the order
      if (order.userId !== req.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Get order items
      const items = await storage.getOrderItems(orderId);
      
      // Get products for each order item
      const productIds = items.map(item => item.productId);
      const products = await storage.getProductsByIds(productIds);
      
      // Create a map for easy product lookup
      const productsMap = new Map(products.map(product => [product.id, product]));
      
      // Enhance order items with product details
      const enhancedItems = items.map(item => {
        const product = productsMap.get(item.productId);
        return {
          ...item,
          product: product ? {
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl
          } : null
        };
      });
      
      res.json({ ...order, items: enhancedItems });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Mount API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
