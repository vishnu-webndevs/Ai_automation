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
import BlogTagDetail from '@/templates/BlogTagDetail';
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
        const res: Record<string, any> = {};
        if (!initialData) return res;

        const first = pathArray[0];
        const second = pathArray.length > 1 ? pathArray[1] : null;
        const third = pathArray.length > 2 ? pathArray[2] : null;

        if (first === 'home' || pathArray.length === 0) {
            res['/pages/home'] = initialData;
        } else if (first === 'services') {
            if (second === 'category' && third) {
                res[`service-category-${third}`] = initialData;
            } else if (second) {
                res[`service-${second}`] = initialData;
            } else {
                res['services'] = initialData?.services || [];
                res['service-categories'] = initialData?.categories || [];
            }
        } else if (first === 'industries' && second) {
            res[`industry-${second}`] = initialData;
        } else if (first === 'use-cases' && second) {
            res[`use-case-${second}`] = initialData;
        } else if (first === 'solutions' && second) {
            res[`solution-${second}`] = initialData;
        } else if (first === 'integrations' && second) {
            res[`integration-${second}`] = initialData;
        } else if (first === 'tools' && second) {
            res[`tool-${second}`] = initialData;
        } else if (first === 'blog') {
            if (second === 'category' && third) {
                res[`blog-category-${third}`] = initialData;
            } else if (second === 'tag' && third) {
                res[`blog-tag-${third}`] = initialData;
            } else if (second && second !== 'categories') {
                res[`blog-${second}`] = initialData;
            } else {
                res['blogs'] = initialData?.blogData || null;
                res['blog-categories'] = initialData?.categories || [];
            }
        } else {
            const catchAllSlug = pathArray.join('/');
            res[`/pages/${catchAllSlug}`] = initialData;
        }

        if (initialData._extraFallbacks) {
            Object.assign(res, initialData._extraFallbacks);
        }

        return res;
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
                if (!second) return <ServiceList initialData={initialData} />;
                if (second === 'category' && third) return <ServiceCategoryDetail initialData={initialData} />;
                return <ServiceDetail initialData={initialData} />;
            
            // Industries
            case 'industries':
                if (!second) return <IndustryList initialData={initialData} />;
                return <IndustryDetail initialData={initialData} />;
                
            // Use Cases
            case 'use-cases':
                if (!second) return <UseCaseList initialData={initialData} />;
                return <UseCaseDetail initialData={initialData} />;
                
            // Blog
            case 'blog':
                if (!second) return <BlogList initialData={initialData} />;
                if (second === 'categories' && !third) return <BlogCategoryList initialData={initialData} />;
                if (second === 'category' && third) return <BlogCategoryDetail initialData={initialData} />;
                if (second === 'tag' && third) return <BlogTagDetail initialData={initialData} />;
                return <BlogDetail initialData={initialData} />;
                
            // Solutions
            case 'solutions':
                if (!second) return <SolutionList initialData={initialData} />;
                return <SolutionDetail initialData={initialData} />;
                
            // Tools
            case 'tools':
                if (!second) return <ToolsList initialData={initialData} />;
                return <ToolDetail initialData={initialData} />;
                
            // Integrations
            case 'integrations':
                if (!second) return <IntegrationList initialData={initialData} />;
                return <IntegrationDetail initialData={initialData} />;
                
            // Platform
            case 'platform':
                return <PlatformList initialData={initialData} />;
                
            // Static Pages
            case 'contact-us':
            case 'login':
            case 'signin':
            case 'signup':
            case 'style-guide':
            case 'changelog':
            case 'customers':
                return <DynamicPage initialData={initialData} slug={first} />;
                
            case 'pricing':
                return <PricingPage />;
                
            // Catch-all
            default:
                const catchAllSlug = pathArray.join('/');
                return <DynamicPage initialData={initialData} slug={catchAllSlug} />;
        }
    };

    return (
        <SWRConfig value={{ fallback }}>
            {renderContent()}
        </SWRConfig>
    );
}

export default ClientRouter;
