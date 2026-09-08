import React, { useState } from 'react';
import { AlertTriangle, FileText, Shield, RotateCcw } from 'lucide-react';

const TABS = [
  { id: 'terms', label: 'Terms of Service', icon: FileText },
  { id: 'privacy', label: 'Privacy Policy', icon: Shield },
  { id: 'refunds', label: 'Refund & Cancellation', icon: RotateCcw }
];

export default function LegalView() {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Legal</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Terms, privacy, and refund policy for UniHairShop</p>
      </div>

      <div className="card p-4 border border-amber-400/30 bg-amber-400/10 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
          <strong>Draft — pending legal review.</strong> This is a starting draft written to reflect how UniHairShop
          actually operates today. It has not been reviewed by a lawyer and should not be treated as final or
          legally binding until it has been.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 bg-black/[0.02] dark:bg-white/[0.04] p-1.5 rounded-full border border-black/5 dark:border-white/10" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="card p-5 sm:p-7 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
        {activeTab === 'terms' && (
          <>
            <h2 className="text-base font-bold text-slate-900 dark:text-white m-0">Terms of Service</h2>
            <p className="text-[11px] text-slate-400 m-0">Last updated: draft, not yet published</p>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">1. What UniHairShop Is</h3>
              <p className="m-0">UniHairShop is a platform connecting university students in Lusaka, Zambia with independent, fellow-student hair and grooming service providers ("stylists") and a small retail shop for hair-care products. UniHairShop does not employ stylists — each stylist is an independent operator who sets their own availability and pricing within the platform's tools.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">2. Accounts & Eligibility</h3>
              <p className="m-0">You must provide accurate information when creating an account, including your name, phone number, campus, and hostel. You are responsible for keeping your login credentials secure. UniHairShop is intended for currently enrolled university students in Zambia.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">3. Bookings & Stylist Verification</h3>
              <p className="m-0">A stylist only displays a "Verified" badge after submitting a student ID document that an administrator has reviewed. UniHairShop performs a manual review, not an independent background check. Booking with an unverified stylist, or meeting anyone from this platform, carries inherent personal-safety risk — see the in-app Safety Code of Conduct before your first booking.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">4. Payments</h3>
              <p className="m-0">Mobile money payments (Airtel Money, MTN Mobile Money, Zamtel Kwacha) are collected through our payment processor, PawaPay. You may also choose to pay a stylist directly in cash at the appointment ("Pay on Arrival") or a vendor directly for Pay-on-Delivery/Pickup shop orders — those payments are between you and the stylist/vendor and are never processed by UniHairShop.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">5. Vendor / Stylist Terms</h3>
              <p className="m-0">Stylists list their own services and pricing and are solely responsible for the quality and safety of the services they provide. UniHairShop deducts a platform commission of 10% plus a flat K5 fee from any amount actually collected through the platform via PawaPay before crediting a vendor's wallet — this applies only to money that passes through UniHairShop; it is never charged on cash paid directly to a stylist ("Pay on Arrival") or a vendor (Pay on Delivery/Pickup).</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">6. Prohibited Conduct</h3>
              <p className="m-0">Harassment, impersonation, sharing another user's personal information without consent, and circumventing the platform's safety or verification features are not permitted and may result in account suspension.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">7. Limitation of Liability</h3>
              <p className="m-0">UniHairShop facilitates introductions between students and independent stylists but is not a party to the service performed. To the extent permitted by Zambian law, UniHairShop's liability for any dispute arising from a booking is limited to the amount paid for that booking.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">8. Changes</h3>
              <p className="m-0">These terms may be updated as the platform evolves. Material changes will be announced in-app.</p>
            </section>
          </>
        )}

        {activeTab === 'privacy' && (
          <>
            <h2 className="text-base font-bold text-slate-900 dark:text-white m-0">Privacy Policy</h2>
            <p className="text-[11px] text-slate-400 m-0">Last updated: draft, not yet published</p>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">1. What We Collect</h3>
              <p className="m-0">Name, email, phone number, campus, and hostel/dorm location provided at signup; booking and order history; messages sent through the in-app chat; and, for stylists, an uploaded student ID document used solely for verification review. We also record basic usage events (such as signups, bookings, and orders) to understand how the platform is actually used.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">2. How Hostel/Location Data Is Used</h3>
              <p className="m-0">Your hostel and dorm details are shared only with a stylist you have an active or completed booking with, and with UniHairShop administrators for safety and support purposes. They are never made public or shared with other students.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">3. ID Documents</h3>
              <p className="m-0">A stylist's submitted ID document is visible only to platform administrators reviewing verification requests. It is not shown to customers or other stylists.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">4. Data Storage</h3>
              <p className="m-0">Data is stored with Supabase, our database and file-storage provider, using row-level access controls so users can generally only read their own data.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">5. Your Choices</h3>
              <p className="m-0">You can request account deletion or a copy of your data by contacting support through the in-app WhatsApp channel. We have not yet built a self-service data export/delete flow.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">6. Third Parties</h3>
              <p className="m-0">We do not sell personal data. Payment processing, once enabled, will be handled by a licensed Zambian payment provider under its own privacy terms, which will be linked here at that time.</p>
            </section>
          </>
        )}

        {activeTab === 'refunds' && (
          <>
            <h2 className="text-base font-bold text-slate-900 dark:text-white m-0">Refund & Cancellation Policy</h2>
            <p className="text-[11px] text-slate-400 m-0">Last updated: draft, not yet published</p>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">1. Cancelling a Booking</h3>
              <p className="m-0">You can cancel or reschedule a booking free of charge up to 12 hours before the scheduled time, per the in-app Safety Code of Conduct.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">2. Stylist No-Shows</h3>
              <p className="m-0">If a verified stylist doesn't arrive or respond for a confirmed dorm-visit booking, you can claim a no-show refund in-app. This currently reverses the booking's recorded balance; live monetary refunds depend on live payment processing being enabled.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">3. Client No-Shows</h3>
              <p className="m-0">If a customer is unreachable or not present for a confirmed appointment, the stylist may claim a no-show fee through the same in-app process.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">4. Product Orders</h3>
              <p className="m-0">Physical product orders can be cancelled before dispatch. Once real payments are enabled, a specific refund window and process for received/defective products will be published here.</p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">5. Disputes</h3>
              <p className="m-0">If you disagree with how a booking or order was resolved, contact support through the in-app WhatsApp channel and an administrator will review it.</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
