import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, CheckSquare, MessageSquare, Database } from 'lucide-react';

const Feature = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card rounded-2xl p-6 hover:shadow-glow transition-shadow duration-300"
    >
      <div className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Shield className="text-primary-500 h-6 w-6" />,
      title: "Total Anonymity",
      description: "Your identity is never revealed at any point in the reporting process through zero-knowledge proofs."
    },
    {
      icon: <Lock className="text-secondary-500 h-6 w-6" />,
      title: "Token Staking",
      description: "Stake tokens to verify report authenticity, with rewards for genuine reports."
    },
    {
      icon: <FileText className="text-accent-blue h-6 w-6" />,
      title: "Evidence Upload",
      description: "Securely upload text, photos, and videos as evidence to support your report."
    },
    {
      icon: <CheckSquare className="text-accent-teal h-6 w-6" />,
      title: "Authority Verification",
      description: "Verified authorities review reports without ever knowing the reporter's identity."
    },
    {
      icon: <MessageSquare className="text-primary-400 h-6 w-6" />,
      title: "Anonymous Chat",
      description: "Communicate with authorities while maintaining complete anonymity."
    },
    {
      icon: <Database className="text-secondary-400 h-6 w-6" />,
      title: "Blockchain Storage",
      description: "All data securely stored on the blockchain's decentralized network."
    }
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-700/30 to-dark-900" />
      <div className="absolute top-40 -left-40 w-80 h-80 bg-primary-900/20 rounded-full filter blur-3xl" />
      <div className="absolute bottom-40 -right-40 w-80 h-80 bg-secondary-900/20 rounded-full filter blur-3xl" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 text-gradient">Powerful Features</h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "100px" }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"
          />
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built on the blockchain, our platform offers cutting-edge security and anonymity features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;