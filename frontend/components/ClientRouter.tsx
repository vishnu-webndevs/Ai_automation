"use client";
import React from 'react';
import { SWRConfig } from 'swr';

// Static Pages
import PricingPage from '@/pages/PricingPage';
import Customers from '@/pages/Customers';
import Changelog from '@/pages/Changelog';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import StyleGuide from '@/pages/StyleGuide';
import DynamicPage from '@/pages/DynamicPage';
import ContactPage from '@/pages/ContactPage';

// Templates
import ServiceList from '@/templates/ServiceList';
import ServiceDetail from '@/templates/ServiceDetail';
import ServiceCategoryDetail from '@/templates/ServiceCategoryDetail';
import IndustryList from '@/templates/IndustryList';
import IndustryDetail from '@/templates/IndustryDetail';
import UseCaseList from '@/templates/UseCaseList';
import UseCaseDetail from '@/templates/UseCaseDetail';
import BlogList from '@/templates/BlogList';
import BlogDetail from '@/templates/BlogDetail';
import BlogCategoryList from '@/templates/BlogCategoryList';
import BlogCategoryDetail from '@/templates/BlogCategoryDetail';
import SolutionList from '@/templates/SolutionList';
import SolutionDetail from '@/templates/SolutionDetail';
import ToolsList from '@/templates/ToolsList';
import ToolDetail from '@/templates/ToolDetail';
import IntegrationList from '@/templates/IntegrationList';
import IntegrationDetail from '@/templates/IntegrationDetail';
import PlatformList from '@/templates/PlatformList';

function ClientRouter({ slug, initialData }: { slug: string | string[]; initialData?: any }) {
    const pathArray = Array.isArray(slug) ? slug : [slug];
    
    const fallback = React.useMemo(() => {
        if (!initialData) return {};

        const first = pathArray[0];
        const second = pathArray.length > 1 ? pathArray[1] : null;
        const third = pathArray.length > 2 ? pathArray[2] : null;

        if (first === 'home' || pathArray.length === 0) {
            return { '/pages/home': initialData };
        } else if (first === 'services') {
            if (second === 'category' && third) {
                return { [`service-category-${third}`]: initialData };
            } else if (second) {
                return { [`service-${second}`]: initialData };
            } else {
                return {
                    'services': initialData?.services || [],
                    'service-categories': initialData?.categories || []
                };
            }
        } else if (first === 'industries' && second) {
            return { [`industry-${second}`]: initialData };
        } else if (first === 'use-cases' && second) {
            return { [`use-case-${second}`]: initialData };
        } else if (first === 'solutions' && second) {
            return { [`solution-${second}`]: initialData };
        } else if (first === 'integrations' && second) {
            return { [`integration-${second}`]: initialData };
        } else if (first === 'tools' && second) {
            return { [`tool-${second}`]: initialData };
        } else if (first === 'blog') {
            if (second === 'category' && third) {
                return { [`blog-category-${third}`]: initialData };
            } else if (second && second !== 'categories') {
                return { [`blog-${second}`]: initialData };
            } else {
                return {
                    'blogs': initialData?.blogData || null,
                    'blog-categories': initialData?.categories || []
                };
            }
        } else {
            const catchAllSlug = pathArray.join('/');
            return { [`/pages/${catchAllSlug}`]: initialData };
        }
    }, [initialData, pathArray]);

    const renderContent = () => {
        if (pathArray.length === 0 || pathArray[0] === 'home') {
            return <DynamicPage />;
        }

        const first = pathArray[0];
        const second = pathArray.length > 1 ? pathArray[1] : null;
        const third = pathArray.length > 2 ? pathArray[2] : null;

        // Route matching logic
        switch (first) {
            // Services
            case 'services':
                if (!second) return <ServiceList />;
                if (second === 'category' && third) return <ServiceCategoryDetail />;
                return <ServiceDetail />;
            
            // Industries
            case 'industries':
                if (!second) return <IndustryList />;
                return <IndustryDetail />;
                
            // Use Cases
            case 'use-cases':
                if (!second) return <UseCaseList />;
                return <UseCaseDetail />;
                
            // Blog
            case 'blog':
                if (!second) return <BlogList />;
                if (second === 'categories' && !third) return <BlogCategoryList />;
                if (second === 'category' && third) return <BlogCategoryDetail />;
                return <BlogDetail />;
                
            // Solutions
            case 'solutions':
                if (!second) return <SolutionList />;
                return <SolutionDetail />;
                
            // Tools
            case 'tools':
                if (!second) return <ToolsList />;
                return <ToolDetail />;
                
            // Integrations
            case 'integrations':
                if (!second) return <IntegrationList />;
                return <IntegrationDetail />;
                
            // Platform
            case 'platform':
                return <PlatformList />;
                
            // Static Pages
            case 'contact-us': return <ContactPage />;
            case 'login':
            case 'signin': return <SignIn />;
            case 'signup': return <SignUp />;
            case 'style-guide': return <StyleGuide />;
            case 'changelog': return <Changelog />;
            case 'customers': return <Customers />;
            case 'pricing': return <PricingPage />;
                
            // Catch-all
            default:
                return <DynamicPage />;
        }
    };

    return (
        <SWRConfig value={{ fallback }}>
            {renderContent()}
        </SWRConfig>
    );
}

export default ClientRouter;
