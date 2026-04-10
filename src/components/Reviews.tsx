import React from "react";
import { Star } from "lucide-react";

interface Review {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: "Tshepo Mokgosi",
    role: "Operations Director",
    company: "Logistics Hub Bots",
    content: "Kitso Nexus Advisory completely transformed our warehousing workflows. The ERP implementation was seamless, and the ongoing support has been exceptional.",
    rating: 5,
    image: "/reviews/face1.png"
  },
  {
    id: 2,
    name: "Amina Ndlovu",
    role: "Finance Manager",
    company: "TechAfrica Solutions",
    content: "Our financial reporting time was cut in half after their custom Studio work. They truly understand business processes before attempting to digitize them.",
    rating: 5,
    image: "/reviews/face2.png"
  },
  {
    id: 3,
    name: "Kagiso Phiri",
    role: "CEO",
    company: "Phiri Manufacturing",
    content: "Data migration is usually a nightmare, but the team at Kitso Nexus handled it with precision. We haven't lost a single record.",
    rating: 5,
    image: "/reviews/face3.png"
  },
  {
    id: 4,
    name: "Lesego Peloetletse",
    role: "HR Head",
    company: "Retail Group RSA",
    content: "The training they provided was hands-on and incredibly effective. Our team adopted the new system much faster than we anticipated.",
    rating: 5,
    image: "/reviews/face4.png"
  }
];

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="flex-shrink-0 w-[350px] md:w-[400px] bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-teal/20 transition-all duration-300">
    <div className="flex items-center gap-4 mb-4">
      <img 
        src={review.image} 
        alt={review.name} 
        className="w-14 h-14 rounded-full object-cover border-2 border-teal object-top"
      />
      <div>
        <h4 className="text-primary-foreground font-bold text-lg leading-tight">{review.name}</h4>
        <p className="text-teal text-sm">{review.role}</p>
        <p className="text-muted-foreground text-xs">{review.company}</p>
      </div>
    </div>
    <div className="flex gap-1 mb-3">
      {[...Array(review.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
      ))}
    </div>
    <p className="text-primary-foreground/80 text-sm leading-relaxed italic">
      "{review.content}"
    </p>
  </div>
);

const Reviews = () => {
  // Duplicate reviews to create a seamless infinite loop
  const duplicatedReviews = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];

  return (
    <section className="py-20 relative overflow-hidden bg-navy">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10 mb-12">
        <p className="section-label mb-2 text-center text-teal">Testimonials</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-foreground">
          Trusted by Industry Leaders
        </h2>
      </div>

      <div className="relative flex overflow-hidden w-full group">
        {/* Fading Edges */}
        <div className="absolute top-0 left-0 h-full w-24 md:w-48 bg-gradient-to-r from-navy to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-24 md:w-48 bg-gradient-to-l from-navy to-transparent z-10 pointer-events-none" />

        <div className="flex gap-6 min-w-max animate-marquee-right hover:[animation-play-state:paused] px-3">
          {duplicatedReviews.map((review, idx) => (
            <ReviewCard key={`${review.id}-${idx}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
