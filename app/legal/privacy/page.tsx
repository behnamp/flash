'use client'
import { useRouter } from 'next/navigation'
import { IconBack, IconFlash } from '@/components/icons'

const LAST_UPDATED = 'June 25, 2026'
const COMPANY = 'Flash'
const EMAIL = 'privacy@flash-roan.vercel.app'
const APP_URL = 'https://flashcam.app'

export default function PrivacyPolicy() {
  const router = useRouter()
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #161616', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#e8ff47', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconFlash size={15} color="#0a0a0a" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Privacy Policy</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 60px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: 11, color: '#444', marginBottom: 6, letterSpacing: 0.5 }}>Last updated: {LAST_UPDATED}</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          This Privacy Policy explains how {COMPANY} ("we", "us", or "our") collects, uses, and protects your information when you use our disposable camera web application at {APP_URL}.
        </p>

        <Section title="1. Information We Collect">
          <SubSection title="Information you provide">
            <Li>Account information: email address and display name when you sign up</Li>
            <Li>Event data: event name, date, venue, and settings you configure</Li>
            <Li>Guest information: nickname and language preference when joining an event</Li>
            <Li>Payment information: processed securely by Stripe — we never store card details</Li>
            <Li>Brand/logo: optional PNG logo if you enable white-label branding</Li>
          </SubSection>
          <SubSection title="Information collected automatically">
            <Li>Photos you take through the app camera</Li>
            <Li>Device type (iOS, Android, desktop) for display optimization</Li>
            <Li>Basic usage data: which features are used, event activity</Li>
          </SubSection>
          <SubSection title="Information we do NOT collect">
            <Li>We do not collect your precise GPS location</Li>
            <Li>We do not access your device photo library</Li>
            <Li>We do not track you across other websites or apps</Li>
            <Li>We do not sell your data to third parties</Li>
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <Li>To operate the Flash app and provide the camera and gallery features</Li>
          <Li>To authenticate your account and keep it secure</Li>
          <Li>To process payments via Stripe</Li>
          <Li>To send transactional emails (account confirmation, payment receipts)</Li>
          <Li>To improve the app based on usage patterns</Li>
          <Li>To respond to support requests</Li>
        </Section>

        <Section title="3. Photo Storage">
          <P>Photos taken through Flash are uploaded to and stored on Supabase (a PostgreSQL-based cloud platform) in Canada. Photos belong to the event host and their guests. Photos are:</P>
          <Li>Stored securely in a private cloud bucket</Li>
          <Li>Only accessible to event participants via the unique event join code</Li>
          <Li>Retained as long as the event exists in our system</Li>
          <Li>Permanently deleted when the host deletes their event</Li>
          <P style={{ marginTop: 12 }}>We do not analyze, scan, or use your photos for training AI models.</P>
        </Section>

        <Section title="4. Data Sharing">
          <P>We share your data only with:</P>
          <Li><strong style={{ color: '#ccc' }}>Supabase</strong> — database and file storage (Canada)</Li>
          <Li><strong style={{ color: '#ccc' }}>Stripe</strong> — payment processing (your card data never touches our servers)</Li>
          <Li><strong style={{ color: '#ccc' }}>Vercel</strong> — app hosting and deployment</Li>
          <P style={{ marginTop: 12 }}>We do not sell, rent, or share your personal information with any advertising networks or data brokers.</P>
        </Section>

        <Section title="5. Cookies & Local Storage">
          <P>Flash uses:</P>
          <Li>Authentication cookies managed by Supabase to keep you signed in</Li>
          <Li>Browser localStorage to remember your guest session within an event (event ID, guest ID)</Li>
          <P style={{ marginTop: 12 }}>We do not use advertising cookies or third-party tracking cookies.</P>
        </Section>

        <Section title="6. Data Retention">
          <Li>Host accounts: retained until you delete your account</Li>
          <Li>Events and photos: retained until the host deletes the event</Li>
          <Li>Guest data: retained for the duration of the event</Li>
          <Li>Payment records: retained for 7 years as required by Canadian tax law</Li>
        </Section>

        <Section title="7. Your Rights">
          <P>You have the right to:</P>
          <Li>Access the personal data we hold about you</Li>
          <Li>Correct inaccurate data</Li>
          <Li>Delete your account and all associated data</Li>
          <Li>Export your event photos before deleting</Li>
          <Li>Withdraw consent at any time</Li>
          <P style={{ marginTop: 12 }}>To exercise any of these rights, email us at <a href={`mailto:${EMAIL}`} style={{ color: '#e8ff47' }}>{EMAIL}</a></P>
        </Section>

        <Section title="8. Children's Privacy">
          <P>Flash is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it immediately.</P>
        </Section>

        <Section title="9. Security">
          <P>We protect your data using:</P>
          <Li>HTTPS encryption for all data in transit</Li>
          <Li>Row-level security policies on our database</Li>
          <Li>Secure authentication via Supabase Auth</Li>
          <Li>Encrypted storage of payment-related metadata</Li>
        </Section>

        <Section title="10. Canadian Privacy Law (PIPEDA)">
          <P>Flash is based in Canada and complies with the Personal Information Protection and Electronic Documents Act (PIPEDA). We collect only the minimum personal information necessary to provide our service.</P>
        </Section>

        <Section title="11. Changes to This Policy">
          <P>We may update this Privacy Policy from time to time. We will notify registered users by email before any significant changes take effect. The "Last updated" date at the top of this page reflects the most recent revision.</P>
        </Section>

        <Section title="12. Contact Us">
          <P>For privacy questions or data requests:</P>
          <Li>Email: <a href={`mailto:${EMAIL}`} style={{ color: '#e8ff47' }}>{EMAIL}</a></Li>
          <Li>Website: <a href={APP_URL} style={{ color: '#e8ff47' }}>{APP_URL}</a></Li>
        </Section>

        <div style={{ marginTop: 40, padding: '20px', background: '#111', borderRadius: 14, border: '1px solid #1e1e1e', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
            By using Flash, you agree to this Privacy Policy.<br />
            <a href="/legal/terms" style={{ color: '#e8ff47', textDecoration: 'none' }}>View Terms of Service →</a>
          </div>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e0e0e0', marginBottom: 12, letterSpacing: -0.3 }}>{title}</h2>
      {children}
    </div>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 7, fontSize: 14, color: '#666', lineHeight: 1.6 }}>
      <span style={{ color: '#333', flexShrink: 0, marginTop: 2 }}>—</span>
      <span>{children}</span>
    </div>
  )
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 10, ...style }}>{children}</p>
}
