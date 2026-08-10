'use client';

type IconProps = { size?: number };

function badge(size: number, background: string, fontSize: number, title: string, children: React.ReactNode) {
  return (
    <div
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background,
        fontSize,
        fontWeight: 700,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'Arial, Helvetica, sans-serif',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }}
    >
      {children}
    </div>
  );
}

export function MobileMoneyIcon({ size = 36 }: IconProps) {
  return badge(size, 'linear-gradient(135deg, #3CB371, #1E7F4F)', size * 0.32, 'Mobile Money', 'M');
}

export function OrangeMoneyIcon({ size = 36 }: IconProps) {
  return badge(size, 'linear-gradient(135deg, #FF9500, #EF6C00)', size * 0.26, 'Orange Money', 'OM');
}

export function StripeIcon({ size = 36 }: IconProps) {
  return badge(size, 'linear-gradient(135deg, #6772E5, #635BFF)', size * 0.34, 'Stripe', 'S');
}

export function PayPalIcon({ size = 36 }: IconProps) {
  return badge(size, 'linear-gradient(135deg, #003087, #009CDE)', size * 0.3, 'PayPal', 'P');
}