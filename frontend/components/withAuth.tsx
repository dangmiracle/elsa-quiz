// withAuth.ts
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const withAuth = (WrappedComponent: React.ComponentType) => {
    const AuthComponent = (props: any) => {
        const router = useRouter();

        useEffect(() => {
            const token = Cookies.get('token'); // Retrieve token from cookies

            if (!token) {
                router.replace('/login'); // Redirect to login if not authenticated
            }
        }, [router]);

        // If there's no token, render nothing until redirected
        const token = Cookies.get('token');
        if (!token) return null;

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
