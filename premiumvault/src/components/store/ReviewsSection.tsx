const reviews = [
  {
    stars: 5,
    text: "\"Incredible service! Got my Netflix account within 30 seconds of payment. It's been working flawlessly for 3 months now. Best deal I've ever found online.\"",
    initials: "JD",
    name: "James D.",
    date: "March 15, 2024",
  },
  {
    stars: 5,
    text: "\"Support team replaced my account within 5 minutes when I had an issue. Absolutely amazing customer service. Already ordered 4 different accounts from them!\"",
    initials: "SK",
    name: "Sarah K.",
    date: "April 2, 2024",
  },
  {
    stars: 5,
    text: "\"Fast delivery, working accounts, and unbeatable prices. I've been a customer for 6 months and never had a single problem. Highly recommended to everyone!\"",
    initials: "MR",
    name: "Michael R.",
    date: "April 18, 2024",
  },
];

export function ReviewsSection() {
  return (
    <section id="reviews" className="py-16 px-6 md:px-10 max-w-[1200px] mx-auto">
      <h2 className="font-rajdhani text-center text-3xl font-bold mb-10 text-white">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.name}
            className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 transition-all hover:border-white/[0.2] hover:-translate-y-1"
          >
            <div className="text-orange-400 text-lg mb-3.5">
              {"★".repeat(review.stars)}
            </div>
            <p className="text-sm text-gray-400 mb-5 leading-7">{review.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center font-bold text-sm text-white">
                {review.initials}
              </div>
              <div>
                <div className="font-semibold text-sm text-white">{review.name}</div>
                <div className="text-xs text-gray-400">{review.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
