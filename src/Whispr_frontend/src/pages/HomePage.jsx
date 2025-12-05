import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Lock, Upload, Database, BadgeCheck, Trophy, FileLock2, MessageSquare, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import FAQ from '../features/home/FAQ';
import HowItWorks from '../features/home/HowItWorks';
import Background3D from '../components/three/Background3D';

const HomePage = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring",
        stiffness: 50,
        damping: 20
      } 
    },
  };

  return (
    <div className="relative bg-[#080810] min-h-screen overflow-x-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Background3D />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 pt-32 pb-16 z-10">
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 tracking-tight leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 drop-shadow-sm">
              Decentralized
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-400 via-primary-400 to-secondary-400 animate-gradient-x">
              Crime Reporting
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
          >
            Report illegal activities anonymously. Earn rewards. <br className="hidden sm:block" />
            Your identity is protected by <span className="text-primary-400 font-medium">Zero-Knowledge Proofs</span>.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/report">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(103, 40, 255, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full text-white font-bold text-lg overflow-hidden shadow-lg shadow-primary-500/25"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Reporting <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full text-white font-semibold text-lg border border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors"
              onClick={() => {
                const element = document.getElementById('learn-more');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
          onClick={() => {
            const element = document.getElementById('stats-section');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <ChevronDown className="w-8 h-8 text-gray-500 hover:text-white transition-colors" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Incognito Shield', 
                description: 'Zero-knowledge encryption guards every submission.', 
                icon: Shield,
                color: "from-blue-500 to-cyan-500"
              },
              { 
                title: 'Truth Rewarded', 
                description: 'Submit solid evidence and reap powerful token incentives.', 
                icon: Trophy,
                color: "from-yellow-500 to-orange-500"
              },
              { 
                title: 'Timeless Records', 
                description: 'Your evidence lives forever on a secure, decentralized ledger.', 
                icon: FileLock2,
                color: "from-purple-500 to-pink-500"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full glass-card p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors overflow-hidden bg-dark-800/50 backdrop-blur-md">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700`} />
                  
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} p-0.5 mb-6`}>
                      <div className="w-full h-full bg-[#080810] rounded-[10px] flex items-center justify-center">
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{stat.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{stat.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built on the blockchain, our platform offers cutting-edge security and anonymity features.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                title: 'Total Anonymity',
                description: 'Your identity is never revealed at any point in the reporting process through zero-knowledge proofs.',
                icon: Shield
              },
              {
                title: 'Token Staking',
                description: 'Stake tokens to verify report authenticity, with rewards for genuine reports.',
                icon: Lock
              },
              {
                title: 'Evidence Upload',
                description: 'Securely upload text, photos, and videos as evidence to support your report.',
                icon: Upload
              },
              {
                title: 'Authority Verification',
                description: 'Verified authorities review reports without ever knowing the reporter\'s identity.',
                icon: BadgeCheck 
              },
              {
                title: 'Anonymous Chat',
                description: 'Communicate with authorities while maintaining complete anonymity.',
                icon: MessageSquare
              },
              {
                title: 'Blockchain Storage',
                description: 'All data securely stored on the blockchain\'s decentralized network.',
                icon: Database
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                {/* Hover Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-0 group-hover:opacity-75 blur transition duration-500" />
                
                <div className="relative h-full bg-[#0c0c1d] rounded-2xl p-8 border border-white/10 overflow-hidden group-hover:border-transparent transition-colors duration-300">
                  {/* Background Gradient Blob */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-[50px] -mr-10 -mt-10 transition-all duration-500 group-hover:bg-primary-500/20 group-hover:scale-150" />
                  
                  <div className="relative z-10">
                    {/* Icon Container */}
                    <div className="mb-6 inline-block relative">
                      <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary-500/50 group-hover:bg-primary-500/10 transition-all duration-300">
                        <feature.icon className="w-7 h-7 text-primary-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-400 group-hover:to-secondary-400 transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <div className="relative z-10">
        <HowItWorks />
      </div>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10">
        <FAQ />
      </section>
    </div>
  );
};

export default HomePage;
