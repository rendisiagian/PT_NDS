import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteProvider } from "@/contexts/SiteContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";

import HomePage from "@/pages/Home";
import AboutPage from "@/pages/About";
import ServicesPage from "@/pages/Services";
import MachinesPage from "@/pages/Machines";
import PortfolioPage from "@/pages/Portfolio";
import BlogPage from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPost";
import ContactPage from "@/pages/Contact";
import AdminLoginPage from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";

function ScrollToTop() {
    const { pathname } = useLocation();
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

function Shell({ children }) {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith("/admin");
    return (
        <>
            {!isAdmin && <PromoBanner />}
            {!isAdmin && <Navbar />}
            {children}
            {!isAdmin && <Footer />}
        </>
    );
}

export default function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <LanguageProvider>
                    <AuthProvider>
                        <SiteProvider>
                            <ScrollToTop />
                            <GoogleAnalytics />
                            <Shell>
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/about" element={<AboutPage />} />
                                    <Route path="/services" element={<ServicesPage />} />
                                    <Route path="/machines" element={<MachinesPage />} />
                                    <Route path="/portfolio" element={<PortfolioPage />} />
                                    <Route path="/blog" element={<BlogPage />} />
                                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                                    <Route path="/contact" element={<ContactPage />} />
                                    <Route path="/admin/login" element={<AdminLoginPage />} />
                                    <Route path="/admin" element={<AdminDashboard />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </Shell>
                            <Toaster />
                        </SiteProvider>
                    </AuthProvider>
                </LanguageProvider>
            </BrowserRouter>
        </div>
    );
}
