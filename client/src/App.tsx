import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Wholesale from "./pages/Wholesale";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyAccount from "./pages/MyAccount";
import OrderDetail from "./pages/OrderDetail";
import FAQ from "./pages/FAQ";
import Gallery from "./pages/Gallery";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminWholesale from "./pages/AdminWholesale";
import AdminCustomers from "./pages/AdminCustomers";
import AdminMessages from "./pages/AdminMessages";

function PublicRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/wholesale" component={Wholesale} />
          <Route path="/faq" component={FAQ} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/order-confirmation/:orderNumber" component={OrderConfirmation} />
          <Route path="/login" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/my-account" component={MyAccount} />
          <Route path="/order/:id" component={OrderDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function AdminRouter() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/wholesale" component={AdminWholesale} />
        <Route path="/admin/customers" component={AdminCustomers} />
        <Route path="/admin/messages" component={AdminMessages} />
      </Switch>
    </AdminLayout>
  );
}

function AppRouter() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return isAdmin ? <AdminRouter /> : <PublicRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
