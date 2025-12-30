'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LIGHTNING_ADDRESS, DONATION_MESSAGE } from '@/lib/lightningConfig';

interface LightningDonateButtonProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'button';
}

// 지원 지갑 목록
const WALLETS = [
    { name: 'Wallet of Satoshi', scheme: 'walletofsatoshi:', icon: '💰' },
    { name: 'Blink', scheme: 'blink:', icon: '⚡' },
    { name: 'Speed Wallet', scheme: 'speedwallet:', icon: '🚀' },
    { name: 'Strike', scheme: 'strike:', icon: '⚡' },
    { name: 'Zeus', scheme: 'zeusln:', icon: '⚡' },
];

export const LightningDonateButton = ({
    size = 'md',
    variant = 'button'
}: LightningDonateButtonProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleDonate = () => {
        // 모바일/데스크톱 모두 모달 표시
        setShowModal(true);
    };

    const openWallet = (scheme: string) => {
        const lightningUrl = `${scheme}lightning:${LIGHTNING_ADDRESS}`;
        window.location.href = lightningUrl;
        // 모달은 닫지 않음 - 사용자가 직접 닫거나 앱이 열리면 자동으로 백그라운드로
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

            {/* Wallet Selection Modal */}
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
                            maxWidth: '400px',
                            width: '100%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                color: 'var(--text-secondary)',
                                zIndex: 1,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            ✕
                        </button>

                        {/* Scrollable Content */}
                        <div style={{
                            padding: '32px',
                            overflowY: 'auto',
                            textAlign: 'center'
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                marginBottom: '8px',
                                color: 'var(--text-primary)',
                                paddingRight: '32px'
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

                            {/* Wallet Buttons */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                marginBottom: '24px'
                            }}>
                                {WALLETS.map((wallet) => (
                                    <button
                                        key={wallet.name}
                                        onClick={() => openWallet(wallet.scheme)}
                                        style={{
                                            backgroundColor: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            transition: 'all 0.2s ease',
                                            width: '100%'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <span style={{ fontSize: '24px' }}>{wallet.icon}</span>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            textAlign: 'left'
                                        }}>
                                            {wallet.name}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* QR Code Section */}
                            <div style={{
                                borderTop: '1px solid var(--border-secondary)',
                                paddingTop: '24px',
                                marginBottom: '20px'
                            }}>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: '16px'
                                }}>
                                    또는 QR 코드로 스캔
                                </p>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    display: 'inline-block',
                                    marginBottom: '16px'
                                }}>
                                    <QRCodeSVG
                                        value={`lightning:${LIGHTNING_ADDRESS}`}
                                        size={160}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>

                                {/* Lightning Address */}
                                <div style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    wordBreak: 'break-all'
                                }}>
                                    <p style={{
                                        fontSize: '11px',
                                        color: 'var(--text-tertiary)',
                                        marginBottom: '4px'
                                    }}>
                                        Lightning Address
                                    </p>
                                    <p style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        fontFamily: 'monospace'
                                    }}>
                                        {LIGHTNING_ADDRESS}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
