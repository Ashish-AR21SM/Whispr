import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText } from 'lucide-react';

const TermsOfServicePage = () => {
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
          <FileText className="h-8 w-8 text-primary-400 mr-3" />
          <h1 className="text-4xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-gray-400">Last Updated: April 25, 2025</p>
      </motion.div>

      {/* Terms Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-300 mb-6">
          Welcome to Whispr, a decentralized anonymous reporting platform. By accessing or using our platform, 
          you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree 
          with any of these terms, you are prohibited from using or accessing this platform.
        </p>
        <p className="text-gray-300 mb-6">
          Whispr operates on the Internet Computer blockchain and provides services for anonymous reporting of illegal activities. 
          These Terms of Service govern your use of our platform, including any content, functionality, and services offered.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">2. User Eligibility</h2>
        <p className="text-gray-300 mb-6">
          You must be at least 18 years old to use the Whispr platform. By using our platform, you represent and warrant that:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>You are at least 18 years of age</li>
          <li>You have the legal capacity to enter into these Terms</li>
          <li>You are not prohibited from using blockchain services under the laws of your jurisdiction</li>
          <li>You will use the platform in accordance with these Terms</li>
        </ul>
        <p className="text-gray-300 mb-6">
          Whispr reserves the right to terminate or suspend access to users who are found to be underage or in violation of these eligibility requirements.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">3. Wallet Connection and Digital Identity</h2>
        <p className="text-gray-300 mb-6">
          To use Whispr's reporting features, you must connect a compatible blockchain wallet. By connecting your wallet, you agree to:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Provide a valid Internet Computer or compatible wallet</li>
          <li>Maintain sole control and responsibility for your private keys</li>
          <li>Accept that Whispr cannot recover lost wallets, private keys, or seed phrases</li>
          <li>Assume all risks associated with digital wallet use</li>
        </ul>
        <p className="text-gray-300 mb-6">
          Your blockchain address (Principal ID) serves as your pseudonymous identity on the platform. You acknowledge that while Whispr maintains anonymity safeguards, blockchain transactions are inherently public and may contain information that could potentially be linked to your identity through external means.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">4. Report Submission and Token Staking</h2>
        <p className="text-gray-300 mb-6">
          When submitting reports through our platform, you agree to:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Provide truthful and accurate information to the best of your knowledge</li>
          <li>Stake the required minimum number of tokens with each report</li>
          <li>Accept that staked tokens may be forfeited if a report is found to be false or misleading</li>
          <li>Understand that report verification is at the sole discretion of authorized authorities</li>
          <li>Acknowledge that rewards for verified reports are issued automatically and irreversibly</li>
        </ul>
        <p className="text-gray-300 mb-6">
          Token staking is a fundamental mechanism of the platform designed to deter false reporting. You understand that staking carries financial risk, including potential loss of staked tokens.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">5. Prohibited Activities</h2>
        <p className="text-gray-300 mb-6">
          You agree not to use the Whispr platform to:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Submit knowingly false or malicious reports</li>
          <li>Target innocent individuals or organizations with unfounded accusations</li>
          <li>Attempt to manipulate the reward system or verification process</li>
          <li>Disclose your identity as a reporter to gain personal advantage</li>
          <li>Harass, threaten, or intimidate others through the anonymous reporting system</li>
          <li>Attempt to compromise the anonymity protections of the platform</li>
          <li>Engage in any illegal activity through the platform</li>
          <li>Interfere with or disrupt the platform's technical infrastructure</li>
        </ul>
        <p className="text-gray-300 mb-6">
          Violation of these prohibitions may result in forfeiture of staked tokens, termination of platform access, and potential legal action where applicable.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
        <p className="text-gray-300 mb-6">
          The Whispr platform, including its code, interface, design, and functionality, is the intellectual property of Whispr. You agree not to:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Copy or reproduce any part of our platform without authorization</li>
          <li>Modify, create derivative works, or reverse engineer the platform</li>
          <li>Remove any copyright or proprietary notices from the platform</li>
        </ul>
        <p className="text-gray-300 mb-6">
          By submitting a report, you grant Whispr a perpetual, irrevocable, royalty-free, worldwide license to store and display the content of your report to relevant authorities for verification purposes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="glass-card p-8 rounded-xl mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">7. Anonymous Communications</h2>
        <p className="text-gray-300 mb-6">
          When using the anonymous chat feature to communicate with authorities, you agree to:
        </p>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
          <li>Communicate respectfully and constructively</li>
          <li>Provide additional information as requested by authorities to aid verification</li>
          <li>Not use the chat system for harassment or sending inappropriate content</li>
          <li>Understand that all communications are encrypted but permanently stored on the blockchain</li>
          <li>Accept that authorities can view the full chat history of a report</li>
        </ul>
        <p className="text-gray-300 mb-6">
          You acknowledge that while your identity remains protected, the content of your communications is visible to authorized authorities and is immutably recorded on the blockchain.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="space-y-8"
      >
        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">8. Disclaimer of Warranties</h2>
          <p className="text-gray-300 mb-6">
            THE WHISPR PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="text-gray-300 mb-6">
            We do not guarantee that:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
            <li>The platform will be available at all times or function without interruptions or errors</li>
            <li>Reports will be verified within a specific timeframe or at all</li>
            <li>Rewards will be issued for all verified reports</li>
            <li>Blockchain transactions will process within a specific timeframe</li>
            <li>The anonymity protections cannot be compromised by external factors</li>
          </ul>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-300 mb-6">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WHISPR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
            <li>Loss of profits, tokens, or digital assets</li>
            <li>Personal injury resulting from platform use</li>
            <li>Loss of anonymity due to external factors</li>
            <li>Unauthorized access to your wallet or account</li>
            <li>Any action taken by authorities based on your reports</li>
            <li>Forfeiture of staked tokens due to report rejection</li>
          </ul>
          <p className="text-gray-300 mb-6">
            By using the platform, you expressly agree that your use is at your sole risk and that you bear full responsibility for any consequences that may arise from your use.
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">10. Blockchain Immutability</h2>
          <p className="text-gray-300 mb-6">
            You acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1">
            <li>All data submitted to the blockchain is immutable and cannot be deleted</li>
            <li>Reports and communications cannot be retracted or altered once submitted</li>
            <li>Smart contracts execute automatically and without human intervention</li>
            <li>The platform operates on a decentralized network outside direct control of any single entity</li>
          </ul>
          <p className="text-gray-300 mb-6">
            You expressly accept the inherent technological limitations of blockchain technology, including finality of transactions and the inability to recover lost tokens or modify submitted data.
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">11. Modifications to Terms</h2>
          <p className="text-gray-300 mb-6">
            Whispr reserves the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the platform. Your continued use of Whispr after changes constitutes acceptance of the modified terms.
          </p>
          <p className="text-gray-300 mb-6">
            We will make reasonable efforts to notify users of significant changes through the platform interface, but it is your responsibility to periodically review these Terms for updates.
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>
          <p className="text-gray-300 mb-6">
            These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which Whispr is established, without regard to its conflict of law provisions.
          </p>
          <p className="text-gray-300 mb-6">
            You agree that any dispute arising from these Terms or your use of the platform shall be resolved through binding arbitration in accordance with the rules of the jurisdiction in which Whispr is established.
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">13. Contact Information</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions about these Terms of Service, please contact us at:
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
              <a href="mailto:terms@whispr.app" className="text-secondary-400 hover:underline">
                terms@whispr.app
              </a>
            </li>
          </ul>
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

export default TermsOfServicePage;