import { Link } from 'react-router-dom';
import { Briefcase, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-dark-900 text-slate-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">
              Job<span className="text-brand-400">Spark</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            Connecting talented professionals with world-class companies. Find your next opportunity or your next great hire.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: '𝕏', href: '#', label: 'X' },
              { icon: 'in', href: '#', label: 'LinkedIn' },
              { icon: '⎇', href: '#', label: 'GitHub' },
            ].map((s, i) => (
              <a key={i} href={s.href} aria-label={s.label}
                className="w-9 h-9 rounded-xl bg-dark-700 hover:bg-brand-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 font-bold text-xs">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* For Job Seekers */}
        <div>
          <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
          <ul className="space-y-2.5">
            {[
              ['Browse Jobs', '/jobs'],
              ['By Category', '/categories'],
              ['My Applications', '/my-applications'],
              ['Create Account', '/register'],
            ].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="text-sm text-slate-400 hover:text-brand-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For Employers */}
        <div>
          <h4 className="text-white font-semibold mb-4">For Employers</h4>
          <ul className="space-y-2.5">
            {[
              ['Post a Job', '/admin/jobs/new'],
              ['Admin Portal', '/admin/dashboard'],
              ['Manage Listings', '/admin/jobs'],
              ['View Applications', '/admin/applications'],
            ].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="text-sm text-slate-400 hover:text-brand-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3">
            {[
              { icon: <Mail className="w-4 h-4 shrink-0 text-brand-400" />, text: 'hello@hirenest.io' },
              { icon: <Phone className="w-4 h-4 shrink-0 text-brand-400" />, text: '+1 (555) 000-0000' },
              { icon: <MapPin className="w-4 h-4 shrink-0 text-brand-400" />, text: 'San Francisco, CA' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-slate-400">{item.icon}{item.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    <div className="border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-500">© 2026 HireNest. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link>
          <Link to="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms</Link>
          <Link to="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cookies</Link>
        </div>
      </div>
    </div>
  </footer>
);
