import React, { useEffect, useState } from 'react';

interface DrawAnimationProps {
    /** Whether animation is active */
    isActive: boolean;
    /** Callback when animation completes */
    onComplete: () => void;
    /** Starting element selector or coordinates */
    fromRect?: DOMRect;
    /** Target element selector or coordinates */
    toRect?: DOMRect;
}

export const DrawAnimation: React.FC<DrawAnimationProps> = ({ isActive, onComplete, fromRect, toRect }) => {
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (!isActive || !fromRect || !toRect) return;

        // Start at deck position
        const initialStyle: React.CSSProperties = {
            position: 'fixed',
            top: fromRect.top,
            left: fromRect.left,
            width: fromRect.width,
            height: fromRect.height,
            zIndex: 9999,
            transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)', // Smooth ease-out
            transform: 'scale(1) rotate(0deg)',
            opacity: 1
        };
        setStyle(initialStyle);

        // Animate to hand position
        requestAnimationFrame(() => {
            // Force reflow
            void document.body.offsetHeight;

            setStyle({
                position: 'fixed',
                top: toRect.top,
                left: toRect.left,
                width: toRect.width, // Target size might be different
                height: toRect.height,
                zIndex: 9999,
                transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                transform: 'scale(1) rotate(5deg)', // Slight rotation for natural feel
                opacity: 0 // Fade out at very end
            });
        });

        const timer = setTimeout(onComplete, 600);
        return () => clearTimeout(timer);
    }, [isActive, fromRect, toRect, onComplete]);

    // Don't render until styles are calculated to prevent FOUC (Flash of Unstyled Content)
    if (!isActive || Object.keys(style).length === 0) return null;

    return (
        <div style={style} className="pointer-events-none shadow-2xl rounded-lg overflow-hidden border-2 border-white/20">
            <img
                src="/images/card-back.png"
                alt="Card Back"
                className="w-full h-full object-cover"
            />
        </div>
    );
};
