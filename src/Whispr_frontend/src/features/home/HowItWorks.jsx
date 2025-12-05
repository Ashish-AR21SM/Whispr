import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Upload, Lock, MessageSquare, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'Connect & Verify',
      description: 'Connect your wallet anonymously through zero-knowledge proofs',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Submit Evidence',
      description: 'Upload encrypted evidence securely to the blockchain',
      icon: Upload,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Stake Tokens',
      description: 'Stake tokens to validate your report\'s authenticity',
      icon: Lock,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 4,
      title: 'Authority Review',
      description: 'Verified authorities review while maintaining your anonymity',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-secondary-500/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              How It Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A simple, secure, and anonymous process to report crimes and earn rewards.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative group"
              >
                <div className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                  {/* Hover Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Icon Circle */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} p-0.5`}>
                      <div className="w-full h-full bg-[#0c0c1d] rounded-full flex items-center justify-center">
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    {/* Step Number Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {step.id}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>

                  {/* Arrow for mobile/tablet (not last item) */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 text-gray-600">
                      <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
