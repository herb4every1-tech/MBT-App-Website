import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: "Is my blood test data private and secure?",
      answer: "Yes. All uploaded files are encrypted and never shared with third parties. Your health data belongs only to you."
    },
    {
      question: "What languages does MBT support?",
      answer: "MBT supports 66 languages including Arabic, English, French, Spanish, Hindi, Chinese, and many more."
    },
    {
      question: "What type of files can I upload?",
      answer: "You can upload JPEG, PNG images (multiple at once) or a single PDF file of your blood test report."
    },
    {
      question: "Do I need a doctor to use MBT?",
      answer: "No. MBT is designed for anyone to use independently. However, we recommend consulting a healthcare professional for medical decisions."
    },
    {
      question: "What happens when my free limit runs out?",
      answer: "You can upgrade to Pro for $5/month, or enter your own API key to continue using MBT for free."
    }
  ];

  return (
    <section id="faq" className="bg-base">
      <div className="container">
        <div className="text-center animate-on-scroll">
          <h2 className="section-title display-font">Frequently Asked Questions</h2>
        </div>
        
        <div className="faq-container animate-on-scroll delay-1">
          {faqItems.map((item, index) => (
            <div className={`faq-item ${activeFaq === index ? 'active' : ''}`} key={index}>
              <button className="faq-question" onClick={() => toggleFaq(index)}>
                {item.question}
                <span className="faq-icon" style={{ transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <ChevronDown size={24} />
                </span>
              </button>
              <div className="faq-answer" style={{ maxHeight: activeFaq === index ? '200px' : '0' }}>
                <div className="faq-answer-inner">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
