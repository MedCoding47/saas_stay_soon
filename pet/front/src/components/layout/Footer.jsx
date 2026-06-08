import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#0D0D0D] px-8 md:px-16 py-20">
      <div className="max-w-6xl mx-auto">
        <div>
          <img src={logo} alt="Nino" className="h-8 w-auto object-contain brightness-0 invert" />
        </div>
        <p className="text-white/40 text-lg mt-4 max-w-md">
          {t('footer.tagline')}
        </p>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm order-3 md:order-1">
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-6 order-2">
            <Link to="/pets" className="text-white/40 hover:text-white text-sm transition-colors">{t('footer.links.adopt')}</Link>
            <Link to="/shelters" className="text-white/40 hover:text-white text-sm transition-colors">{t('footer.links.shelters')}</Link>
            <Link to="/about" className="text-white/40 hover:text-white text-sm transition-colors">{t('footer.links.about')}</Link>
            <Link to="/contact" className="text-white/40 hover:text-white text-sm transition-colors">{t('footer.links.contact')}</Link>
          </div>
          <p className="text-white/30 text-sm order-1 md:order-3">
            {t('footer.made_with')}
          </p>
        </div>
      </div>
    </footer>
  );
}
