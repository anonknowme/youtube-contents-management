'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers/ThemeProvider';

export function ThemeDrawer() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Initial tooltip logic
    useEffect(() => {
        const hasSeen = localStorage.getItem('hasSeenThemeTooltip');
        if (!hasSeen) {
            // Show after 1 second delay
            const timer1 = setTimeout(() => {
                setShowTooltip(true);
            }, 1000);

            // Hide automatically after 6 seconds
            const timer2 = setTimeout(() => {
                setShowTooltip(false);
                localStorage.setItem('hasSeenThemeTooltip', 'true');
            }, 7000);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, []);

    // Close tooltip when drawer opens
    useEffect(() => {
        if (isOpen) {
            setShowTooltip(false);
            localStorage.setItem('hasSeenThemeTooltip', 'true');
        }
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isOpen && !target.closest('#theme-drawer')) {
                setIsOpen(false);
            }
        };

        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
        <div
            id="theme-drawer"
            style={{
                position: 'fixed',
                right: 0,
                top: '20%',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                transform: isOpen ? 'translateX(0)' : 'translateX(calc(100% - 12px))', // 12px 핸들만 노출
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            {/* Handle (항상 보이는 부분) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '32px',
                    height: '48px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    borderRight: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
                    position: 'relative' // Tooltip positioning anchor
                }}
            >
                {/* Tooltip */}
                <div style={{
                    position: 'absolute',
                    right: '100%', // Position to the left of the handle
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    opacity: showTooltip ? 1 : 0,
                    marginRight: '12px',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                    🎨 테마를 바꿔보세요!
                    {/* Arrow */}
                    <div style={{
                        position: 'absolute',
                        right: '-6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderLeft: '6px solid var(--accent-primary)',
                    }} />
                </div>

                <span style={{ fontSize: '14px', lineHeight: 1 }}>
                    {isOpen ? '✕' : '🎨'}
                </span>
            </div>

            {/* Content (서랍 내용) */}
            <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '12px',
                borderBottomLeftRadius: '12px',
                border: '1px solid var(--border-primary)',
                borderRight: 'none',
                borderTop: 'none', // 핸들과의 연결을 위해
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '-4px 4px 12px rgba(0,0,0,0.1)',
                minWidth: '140px'
            }}>
                <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                    fontWeight: 600,
                    textAlign: 'center'
                }}>
                    THEME
                </div>
                {(['light', 'dark', 'cypherpunk'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTheme(t)}
                        style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid ' + (theme === t ? 'var(--accent-primary)' : 'transparent'),
                            backgroundColor: theme === t ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'var(--bg-secondary)',
                            color: theme === t ? 'var(--accent-primary)' : 'var(--text-primary)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            fontWeight: theme === t ? 700 : 400
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>
                            {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🕶️'}
                        </span>
                        <span>
                            {t === 'light' ? 'Light' : t === 'dark' ? 'Dark' : 'Cypher'}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
