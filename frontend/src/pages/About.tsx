import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiGithub, 
  FiMail, 
  FiCode,
  FiCpu,
  FiFileText,
  FiZap,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiBook,
  FiUsers,
  FiHeart,
  FiStar
} from 'react-icons/fi';

const About: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <FiFileText className="w-6 h-6" />, title: 'Template Upload', desc: 'Upload any DOCX template with formatting' },
    { icon: <FiCpu className="w-6 h-6" />, title: 'AI Generation', desc: 'Local AI with Ollama for privacy' },
    { icon: <FiShield className="w-6 h-6" />, title: 'Privacy First', desc: 'No account needed, session-based' },
    { icon: <FiCheckCircle className="w-6 h-6" />, title: 'Preserve Formatting', desc: 'Keep your template style intact' },
    { icon: <FiZap className="w-6 h-6" />, title: 'Fast Generation', desc: 'Quick document generation' },
    { icon: <FiCode className="w-6 h-6" />, title: 'Open Source', desc: 'Free and open-source software' },
  ];

  const stats = [
    { value: '100%', label: 'Free & Open Source' },
    { value: '0', label: 'Account Required' },
    { value: 'DOCX', label: 'Input Format' },
    { value: 'AI', label: 'Powered by Ollama' },
  ];

  const techStack = [
    { name: 'React.js', color: 'bg-blue-100 text-blue-700' },
    { name: 'TypeScript', color: 'bg-blue-100 text-blue-700' },
    { name: 'Node.js', color: 'bg-green-100 text-green-700' },
    { name: 'Express.js', color: 'bg-gray-100 text-gray-700' },
    { name: 'Tailwind CSS', color: 'bg-cyan-100 text-cyan-700' },
    { name: 'Ollama', color: 'bg-purple-100 text-purple-700' },
    { name: 'Llama 3.2', color: 'bg-orange-100 text-orange-700' },
    { name: 'Vercel', color: 'bg-black/10 text-black' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative pt-12 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About <span className="gradient-text">DocuForge AI</span>
            </h1>
            <p className="text-gray-600 text-lg">
              AI-Powered Document Generation Platform
            </p>
          </motion.div>

          {/* Logo Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
            className="mb-12 flex justify-center"
          >
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-4 gradient-bg rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500"></div>
              
              {/* Main Logo Container */}
              <div className="relative">
                <div className="absolute -inset-2 gradient-bg rounded-3xl animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-2xl border-4 border-white shadow-2xl">
                  <div className="w-40 h-40 md:w-48 md:h-48 gradient-bg rounded-xl flex items-center justify-center">
                    <FiFileText className="w-20 h-20 md:w-24 md:h-24 text-white" />
                  </div>
                  
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">⭐</span>
                  </div>
                  <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="absolute -top-6 -left-6 w-12 h-12 gradient-bg rounded-full flex items-center justify-center border-4 border-white shadow-lg"
              >
                <span className="text-white text-xl">📄</span>
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -bottom-6 -right-6 w-12 h-12 gradient-bg rounded-full flex items-center justify-center border-4 border-white shadow-lg"
              >
                <span className="text-white text-xl">⚡</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200"
          >
            <p className="text-gray-700 font-medium">
              "Upload Template · Generate Content · Preserve Formatting"
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              DocuForge AI was created to simplify and automate the preparation of professional 
              and academic documents. We believe that generating structured documents should be 
              effortless, fast, and accessible to everyone — without compromising on quality or 
              formatting.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="gradient-bg rounded-2xl p-8 text-white mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* About Creator - Small Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-xl flex-shrink-0">
                YN
              </div>
              <div className="text-center md:text-left">
                <div className="inline-block px-3 py-1 gradient-bg rounded-full mb-2">
                  <span className="text-white text-xs font-medium">Creator</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Yash Nagapure</h3>
                <p className="text-gray-600 text-sm">
                  Full Stack Developer & AI Enthusiast
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Passionate about building AI-powered tools that make document generation accessible to everyone.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Built With <span className="gradient-text">Modern Tech</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${tech.color} shadow-sm`}
                >
                  {tech.name}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Project Story */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Story Behind DocuForge AI</h2>
            <p className="text-gray-700 mb-4">
              The idea for DocuForge AI came from a simple observation: students and professionals 
              spend countless hours formatting documents according to institutional templates. 
              While AI writing tools exist, they fail to preserve the original formatting and structure 
              of uploaded templates.
            </p>
            <p className="text-gray-700">
              DocuForge AI bridges this gap by combining template understanding with AI content generation. 
              It extracts the structure and formatting from any DOCX template, generates high-quality content 
              using local AI models (Ollama), and seamlessly inserts it back into the template — preserving 
              every style, heading, and page layout.
            </p>
          </motion.div>

          {/* Open Source CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl">
              <FiGithub className="w-5 h-5" />
              <span className="font-medium">Open Source on GitHub</span>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Star us on GitHub to support the project
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Generate Your Document?</h2>
          <p className="text-gray-600 mb-6">
            Upload your template and let AI do the heavy lifting
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Get Started
            <FiZap className="ml-2" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// Export both ways for flexibility
export default About;
export { About };