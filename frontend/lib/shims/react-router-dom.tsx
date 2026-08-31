import React from 'react';
import NextLink from 'next/link';
import { useRouter, useParams as useNextParams, usePathname } from 'next/navigation';

export const Link = React.forwardRef<HTMLAnchorElement, any>(({ to, children, className, onClick, ...props }, ref) => {
    return (
        <NextLink ref={ref} href={to || '#'} className={className} onClick={onClick} {...props}>
            {children}
        </NextLink>
    );
});
Link.displayName = 'Link';

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
    const [location, setLocation] = React.useState(() => ({
        pathname: pathname || '/',
        search: '',
        hash: ''
    }));

    React.useEffect(() => {
        setLocation({
            pathname: pathname || '/',
            search: typeof window !== 'undefined' ? window.location.search : '',
            hash: typeof window !== 'undefined' ? window.location.hash : ''
        });
    }, [pathname]);

    return location;
};

export const useSearchParams = () => {
    const [params, setParams] = React.useState<URLSearchParams>(() => new URLSearchParams());

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setParams(new URLSearchParams(window.location.search));
            const handleUrlChange = () => {
                setParams(new URLSearchParams(window.location.search));
            };
            window.addEventListener('popstate', handleUrlChange);
            return () => window.removeEventListener('popstate', handleUrlChange);
        }
    }, []);

    return [
        params,
        (newParams: any) => {}
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
