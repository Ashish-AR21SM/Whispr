import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="mb-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <motion.button
        className={`w-full text-left p-6 rounded-2xl transition-all duration-300 flex justify-between items-center group ${
          isOpen 
            ? 'bg-gradient-to-r from-primary-900/20 to-secondary-900/20 border border-primary-500/30' 
            : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className={`text-lg font-semibold pr-8 transition-colors ${
          isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'
        }`}>
          {question}
        </h3>
        <div className={`p-2 rounded-full transition-colors ${
          isOpen ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
        }`}>
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 text-gray-400 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "How does anonymous reporting work?",
      answer: "We use Zero-Knowledge Proofs (ZKPs) to verify your report without revealing your identity. This cryptographic method allows us to prove that a report is valid and comes from a real user, without ever storing or transmitting your personal information."
    },
    {
      question: "Is my identity truly safe?",
      answer: "Yes. Your identity is never stored on our servers or the blockchain. We only store the cryptographic proof of your report. Even if our servers were compromised, there would be no personal data to steal."
    },
    {
      question: "How do I earn rewards?",
      answer: "When you submit a report, you can stake tokens to verify its authenticity. If your report is verified by authorities, you earn rewards in our native token. This incentivizes high-quality, truthful reporting."
    },
    {
      question: "What kind of evidence can I upload?",
      answer: "You can upload text descriptions, photos, and videos. All media is encrypted before being stored on the decentralized file system (IPFS), ensuring only authorized parties can view it."
    },
    {
      question: "Who reviews the reports?",
      answer: "Reports are reviewed by verified authorities (police, organizations, etc.) who have been granted access to the platform. They can communicate with you anonymously through our secure chat system if they need more information."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Frequently Asked Questions
          </span>
        </h2>
        <p className="text-xl text-gray-400">
          Everything you need to know about the platform.
        </p>
      </motion.div>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <FAQItem key={index} index={index} {...faq} />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
