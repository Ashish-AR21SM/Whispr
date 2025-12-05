import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';

const PrivacyPolicyPage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-primary-400 mr-3" />
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-gray-400">Last Updated: April 25, 2025</p>
      </motion.div>

      {/* Policy Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
        <p className="text-gray-300 mb-6">
          Welcome to Whispr, a decentralized anonymous reporting platform powered by Internet Computer blockchain technology. 
          This Privacy Policy explains how we collect, use, store, and protect information when you use our service.
        </p>
        <p className="text-gray-300 mb-6">
          At Whispr, we are committed to protecting your privacy and ensuring your anonymity when reporting illegal activities. 
          This policy has been designed to help you understand our practices regarding your data.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">2. Information Collection</h2>
        
        <h3 className="text-xl font-bold mb-2">2.1 Blockchain-Based Anonymity</h3>
        <p className="text-gray-300 mb-4">
          Whispr operates on the Internet Computer blockchain, which allows us to provide reporting services without collecting 
          personally identifiable information. When you use Whispr:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li><strong>We do not collect</strong> your name, email address, physical address, phone number, or other direct identifiers</li>
          <li><strong>We do not track</strong> your IP address for identification purposes</li>
          <li><strong>We do not link</strong> your principal ID (blockchain identity) to your personal identity</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-2">2.2 Information You Provide</h3>
        <p className="text-gray-300 mb-4">
          When submitting a report, you may provide:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Report content (title, description, category)</li>
          <li>Evidence files (images, documents, videos)</li>
          <li>Location data (if voluntarily provided)</li>
          <li>Date and time of incidents</li>
          <li>Token stake amounts</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-2">2.3 Technical Information</h3>
        <p className="text-gray-300 mb-4">
          We automatically collect certain technical information to maintain the functionality of the service:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
          <li>Internet Computer principal ID (anonymous blockchain identifier)</li>
          <li>Interactions with smart contracts (timestamps, transaction data)</li>
          <li>Technical error logs for system maintenance</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">3. Data Storage and Security</h2>
        
        <h3 className="text-xl font-bold mb-2">3.1 Blockchain Storage</h3>
        <p className="text-gray-300 mb-4">
          All report data is stored on the Internet Computer blockchain, which provides:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Immutable record-keeping</li>
          <li>Decentralized storage across multiple nodes</li>
          <li>End-to-end encryption of sensitive content</li>
          <li>Tamper-proof evidence preservation</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-2">3.2 Security Measures</h3>
        <p className="text-gray-300 mb-4">
          We implement several security measures to protect your anonymity and data:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
          <li>Zero-knowledge proofs to verify report authenticity without revealing identity</li>
          <li>End-to-end encryption for all communications</li>
          <li>Secure canister design with formal verification</li>
          <li>Regular security audits of smart contracts</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">4. Use of Information</h2>
        
        <h3 className="text-xl font-bold mb-2">4.1 Primary Uses</h3>
        <p className="text-gray-300 mb-4">
          Information you provide is used solely for:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Processing and verifying reports</li>
          <li>Enabling secure communication between reporters and authorities</li>
          <li>Managing token staking and rewards</li>
          <li>Maintaining the integrity of the reporting system</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-2">4.2 Token Transactions</h3>
        <p className="text-gray-300 mb-4">
          When you stake tokens with a report:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
          <li>Your principal ID is used to process blockchain transactions</li>
          <li>Token movements are recorded on-chain in an anonymous manner</li>
          <li>Smart contracts automatically process token returns and rewards</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">5. Information Sharing</h2>
        
        <h3 className="text-xl font-bold mb-2">5.1 Authority Access</h3>
        <p className="text-gray-300 mb-4">
          Verified authorities may access:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Report content and evidence files</li>
          <li>Anonymous chat communications</li>
          <li>Report metadata (category, date, time, location)</li>
        </ul>
        
        <p className="text-gray-300 mb-4">
          Authorities <strong>cannot access</strong>:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Your personal identity</li>
          <li>Your principal ID</li>
          <li>Your wallet information</li>
          <li>Any identifying technical data</li>
        </ul>
        
        <h3 className="text-xl font-bold mb-2">5.2 Third Parties</h3>
        <p className="text-gray-300 mb-4">
          We do not sell, trade, or transfer your information to third parties. The decentralized nature of the Internet Computer blockchain means that:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
          <li>No central entity controls all user data</li>
          <li>Smart contracts execute autonomously based on predefined conditions</li>
          <li>Data access is governed by cryptographic permissions</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">6. User Rights and Control</h2>
        <p className="text-gray-300 mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
          <li>Remain anonymous while using the Whispr platform</li>
          <li>Access reports you've submitted (via your connected wallet)</li>
          <li>Receive automatic reward payments for verified reports</li>
          <li>Disconnect your wallet at any time</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
        <p className="text-gray-300 mb-4">
          Report data is stored permanently on the Internet Computer blockchain for:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-1">
          <li>Maintaining an immutable record of reports</li>
          <li>Ensuring long-term accountability</li>
          <li>Providing historical evidence when needed</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="space-y-8"
      >
        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
          <p className="text-gray-300 mb-4">
            Whispr services are not intended for use by individuals under the age of 18. We do not knowingly collect information from children.
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">9. Changes to Privacy Policy</h2>
          <p className="text-gray-300 mb-4">
            We may update this Privacy Policy from time to time. Changes will be effective when posted on this page, with the updated "Last Updated" date.
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
          <p className="text-gray-300 mb-6">
            If you have questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <ul className="space-y-2 text-gray-300">
            <li>
              <span className="text-primary-400">GitHub:</span>{" "}
              <a href="https://github.com/AR21SM/Whispr" className="text-secondary-400 hover:underline">
                https://github.com/AR21SM/Whispr
              </a>
            </li>
            <li>
              <span className="text-primary-400">Email:</span>{" "}
              <a href="mailto:privacy@whispr.app" className="text-secondary-400 hover:underline">
                privacy@whispr.app
              </a>
            </li>
          </ul>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">11. Blockchain-Specific Disclosures</h2>
          <p className="text-gray-300 mb-4">
            Please be aware that:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
            <li>Blockchain transactions are irreversible and immutable</li>
            <li>Smart contract execution is automated and cannot be modified after deployment</li>
            <li>Token transfers are publicly visible on the blockchain (though anonymized)</li>
            <li>Principal IDs are pseudonymous but could potentially be linked to identity if you reveal it elsewhere</li>
          </ul>
          <p className="text-gray-300">
            By using Whispr, you acknowledge the inherent properties of blockchain technology and consent to the storage of report data on the Internet Computer blockchain.
          </p>
        </div>
      </motion.div>

      {/* Security Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-12 flex items-center justify-center"
      >
        <div className="flex items-center bg-dark-800/70 rounded-full px-6 py-3">
          <Shield className="h-5 w-5 text-primary-400 mr-3" />
          <p className="text-sm text-gray-300">Secured by Internet Computer Blockchain Technology</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicyPage;