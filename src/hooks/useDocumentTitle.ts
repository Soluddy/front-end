import {useEffect} from 'react';

/**
 * Hook to set the document title.
 * Only runs on mount and when title changes.
 *
 * @param title - The title to set
 */
export function useDocumentTitle(title: string) {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = title;

        return () => {
            document.title = prevTitle;
        };
    }, [title]);
}
