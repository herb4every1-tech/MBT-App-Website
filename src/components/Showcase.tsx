export default function Showcase() {
  return (
    <section id="showcase" className="bg-soft">
      <div className="container text-center">
        <div className="animate-on-scroll">
          <h2 className="section-title display-font">See MBT in Action</h2>
          <p className="section-subtext mx-auto">A clean, intuitive interface designed for everyone</p>
        </div>
        <img src="https://lh3.googleusercontent.com/d/1tDDdfztSjTag2gmePpWrJ7PqVwJOJjLu" alt="MBT App Preview" className="showcase-image animate-on-scroll delay-1" loading="lazy" decoding="async" />
      </div>
    </section>
  );
}
