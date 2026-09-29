import Link from 'next/link';
import { ShieldCheck, Smartphone, Tv, Wifi, Zap, RefreshCcw, BadgePercent } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

const services = [
  { icon: Smartphone, title: 'Airtime', text: 'Top up MTN, Airtel, Glo and 9mobile.' },
  { icon: Wifi, title: 'Data', text: 'Affordable data bundles for every network.' },
  { icon: Tv, title: 'Cable TV', text: 'Renew DStv, GOtv and Startimes.' },
  { icon: Zap, title: 'Electricity', text: 'Buy prepaid tokens or pay postpaid bills.' },
];
const perks = [
  { icon: Zap, title: 'Instant delivery', text: 'Automated processing, no waiting around.' },
  { icon: ShieldCheck, title: 'Secure wallet', text: 'Fund once, pay for anything in seconds.' },
  { icon: RefreshCcw, title: 'Auto refunds', text: 'Failed transactions go straight back to your wallet.' },
  { icon: BadgePercent, title: 'Agent prices', text: 'Resell for less and earn on every sale.' },
];

export default function Home() {
  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost">Log in</Link>
          <Link href="/register" className="btn btn-primary hidden sm:inline-flex">Get started</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-24">
        <span className="rounded-full bg-sun-400/30 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:text-sun-300">
          Fast · Secure · Affordable
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Airtime, data & bills, <span className="text-brand-600 dark:text-brand-300">all in one hub.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Top up, subscribe and pay your bills in seconds from your phone or computer, any time, anywhere.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="btn btn-gold !px-7 !py-3.5 text-base">Create free account</Link>
          <Link href="/login" className="btn btn-ghost !px-7 !py-3.5 text-base">I have an account</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card">
            <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-sun-400"><Icon size={22} /></span>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-14 grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {perks.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <Icon className="mt-0.5 shrink-0 text-gold" size={22} />
            <div><h4 className="font-semibold">{title}</h4><p className="text-sm text-muted">{text}</p></div>
          </div>
        ))}
      </section>

      <footer className="mt-20 border-t border-line py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} Isrealight Data Hub. All rights reserved.
      </footer>
    </div>
  );
}
