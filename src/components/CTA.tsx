import React from 'react';

export default function CTA({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <section className="py-12">
      <div className="max-w-[1100px] mx-auto px-6 w-full">
        <div className="bg-accent-primary text-white text-center rounded-[24px] py-20 px-10 mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold display-font mb-6">Ready to understand your health?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">Join thousands of users who are taking control of their medical data with our AI-powered analysis.</p>
          <a href="#" onClick={(e) => { e.preventDefault(); onLoginClick(); }} className="btn bg-white text-accent-primary hover:bg-gray-100 px-8 py-4 text-lg shadow-xl">Start Your Free Analysis</a>
        </div>
      </div>
    </section>
  );
}
