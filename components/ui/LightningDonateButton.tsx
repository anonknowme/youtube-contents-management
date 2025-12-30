'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LIGHTNING_ADDRESS, DONATION_MESSAGE } from '@/lib/lightningConfig';

interface LightningDonateButtonProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'button';
}

export const LightningDonateButton = ({
    size = 'md',
    variant = 'button'
}: LightningDonateButtonProps) => {
    const [showModal, setShowModal] = useState(false);

    // 모바일 감지
    const isMobile = () => {
        if (typeof window === 'undefined') return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const handleDonate = () => {
        const lightningUrl = `lightning:${LIGHTNING_ADDRESS}`;

        if (isMobile()) {
            // 모바일: 지갑 앱 실행 시도
            window.location.href = lightningUrl;

            // 1초 후에도 페이지가 그대로면 QR 코드 표시
            setTimeout(() => {
                setShowModal(true);
            }, 1000);
        } else {
            // 데스크톱: QR 코드 모달 표시
            setShowModal(true);
        }
    };

    const sizeStyles = {
        sm: { fontSize: '14px', padding: '6px 12px', iconSize: '16px' },
        md: { fontSize: '16px', padding: '10px 20px', iconSize: '20px' },
        lg: { fontSize: '18px', padding: '12px 24px', iconSize: '24px' }
    };

    const style = sizeStyles[size];

    return (
        <>
            {variant === 'icon' ? (
                <button
                    onClick={handleDonate}
                    style={{
                        background: 'linear-gradient(135deg, #f7931a 0%, #ff9500 100%)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        boxShadow: '0 4px 12px rgba(247, 147, 26, 0.3)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(247, 147, 26, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(247, 147, 26, 0.3)';
                    }}
                    title="비트코인 후원하기"
                >
                    ⚡
                </button>
            ) : (
                <button
                    onClick={handleDonate}
                    style={{
                        background: 'linear-gradient(135deg, #f7931a 0%, #ff9500 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: style.padding,
                        fontSize: style.fontSize,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(247, 147, 26, 0.3)',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-family-base)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(247, 147, 26, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(247, 147, 26, 0.3)';
                    }}
                >
                    <span style={{ fontSize: style.iconSize }}>⚡</span>
                    후원하기
                </button>
            )}

            {/* QR Code Modal */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '20px'
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderRadius: '16px',
                            padding: '32px',
                            maxWidth: '400px',
                            width: '100%',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            textAlign: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            color: 'var(--text-primary)'
                        }}>
                            ⚡ 라이트닝 후원
                        </h2>

                        <p style={{
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                            marginBottom: '24px'
                        }}>
                            {DONATION_MESSAGE}
                        </p>

                        {/* QR Code */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            display: 'inline-block',
                            marginBottom: '20px'
                        }}>
                            <QRCodeSVG
                                value={`lightning:${LIGHTNING_ADDRESS}`}
                                size={200}
                                level="H"
                                includeMargin={false}
                            />
                        </div>

                        {/* Lightning Address */}
                        <div style={{
                            backgroundColor: 'var(--bg-secondary)',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            wordBreak: 'break-all'
                        }}>
                            <p style={{
                                fontSize: '12px',
                                color: 'var(--text-tertiary)',
                                marginBottom: '4px'
                            }}>
                                Lightning Address
                            </p>
                            <p style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                fontFamily: 'monospace'
                            }}>
                                {LIGHTNING_ADDRESS}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                            }}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
