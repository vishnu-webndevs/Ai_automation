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

export const useParams = <T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T => {
    const params = useNextParams();
    if (params?.slug && Array.isArray(params.slug)) {
        return { 
            ...params, 
            slug: params.slug[params.slug.length - 1], 
            '*': params.slug.join('/') 
        } as unknown as T;
    }
    return (params || {}) as unknown as T;
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
        searchParams || new URLSearchParams(), 
        (newParams: any) => {
            // Dummy setter to prevent crash for now, since Next.js uses router.push(?...) to mutate search params
        }
    ] as any;
};

export const BrowserRouter = ({ children }: any) => <>{children}</>;
export const Routes = ({ children }: any) => <>{children}</>;
export const Route = ({ children }: any) => <>{children}</>;
export const Outlet = () => null;
export const Navigate = ({ to }: any) => {
    const router = useRouter();
    React.useEffect(() => {
        if (to) router.replace(to);
    }, [to, router]);
    return null;
};
