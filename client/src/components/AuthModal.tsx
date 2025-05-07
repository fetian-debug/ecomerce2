import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, User, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthModal = () => {
  // Default values for auth context
  let isAuthModalOpen = false;
  let closeAuthModal = () => {};
  let login = (_username: string, _password: string) => Promise.resolve();
  let registerUser = (_data: RegisterFormValues) => Promise.resolve();
  let isLoading = false;
  let error: string | null = null;
  
  try {
    const auth = useAuth();
    isAuthModalOpen = auth.isAuthModalOpen;
    closeAuthModal = auth.closeAuthModal;
    login = auth.login;
    registerUser = auth.register;
    isLoading = auth.isLoading;
    error = auth.error;
  } catch (e) {
    console.log('Auth context not available in AuthModal');
  }
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!isAuthModalOpen) {
      // Reset forms when modal is closed
      loginForm.reset();
      registerForm.reset();
      setIsLogin(true);
    }
  }, [isAuthModalOpen, loginForm, registerForm]);

  const onLoginSubmit = (data: LoginFormValues) => {
    login(data.username, data.password);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerUser(data);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Reset error when switching forms
  };

  if (!isAuthModalOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeAuthModal}
      ></div>
      
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">{isLogin ? "Sign In" : "Create Account"}</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={closeAuthModal}
              className="text-neutral-500 hover:text-neutral-800"
            >
              <X />
            </Button>
          </div>
          
          {/* Login Form */}
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="p-6">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your username" 
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel>Password</FormLabel>
                        <a href="#" className="text-sm text-primary hover:text-primary/80">
                          Forgot Password?
                        </a>
                      </div>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Enter your password" 
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && <p className="text-destructive text-sm mb-4">{error}</p>}
                
                <Button 
                  type="submit" 
                  className="w-full mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-neutral-600">Don't have an account?</span>
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={toggleForm}
                  >
                    Create Account
                  </Button>
                </div>
                
                <div className="mt-6 flex items-center">
                  <div className="flex-1 border-t border-neutral-300"></div>
                  <div className="px-3 text-neutral-500 text-sm">OR</div>
                  <div className="flex-1 border-t border-neutral-300"></div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button variant="outline" className="w-full" type="button">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continue with Google
                  </Button>
                  
                  <Button variant="outline" className="w-full" type="button">
                    <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                    </svg>
                    Continue with Facebook
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            /* Register Form */
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="p-6">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Choose a username" 
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="Enter your email address" 
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Create a password" 
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Confirm your password" 
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && <p className="text-destructive text-sm mb-4">{error}</p>}
                
                <Button 
                  type="submit" 
                  className="w-full mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-neutral-600">Already have an account?</span>
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={toggleForm}
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;
