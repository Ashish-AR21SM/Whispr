import React from 'react';
import { Shield, Github, Linkedin, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative bg-[#080810] pt-20 pb-10 overflow-hidden border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-lg group-hover:bg-primary-500/40 transition-colors duration-300" />
                <Shield className="h-10 w-10 text-primary-500 relative z-10" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">Whispr</span>
            </Link>
            <p className="text-gray-400 text-base leading-relaxed max-w-md">
              Secure, anonymous reporting powered by Internet Computer blockchain technology.
              Your identity remains private while making the world safer.
            </p>
            <div className="flex space-x-4 pt-2">
              {[
                { icon: Github, href: "https://github.com/AR21SM/Whispr" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/21ashishmahajan/" },
                { icon: ExternalLink, href: "https://aoicy-vyaaa-aaaag-aua4a-cai.icp0.io/" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white hover:scale-110 transition-all duration-300 border border-white/5 hover:border-primary-400/50"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="font-bold text-white text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Report Activity', path: '/report' },
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'Authority Access', path: '/authority' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-3">
            <h3 className="font-bold text-white text-lg mb-6">Resources</h3>
            <ul className="space-y-4">
              {[
                { name: 'Documentation', path: 'https://github.com/AR21SM/Whispr', external: true },
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms of Service', path: '/terms-of-service' },
                { name: 'FAQ', path: '/#faq', isHash: true }
              ].map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a 
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                      {link.name}
                    </a>
                  ) : link.isHash ? (
                    <a 
                      href={link.path}
                      className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group"
                      onClick={(e) => {
                        if (window.location.pathname === '/') {
                          e.preventDefault();
                          const element = document.getElementById('faq');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                      {link.name}
                    </a>
                  ) : (
                    <Link 
                      to={link.path}
                      className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Whispr. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Powered by</span>
            <span className="text-white font-medium flex items-center gap-2">
              Internet Computer
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
