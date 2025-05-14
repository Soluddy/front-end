'use client';

import {useEffect, useRef, useState} from 'react';

const phrases = [
    'for open-source projects',
    'for grassroots campaigns',
    'for builders and artists',
    'for decentralized communities',
];

const MAX_LOOPS = 100;

export default function AnimatedHeading() {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [stopped, setStopped] = useState(false);
    const typingSpeedRef = useRef(70);

    useEffect(() => {
        if (loopNum >= MAX_LOOPS) {
            setStopped(true);
            return;
        }

        const current = loopNum % phrases.length;
        const fullText = phrases[current];

        const handleType = () => {
            setText(prev =>
                isDeleting ? fullText.substring(0, prev.length - 1) : fullText.substring(0, prev.length + 1)
            );

            typingSpeedRef.current = isDeleting ? 40 : 70;

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(prev => prev + 1);
            }
        };

        const timer = setTimeout(handleType, typingSpeedRef.current);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum]);

    return (
        <span
            className="inline-block font-semibold border-r-2 border-gray-800 pr-2 animate-pulse text-[22px] md:text-[30px] text-[#333]"
        >
            {text}
            {stopped && <span className="sr-only">(animation stopped)</span>}
        </span>
    );
}
