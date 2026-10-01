import React, { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PageBand from "../components/PageBand";

gsap.registerPlugin(ScrollTrigger);

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// EDIT: your real details
const INFO = [
  { label: "Email", value: "hello@kiqbal.com", href: "mailto:hello@kiqbal.com" },
  { label: "Phone", value: "+91 00000 00000", href: "tel:+910000000000" },
  { label: "Hours", value: "Mon to Sat, 10am to 7pm" },
  { label: "Address", value: "Your store address here" },
];

const TOPICS = ["Order help", "Returns & exchange", "Sizing", "Something else"];

const EMPTY = { name: "", email: "", topic: TOPICS[0], message: "" };

const validate = (v) => {
  const e = {};
  if (v.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email.";
  if (v.message.trim().length < 10) e.message = "Message needs at least 10 characters.";
  return e;
};

const fieldClass = (err) =>
  `w-full border-b bg-transparent py-3 text-base outline-none transition-colors placeholder:text-[#15181a]/35 ${
    err ? "border-red-600" : "border-[#15181a]/30 focus:border-[#15181a]"
  }`;

function Contact() {
  const pageRef = useRef(null);
  const checkRef = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.from(".c-fade", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".c-wrap", start: "top 85%", once: true },
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // success: tick draws itself
  useLayoutEffect(() => {
    if (status !== "sent" || !checkRef.current || reduced()) return;
    const path = checkRef.current;
    const len = path.getTotalLength();
    gsap.fromTo(
      path,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.7, ease: "power2.out", delay: 0.2 },
    );
    gsap.from(".c-done > *", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, [status]);

  const set = (k) => (ev) => {
    setValues((v) => ({ ...v, [k]: ev.target.value }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (status === "sending") return;

    const found = validate(values);
    setErrors(found);
    const keys = Object.keys(found);

    if (keys.length) {
      const el = pageRef.current.querySelector(`[name="${keys[0]}"]`);
      el?.focus();
      if (!reduced()) {
        keys.forEach((k) =>
          gsap.fromTo(
            pageRef.current.querySelector(`[data-field="${k}"]`),
            { x: -8 },
            { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" },
          ),
        );
      }
      return;
    }

    setStatus("sending");
    // TODO: replace this fake delay with your API call / EmailJS / form service
    setTimeout(() => setStatus("sent"), 900);
  };

  const again = () => {
    setValues(EMPTY);
    setErrors({});
    setStatus("idle");
  };

  return (
    <>
      <main ref={pageRef}>
        <PageBand
          kicker="Get in touch"
          words={["Contact", "Us"]}
          sub="Questions about an order or a fit? We reply within a day."
        />

        <section className="bg-[#e7eaea] py-14 text-[#15181a] sm:py-20 lg:py-28">
          <div className="c-wrap mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            {/* Info */}
            <div>
              <h2 className="c-fade text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                Talk to a real person.
              </h2>
              <dl className="mt-8 space-y-6">
                {INFO.map(({ label, value, href }) => (
                  <div key={label} className="c-fade border-t border-[#15181a]/15 pt-4">
                    <dt className="text-sm font-bold uppercase tracking-widest text-[#15181a]/50">{label}</dt>
                    <dd className="mt-1 text-lg sm:text-xl">
                      {href ? (
                        <a
                          href={href}
                          className="group inline-flex items-center gap-2 font-bold transition-opacity hover:opacity-70"
                        >
                          {value}
                          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Form */}
            <div className="c-fade bg-white p-6 sm:p-10">
              {status === "sent" ? (
                <div className="c-done flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#15181a] text-white">
                    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path ref={checkRef} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <h3 className="mt-6 text-3xl font-black tracking-tight">Message sent</h3>
                  <p className="mt-2 max-w-sm text-[#15181a]/60">
                    Thanks {values.name.split(" ")[0]}. We will reply to {values.email} soon.
                  </p>
                  <button
                    type="button"
                    onClick={again}
                    className="mt-7 rounded-full border border-[#15181a]/40 px-6 py-2.5 font-bold transition-colors hover:bg-[#15181a] hover:text-white"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="space-y-7">
                  <div data-field="name">
                    <label htmlFor="c-name" className="text-sm font-bold">Name</label>
                    <input
                      id="c-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={values.name}
                      onChange={set("name")}
                      placeholder="Your name"
                      aria-invalid={!!errors.name}
                      className={fieldClass(errors.name)}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div data-field="email">
                    <label htmlFor="c-email" className="text-sm font-bold">Email</label>
                    <input
                      id="c-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      className={fieldClass(errors.email)}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div data-field="topic">
                    <label htmlFor="c-topic" className="text-sm font-bold">Topic</label>
                    <select
                      id="c-topic"
                      name="topic"
                      value={values.topic}
                      onChange={set("topic")}
                      className={`${fieldClass(false)} cursor-pointer`}
                    >
                      {TOPICS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div data-field="message">
                    <label htmlFor="c-message" className="text-sm font-bold">Message</label>
                    <textarea
                      id="c-message"
                      name="message"
                      rows={5}
                      value={values.message}
                      onChange={set("message")}
                      placeholder="How can we help?"
                      aria-invalid={!!errors.message}
                      className={`${fieldClass(errors.message)} resize-none`}
                    />
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#15181a] py-4 font-bold text-white transition-transform duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 sm:w-auto sm:px-12"
                  >
                    {status === "sending" ? (
                      <span className="flex items-center gap-1.5" aria-label="Sending">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-2 w-2 animate-bounce rounded-full bg-white"
                            style={{ animationDelay: `${i * 0.12}s` }}
                          />
                        ))}
                      </span>
                    ) : (
                      <>
                        Send message
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Contact;