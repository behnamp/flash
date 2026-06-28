'use client'
import { useRouter } from 'next/navigation'
import { IconBack, IconFlash } from '@/components/icons'

const LAST_UPDATED = 'June 25, 2026'
const COMPANY = 'Flash'
const EMAIL = 'legal@flash-roan.vercel.app'
const APP_URL = 'https://flashcam.app'

export default function TermsOfService() {
  const router = useRouter()
  return (
    <main style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: '14px', paddingLeft: 18, paddingRight: 18, borderBottom: '1px solid #161616', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#e8ff47', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconFlash size={15} color="#0a0a0a" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Terms of Service</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 60px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: 11, color: '#444', marginBottom: 6, letterSpacing: 0.5 }}>Last updated: {LAST_UPDATED}</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          These Terms of Service govern your use of Flash ({APP_URL}). By using Flash, you agree to these terms. Please read them carefully.
        </p>

        <Section title="1. The Service">
          <P>Flash is a web-based disposable camera application that allows event hosts to create shared photography experiences for their guests. Features include:</P>
          <Li>Creating events with unique QR join codes</Li>
          <Li>Guests taking photos with film-style filters via their device camera</Li>
          <Li>Controlled photo reveals with multiple reveal modes</Li>
          <Li>Shared galleries accessible to all event participants</Li>
          <Li>Photo mode effects, scavenger hunts, guest books, and more</Li>
        </Section>

        <Section title="2. Accounts">
          <Li>You must be at least 13 years old to create an account</Li>
          <Li>You are responsible for maintaining the security of your account and password</Li>
          <Li>You may not share your account credentials with others</Li>
          <Li>You must provide accurate information when creating your account</Li>
          <Li>We reserve the right to terminate accounts that violate these terms</Li>
        </Section>

        <Section title="3. Payments & Refunds">
          <SubSection title="Pricing">
            <P>Flash charges a one-time fee per event based on the number of guests:</P>
            <Li>Starter (≤10 guests): $1.99 CAD</Li>
            <Li>Small (≤25 guests): $4.99 CAD</Li>
            <Li>Medium (≤50 guests): $9.99 CAD</Li>
            <Li>Large (≤100 guests): $14.99 CAD</Li>
            <Li>XL (≤200 guests): $29.99 CAD</Li>
            <Li>Unlimited: $99.99 CAD</Li>
          </SubSection>
          <SubSection title="Refund Policy">
            <P>We offer refunds in the following circumstances:</P>
            <Li>Technical failure that prevents event creation or camera access — full refund</Li>
            <Li>Duplicate accidental purchase within 24 hours — full refund</Li>
            <Li>Event cancelled before any guests join — full refund within 7 days</Li>
            <P style={{ marginTop: 8 }}>No refunds are issued for events where guests have already joined and taken photos. To request a refund, contact <a href={`mailto:${EMAIL}`} style={{ color: '#e8ff47' }}>{EMAIL}</a> within 30 days of purchase.</P>
          </SubSection>
          <SubSection title="Payment Processing">
            <P>All payments are processed by Stripe. We do not store credit card information. By making a payment, you agree to <a href="https://stripe.com/legal" target="_blank" rel="noopener" style={{ color: '#e8ff47' }}>Stripe's Terms of Service</a>.</P>
          </SubSection>
        </Section>

        <Section title="4. Content & Photos">
          <SubSection title="Your content">
            <P>You retain full ownership of all photos taken through Flash. By using Flash, you grant us a limited licence to store and display your photos solely for the purpose of providing the service to your event participants.</P>
          </SubSection>
          <SubSection title="Content rules">
            <P>You may not use Flash to create, share, or distribute:</P>
            <Li>Illegal content of any kind</Li>
            <Li>Content that exploits or harms minors</Li>
            <Li>Non-consensual intimate imagery</Li>
            <Li>Content that harasses, threatens, or defames others</Li>
            <Li>Content that violates intellectual property rights</Li>
          </SubSection>
          <SubSection title="Content moderation">
            <P>We reserve the right to remove any content that violates these terms and to terminate the accounts of repeat violators. We do not proactively monitor photos but will act on reports.</P>
          </SubSection>
        </Section>

        <Section title="5. Event Hosts">
          <P>As an event host, you are responsible for:</P>
          <Li>Ensuring all guests consent to being photographed</Li>
          <Li>Complying with applicable privacy laws regarding photos of others</Li>
          <Li>Not sharing your event join code beyond your intended guests</Li>
          <Li>The content uploaded by guests at your event</Li>
          <Li>Deleting events and photos when no longer needed</Li>
        </Section>

        <Section title="6. Guest Participation">
          <P>By joining a Flash event as a guest, you:</P>
          <Li>Consent to your photos being visible to other event participants after the reveal</Li>
          <Li>Understand your nickname will be associated with your photos</Li>
          <Li>Agree not to photograph anyone without their consent</Li>
          <Li>Accept that the host controls when and how photos are revealed</Li>
        </Section>

        <Section title="7. Promo Codes">
          <Li>Promo codes are non-transferable and may only be used by the assigned recipient</Li>
          <Li>One promo code per event purchase</Li>
          <Li>Flash reserves the right to cancel promo codes that are misused or shared publicly</Li>
          <Li>Free promo codes have no cash value and cannot be exchanged for money</Li>
        </Section>

        <Section title="8. Prohibited Use">
          <P>You may not:</P>
          <Li>Use Flash for any illegal purpose</Li>
          <Li>Attempt to reverse engineer, copy, or reproduce the Flash application</Li>
          <Li>Use automated tools to access the service (bots, scrapers)</Li>
          <Li>Interfere with the security or integrity of the service</Li>
          <Li>Create events for the purpose of collecting data about others without consent</Li>
          <Li>Resell or sublicense access to Flash without prior written permission</Li>
        </Section>

        <Section title="9. Intellectual Property">
          <P>The Flash application, its design, logo, and codebase are owned by Flash and protected by copyright. The Flash lightning bolt mark and brand identity may not be used without permission.</P>
          <P style={{ marginTop: 8 }}>You retain ownership of all photos you take. We make no claim to your content.</P>
        </Section>

        <Section title="10. Disclaimers">
          <P>Flash is provided "as is" without warranties of any kind. We do not guarantee:</P>
          <Li>Uninterrupted or error-free service</Li>
          <Li>That photos will be preserved indefinitely</Li>
          <Li>Compatibility with all devices or browsers</Li>
          <P style={{ marginTop: 8 }}>We strongly recommend downloading important event photos promptly after your event reveal.</P>
        </Section>

        <Section title="11. Limitation of Liability">
          <P>To the maximum extent permitted by law, Flash shall not be liable for:</P>
          <Li>Loss of photos due to technical failures</Li>
          <Li>Indirect, incidental, or consequential damages</Li>
          <Li>Content uploaded by event guests</Li>
          <P style={{ marginTop: 8 }}>Our total liability to you shall not exceed the amount you paid for the specific event in question.</P>
        </Section>

        <Section title="12. Governing Law">
          <P>These Terms are governed by the laws of the Province of Ontario, Canada. Any disputes shall be resolved in the courts of Ontario, Canada.</P>
        </Section>

        <Section title="13. Changes to Terms">
          <P>We may update these Terms from time to time. Continued use of Flash after changes constitutes acceptance of the new terms. We will notify registered hosts by email of any material changes at least 14 days before they take effect.</P>
        </Section>

        <Section title="14. Contact">
          <P>For legal questions or concerns:</P>
          <Li>Email: <a href={`mailto:${EMAIL}`} style={{ color: '#e8ff47' }}>{EMAIL}</a></Li>
          <Li>Website: <a href={APP_URL} style={{ color: '#e8ff47' }}>{APP_URL}</a></Li>
        </Section>

        <div style={{ marginTop: 40, padding: '20px', background: '#111', borderRadius: 14, border: '1px solid #1e1e1e', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
            By using Flash, you agree to these Terms of Service.<br />
            <a href="/legal/privacy" style={{ color: '#e8ff47', textDecoration: 'none' }}>View Privacy Policy →</a>
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
