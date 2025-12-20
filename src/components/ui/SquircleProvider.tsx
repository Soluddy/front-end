'use client';

import {ReactNode, useEffect} from 'react';
import {init} from '@squircle/core';

export default function SquircleProvider({children}: {children: ReactNode}) {
    useEffect(() => {
        void init();
    }, []);

    return <>{children}</>;
}
