"use client";
import React from 'react';
import NextLink from 'next/link';
import { useRouter, useParams as useNextParams, usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';

export const Link = ({ to, children, className, onClick, ...props }: any) => {
    return (
        <NextLink href={to || '#'} className={className} onClick={onClick} {...props}>
            {children}
        </NextLink>
    );
};

export const useNavigate = () => {
    const router = useRouter();
    return (path: string | number) => {
        if (typeof path === 'number') {
            if (path === -1) router.back();
        } else {
            router.push(path);
        }
    };
};

export const useParams = () => {
    const params = useNextParams();
    if (params?.slug && Array.isArray(params.slug)) {
        return { 
            ...params, 
            slug: params.slug[params.slug.length - 1], 
            '*': params.slug.join('/') 
        };
    }
    return params || {};
};

export const useLocation = () => {
    const pathname = usePathname();
    const searchParams = useNextSearchParams();
    return React.useMemo(() => ({
        pathname: pathname || '/',
        search: searchParams?.toString() ? '?' + searchParams.toString() : '',
        hash: ''
    }), [pathname, searchParams]);
};

export const useSearchParams = () => {
    const searchParams = useNextSearchParams();
    return [
        searchParams, 
        (newParams: any) => {
            // Dummy setter to prevent crash for now, since Next.js uses router.push(?...) to mutate search params
        }
    ];
};

export const BrowserRouter = ({ children }: any) => <>{children}</>;
export const Routes = ({ children }: any) => <>{children}</>;
export const Route = ({ children }: any) => <>{children}</>;
export const Navigate = ({ to }: any) => {
    const router = useRouter();
    React.useEffect(() => {
        if (to) router.replace(to);
    }, [to, router]);
    return null;
};
