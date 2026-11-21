import Link from "next/link";
import { Trophy, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-[#1F1F1F] text-[#888888] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A] font-black text-lg shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                <Trophy className="w-4 h-4 fill-current" />
              </div>
              <span className="font-extrabold tracking-tight text-white text-lg uppercase font-[family-name:var(--font-space-grotesk)]">
                The Champions <span className="text-[#CCFF00]">Club</span>
              </span>
            </Link>
            <p className="text-xs text-[#888888] leading-relaxed max-w-sm mb-6">
              The unified digital platform and premier physical sporting destination for Tennis, Padel, Badminton, and Cricket Nets. Built for athletes who demand excellence.
            </p>
            <div className="text-[11px] text-[#555555]">
              IST Timezone · GST Compliant · DPDP Act Data Privacy
            </div>
          </div>

          {/* Sports */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Our Sports
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#sports" className="hover:text-[#CCFF00] transition-colors">Championship Tennis</a></li>
              <li><a href="#sports" className="hover:text-[#CCFF00] transition-colors">Panoramic Padel</a></li>
              <li><a href="#sports" className="hover:text-[#CCFF00] transition-colors">Indoor Badminton</a></li>
              <li><a href="#sports" className="hover:text-[#CCFF00] transition-colors">Cricket Bowling Nets</a></li>
              <li><a href="#bar" className="hover:text-[#CCFF00] transition-colors">Friday Social Nights</a></li>
            </ul>
          </div>

          {/* Memberships & Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Club Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/register?plan=gold" className="hover:text-[#CCFF00] transition-colors">Gold Champion Plan</Link></li>
              <li><Link href="/register?plan=silver" className="hover:text-[#CCFF00] transition-colors">Silver Standard Plan</Link></li>
              <li><Link href="/register?plan=junior" className="hover:text-[#CCFF00] transition-colors">Junior Prodigy Plan</Link></li>
              <li><a href="#shop" className="hover:text-[#CCFF00] transition-colors">Pro Gear Store</a></li>
              <li><a href="#bar" className="hover:text-[#CCFF00] transition-colors">Clubhouse Bar & Kitchen</a></li>
            </ul>
          </div>

          {/* Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/register" className="inline-flex items-center gap-1 hover:text-[#CCFF00] transition-colors">
                  <span>Register Online</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <a href="#availability" className="hover:text-[#CCFF00] transition-colors">
                  Check Slot Engine
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#CCFF00] transition-colors">
                  Front Desk Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 border-t border-[#1F1F1F] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#555555]">
          <div>
            © {new Date().getFullYear()} The Champions Club Management System. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Terms of Play</span>
            <span>Cancellation Policy</span>
            <span>DPDP Privacy Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
