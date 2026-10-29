import {
  Body, Container, Head, Html, Img, Preview, Section, Tailwind,
} from '@react-email/components';

/**
 * Shared chrome for every mobileDrive email: dark background, centered column,
 * MD logo header, and a muted footer. Children fill the body section.
 *
 * `preview` is the one-liner that shows next to the subject in Gmail's inbox
 * list — set it per template to something more useful than "..."
 */
export function EmailLayout({
  preview,
  siteUrl,
  children,
}: {
  preview: string;
  siteUrl: string;
  children: React.ReactNode;
}) {
  const logoUrl = `${siteUrl}/logo-light.png`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="m-0 bg-[#07080A] p-0 font-sans text-[#EEF0F3]">
          <Container className="mx-auto my-10 max-w-[560px] rounded-2xl border border-white/10 bg-[#0C0E12] p-8">
            <Section className="mb-6">
              <Img
                src={logoUrl}
                width="140"
                height="62"
                alt="mobileDrive"
                className="h-auto"
              />
            </Section>
            {children}
            <Section className="mt-10 border-t border-white/10 pt-5 text-[11px] text-white/50">
              mobileDrive · Accra, Ghana ·{' '}
              <a href={siteUrl} className="text-white/70 underline">
                {siteUrl.replace(/^https?:\/\//, '')}
              </a>
              <br />
              You received this because you have an account with mobileDrive.
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
