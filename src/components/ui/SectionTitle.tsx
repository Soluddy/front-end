import {useEffect, useState} from "react";
import Image from "next/image";

interface SectionTitleProps {
    text: string,
    id?: string
}

export default function SectionTitle({text, id}: SectionTitleProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div id={id} className="max-w-5xl mx-auto mt-[60px] px-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Image
                    src="/soluddy-icon.svg"
                    alt="Section icon"
                    width={58.69}
                    height={51.34}
                    className="mx-auto sm:mx-0"
                />
                <h2
                    className={`text-[36px] font-semibold text-[#333333] w-full sm:w-auto text-center sm:text-left transition-all transform duration-700 ease-out ${
                        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
                    }`}
                >
                    {text}
                </h2>
            </div>
        </div>
    );
}
