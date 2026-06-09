import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { MessageSquareShare, Camera, Video, Users } from 'lucide-react';
import logo from '../../assets/logo.png';

const footerSections = [
  {
    labelKey: 'footer.sections.adopt',
    links: [
      { key: 'footer.links.adopt', href: '/pets' },
      { key: 'footer.links.adopted', href: '/pets/adopted', label: 'Adopted' },
      { key: 'footer.links.guides', href: '/guides', label: 'Guides' },
      { key: 'footer.links.donate', href: '/donate', label: 'Donate' },
    ],
  },
  {
    labelKey: 'footer.sections.company',
    links: [
      { key: 'footer.links.about', href: '/about', label: 'About' },
      { key: 'footer.links.contact', href: '/contact', label: 'Contact' },
      { key: 'footer.links.privacy', href: '/privacy', label: 'Privacy' },
      { key: 'footer.links.terms', href: '/terms', label: 'Terms' },
    ],
  },
  {
    labelKey: 'footer.sections.resources',
    links: [
      { key: 'footer.links.guides', href: '/guides', label: 'Guides' },
      { key: 'footer.links.doctors', href: '/doctors', label: 'Vets' },
      { key: 'footer.links.swipe', href: '/swipe', label: 'Swipe' },
      { key: 'footer.links.help', href: '/help', label: 'Help' },
    ],
  },
  {
    labelKey: 'footer.sections.social',
    links: [
      { title: 'Facebook', href: '#', icon: MessageSquareShare },
      { title: 'Instagram', href: '#', icon: Camera },
      { title: 'Youtube', href: '#', icon: Video },
      { title: 'LinkedIn', href: '#', icon: Users },
    ],
  },
];

const sectionLabels = {
  'footer.sections.adopt': 'Adoption',
  'footer.sections.company': 'Company',
  'footer.sections.resources': 'Resources',
  'footer.sections.social': 'Social Links',
  'footer.links.adopt': 'Adopt',
  'footer.links.adopted': 'Adopted Pets',
  'footer.links.guides': 'Guides',
  'footer.links.donate': 'Donate',
  'footer.links.about': 'About',
  'footer.links.contact': 'Contact',
  'footer.links.privacy': 'Privacy Policy',
  'footer.links.terms': 'Terms of Service',
  'footer.links.doctors': 'Veterinarians',
  'footer.links.swipe': 'Swipe Mode',
  'footer.links.help': 'Help Center',
};

function AnimatedContainer({ className, delay = 0.1, children }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function FooterSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <footer className="bg-[#0D0D0D] px-8 md:px-16 py-16 lg:py-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        <div className="grid w-full gap-8 lg:grid-cols-3 lg:gap-12">
          <AnimatedContainer className="space-y-4">
            <img src={logo} alt="Nino" className="h-10 w-auto brightness-0 invert" />
            <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </AnimatedContainer>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-2">
            {footerSections.map((section, index) => (
              <AnimatedContainer key={section.labelKey} delay={0.1 + index * 0.1}>
                <div>
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                    {t(section.labelKey, sectionLabels[section.labelKey])}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((link) => {
                      const label = link.title || t(link.key, sectionLabels[link.key] || link.label);
                      return (
                        <li key={link.key || link.title}>
                          {link.href.startsWith('/') ? (
                            <Link
                              to={link.href}
                              className="text-white/40 hover:text-white inline-flex items-center gap-2 text-sm transition-all duration-300"
                            >
                              {link.icon && <link.icon className="size-4" />}
                              {label}
                            </Link>
                          ) : (
                            <a
                              href={link.href}
                              className="text-white/40 hover:text-white inline-flex items-center gap-2 text-sm transition-all duration-300"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.icon && <link.icon className="size-4" />}
                              {label}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </AnimatedContainer>
            ))}
          </div>
        </div>

        <AnimatedContainer delay={0.5}>
          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-sm">
              {t('footer.copyright')}
            </p>
            <p className="text-white/30 text-sm">
              {t('footer.made_with')}
            </p>
          </div>
        </AnimatedContainer>
      </div>
    </footer>
  );
}
