export const AIRTIME_NETWORKS = [
  { id: 'mtn', label: 'MTN' },
  { id: 'airtel', label: 'Airtel' },
  { id: 'glo', label: 'Glo' },
  { id: 'etisalat', label: '9mobile' },
];
export const DATA_NETWORKS = [
  { id: 'mtn-data', label: 'MTN' },
  { id: 'airtel-data', label: 'Airtel' },
  { id: 'glo-data', label: 'Glo' },
  { id: 'glo-sme-data', label: 'Glo SME' },
  { id: 'etisalat-data', label: '9mobile' },
];
export const CABLE_PROVIDERS = [
  { id: 'dstv', label: 'DStv' },
  { id: 'gotv', label: 'GOtv' },
  { id: 'startimes', label: 'Startimes' },
];
export const DISCOS = [
  { id: 'ibadan-electric', label: 'Ibadan (IBEDC)' },
  { id: 'ikeja-electric', label: 'Ikeja (IKEDC)' },
  { id: 'eko-electric', label: 'Eko (EKEDC)' },
  { id: 'abuja-electric', label: 'Abuja (AEDC)' },
  { id: 'kano-electric', label: 'Kano (KEDCO)' },
  { id: 'portharcourt-electric', label: 'Port Harcourt (PHED)' },
  { id: 'jos-electric', label: 'Jos (JED)' },
  { id: 'kaduna-electric', label: 'Kaduna (KAEDCO)' },
  { id: 'enugu-electric', label: 'Enugu (EEDC)' },
];
// Services whose plans are synced from the provider (admin > Plans)
export const PLAN_SERVICES = [...DATA_NETWORKS, ...CABLE_PROVIDERS];
