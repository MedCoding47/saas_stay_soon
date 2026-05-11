import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-deep text-white/40 py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="text-white text-xl font-bold mb-4">
              <span className="text-coral">🐾</span>{' '}
              <span className="text-white">Paw</span>
              <span className="text-coral">Finds</span>
            </h3>
            <p className="text-sm max-w-md leading-relaxed text-white/30">
              Finding loving homes for pets everywhere. We connect pet lovers to give every animal the family they deserve.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-coral transition-colors">Home</Link></li>
              <li><Link to="/pets" className="hover:text-coral transition-colors">Browse Pets</Link></li>
              <li><Link to="/swipe" className="hover:text-coral transition-colors">Swipe Mode</Link></li>
              <li><Link to="/client/register" className="hover:text-coral transition-colors">Register</Link></li>
              <li><Link to="/client/login" className="hover:text-coral transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Contact</h4>
            <ul className="space-y-2 text-sm text-white/30">
              <li>hello@pawfinds.com</li>
              <li>1-800-PAW-FIND</li>
              <li>Global</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-12 pt-8 text-center text-sm text-white/20">
          &copy; {new Date().getFullYear()} PawFinds. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
