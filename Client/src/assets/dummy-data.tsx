import { UploadIcon, VideoIcon, ZapIcon } from "lucide-react";

export const featuresData = [
  {
    icon: <UploadIcon className="w-6 h-6" />,
    title: "Smart Uploads",
    desc: "Drag & drop your assets. We auto-optimize formats and sizes.",
  },
  {
    icon: <ZapIcon className="w-6 h-6" />,
    title: "Instant Generation",
    desc: "Optimized models deliver outputs in seconds with great quality.",
  },
  {
    icon: <VideoIcon className="w-6 h-6" />,
    title: "Video Synthesis",
    desc: "We launch, optimize and continuously improve to drive measurable business growth.",
  },
];

export const plansData = [
  {
    id: "starter",
    name: "Starter",
    price: "$10",
    desc: "Try the platform at no cost.",
    credits: 25,
    features: [
      "25 Credits",
      "Standard quality",
      "No watermark",
      "Slower generation speed",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    desc: "Creators & small teams.",
    credits: 80,
    features: [
      "80 Credits",
      "HD quality",
      "No watermark",
      "Video generations",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "ultra",
    name: "Ultra",
    price: "$99",
    desc: "Scale across teams and agencies.",
    credits: "300",
    features: [
      "300 Credits",
      "FHD quality",
      "No watermark",
      "Fast generation speed",
      "Chat + Email support",
    ],
  },
];

export const faqData = [
  {
    question: "What does your platform do?",
    answer:
      "Our platform uses AI to automatically generate high-converting ads from the product photos you upload. You get ready-to-use creatives for social media, websites, and marketing campaigns in seconds.",
  },
  {
    question: "What kind of product photos can I upload?",
    answer:
      "You can upload any clear product image—physical products, packaging, mockups, or lifestyle shots. The AI works best with high-quality images where the product is clearly visible.",
  },
  {
    question: "How long does it take to generate ads?",
    answer:
      "Most ads are generated within a few seconds. Once you upload your photo and choose your preferences, the AI instantly creates multiple ad variations for you to review and download.",
  },
  {
    question: "Can I customize the ads after they are generated?",
    answer:
      "Yes. You can edit text, colors, layouts, and branding elements to match your style. Our AI gives you a strong starting point, and you stay in full control of the final output.",
  },
];

export const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { name: "Home", url: "#" },
      { name: "Features", url: "#" },
      { name: "Pricing", url: "#" },
      { name: "FAQ", url: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "#" },
      { name: "Terms of Service", url: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { name: "Twitter", url: "#" },
      { name: "LinkedIn", url: "#" },
      { name: "GitHub", url: "#" },
    ],
  },
];
