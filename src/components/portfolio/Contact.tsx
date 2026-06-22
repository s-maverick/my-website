// import { useRef, useState } from "react";
// import { motion } from "framer-motion";
// import emailjs from "@emailjs/browser";

// const SERVICE_ID = "portfolio-service";
// const TEMPLATE_ID = "template_vt7y66t";
// const PUBLIC_KEY = "1C5IvYu2-L-SlAnKS";

// export function Contact() {
//   const formRef = useRef<HTMLFormElement>(null);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [msg, setMsg] = useState("");
//   const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!msg.trim() || !email.trim()) return;

//     setStatus("sending");

//     try {
//       await emailjs.send(
//         SERVICE_ID,
//         TEMPLATE_ID,
//         {
//           from_name: name || "Anonymous",
//           name: name || "Anonymous",
//           email: email,
//           message: msg,
//           time: new Date().toLocaleString(),
//         },
//         PUBLIC_KEY
//       );
//       setStatus("sent");
//     } catch (err) {
//       console.error("EmailJS error:", err);
//       setStatus("error");
//     }
//   };

//   return (
//     // <section id="contact" className="mx-auto max-w-4xl px-4 py-24">
//       <section id="contact" className="mx-auto max-w-4xl px-4 py-24 pb-32">
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true }}
//         transition={{ duration: 0.5 }}
//         className="overflow-hidden rounded-xl border border-border bg-surface/40"
//       >
//         <div className="border-b border-border bg-surface px-4 py-2 font-mono text-xs text-muted-foreground">
//           sangam@portfolio:~$ ./contact.sh
//         </div>
//         <div className="p-6 sm:p-10">
//           <p className="font-mono text-sm text-accent">// contact</p>
//           <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
//             got a hard problem? send it.
//           </h2>
//           <p className="mt-3 max-w-xl text-muted-foreground">
//             best for: ml/ai contract work, founding/early eng roles, research
//             collabs, or just a good conversation about data.
//           </p>

//           {status === "sent" ? (
//             <div className="mt-8 rounded-md border border-accent/40 bg-accent/10 p-4 font-mono text-sm text-accent">
//               &gt; message queued. reply eta: &lt;24h.
//             </div>
//           ) : (
//             <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-3">
//               {/* Name */}
//               <div>
//                 <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
//                   name
//                 </label>
//                 <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm transition-colors focus-within:border-accent">
//                   <span className="text-accent">$</span>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="your name"
//                     className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
//                   />
//                 </div>
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
//                   email <span className="text-accent">*</span>
//                 </label>
//                 <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm transition-colors focus-within:border-accent">
//                   <span className="text-accent">$</span>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="you@example.com"
//                     required
//                     className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
//                   />
//                 </div>
//               </div>

//               {/* Message */}
//               <div>
//                 <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
//                   stdin <span className="text-accent">*</span>
//                 </label>
//                 <div className="flex items-start gap-3 rounded-md border border-border bg-background p-3 font-mono text-sm transition-colors focus-within:border-accent">
//                   <span className="pt-0.5 text-accent">$</span>
//                   <textarea
//                     value={msg}
//                     onChange={(e) => setMsg(e.target.value)}
//                     placeholder='echo "hey sangam, i want to..." | mail sangam'
//                     rows={4}
//                     required
//                     className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
//                   />
//                 </div>
//               </div>

//               {status === "error" && (
//                 <p className="font-mono text-xs text-red-400">
//                   &gt; something went wrong. try emailing directly.
//                 </p>
//               )}

//               <button
//                 type="submit"
//                 disabled={status === "sending"}
//                 className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 font-mono text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
//               >
//                 {status === "sending" ? "sending..." : "./send →"}
//               </button>
//             </form>
//           )}

//           <div className="mt-10 grid gap-4 border-t border-border pt-6 font-mono text-sm sm:grid-cols-3">
//             {[
//               { k: "email", v: "hello@sangampatil.com", href: "mailto:hello@sangampatil.com" },
//               { k: "github", v: "s-maverick", href: "https://github.com/s-maverick" },
//               { k: "linkedin", v: "in/sangampatil29", href: "https://www.linkedin.com/in/sangampatil29/" },
//               { k: "calendly", v: "asangampatil/30min", href: "https://calendly.com/asangampatil/30min/" },
//               { k: "scholar.google", v: "sangampatil", href: "https://scholar.google.com/citations?user=-2fwlMQAAAAJ&hl=en/" },
//             ].map((l) => (
//               <a
//                 key={l.k}
//                 href={l.href}
//                 className="group flex items-baseline justify-between rounded-md border border-border bg-background px-3 py-2 transition-colors hover:border-accent"
//               >
//                 <span className="text-muted-foreground">{l.k}/</span>
//                 <span className="text-foreground group-hover:text-accent">
//                   {l.v} ↗
//                 </span>
//               </a>
//             ))}
//           </div>
//         </div>
//       </motion.div>
//     </section>
//   );
// }


import { useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "portfolio-service";
const TEMPLATE_ID = "template_vt7y66t";
const PUBLIC_KEY = "1C5IvYu2-L-SlAnKS";

export function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !email.trim()) return;

    setStatus("sending");

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: name || "Anonymous",
          name: name || "Anonymous",
          email: email,
          message: msg,
          time: new Date().toLocaleString(),
        },
        PUBLIC_KEY
      );
      setStatus("sent");
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="mx-auto max-w-4xl px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-xl border border-border bg-surface/40"
      >
        <div className="border-b border-border bg-surface px-4 py-2 font-mono text-xs text-muted-foreground">
          sangam@portfolio:~$ ./contact.sh
        </div>
        <div className="p-6 sm:p-10">
          <p className="font-mono text-sm text-accent">// contact</p>
          <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
            got a hard problem? send it.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            best for: ml/ai contract work, founding/early eng roles, research
            collabs, or just a good conversation about data.
          </p>

          {status === "sent" ? (
            <div className="mt-8 rounded-md border border-accent/40 bg-accent/10 p-4 font-mono text-sm text-accent">
              &gt; message queued. reply eta: &lt;24h.
            </div>
          ) : (
            <form 
              ref={formRef} 
              onSubmit={handleSubmit} 
              className="mt-8 space-y-3"
              autoComplete="off" // Prevents generic browser autofill clashes
            >
              {/* Name */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  name
                </label>
                <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm transition-colors focus-within:border-accent">
                  <span className="text-accent">$</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="your name"
                    autoComplete="off"
                    data-1p-ignore // Ignores 1Password
                    data-lpignore="true" // Ignores LastPass
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  email <span className="text-accent">*</span>
                </label>
                <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm transition-colors focus-within:border-accent">
                  <span className="text-accent">$</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  stdin <span className="text-accent">*</span>
                </label>
                <div className="flex items-start gap-3 rounded-md border border-border bg-background p-3 font-mono text-sm transition-colors focus-within:border-accent">
                  <span className="pt-0.5 text-accent">$</span>
                  <textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder='echo "hey sangam, i want to..." | mail sangam'
                    rows={4}
                    required
                    data-gramm="false" // Prevents Grammarly injection loops
                    className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="font-mono text-xs text-red-400">
                  &gt; something went wrong. try emailing directly.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 font-mono text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === "sending" ? "sending..." : "./send →"}
              </button>
            </form>
          )}

          <div className="mt-10 grid gap-4 border-t border-border pt-6 font-mono text-sm sm:grid-cols-3">
            {[
              { k: "email", v: "hello@sangampatil.com", href: "mailto:hello@sangampatil.com" },
              { k: "github", v: "s-maverick", href: "https://github.com/s-maverick" },
              { k: "linkedin", v: "in/sangampatil29", href: "https://www.linkedin.com/in/sangampatil29/" },
              { k: "calendly", v: "asangampatil/30min", href: "https://calendly.com/asangampatil/30min/" },
              { k: "scholar.google", v: "sangampatil", href: "https://scholar.google.com/citations?user=-2fwlMQAAAAJ&hl=en/" },
            ].map((l) => (
              <a
                key={l.k}
                href={l.href}
                className="group flex items-baseline justify-between rounded-md border border-border bg-background px-3 py-2 transition-colors hover:border-accent"
              >
                <span className="text-muted-foreground">{l.k}/</span>
                <span className="text-foreground group-hover:text-accent">
                  {l.v} ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}