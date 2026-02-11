type Props = {
  isPickup: boolean;
};

function PickupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 7h16v11H4z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7V5h8v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 8h11v7H3z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 10h4l3 3v2h-7z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7" cy="17" r="1.8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="17" r="1.8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function LogisticsBadge({ isPickup }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        isPickup ? 'bg-violet-100 text-violet-800' : 'bg-sky-100 text-sky-800'
      ].join(' ')}
      title={isPickup ? 'Retiro en local' : 'Envío a domicilio'}
      aria-label={isPickup ? 'Retiro en local' : 'Envío a domicilio'}
    >
      {isPickup ? <PickupIcon /> : <DeliveryIcon />}
      {isPickup ? 'Retiro' : 'Envío'}
    </span>
  );
}
