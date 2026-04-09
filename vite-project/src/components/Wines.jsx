import { popularWinesData } from "../data/wines";

function Wines() {
  return (
    <section className="py-24 px-10 bg-[#faf7f2]">
      <h2 className="text-4xl font-bold text-center text-[#5b1f1f] mb-16">
        Our Wines
      </h2>

      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {popularWinesData.map((wine, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-2 transition"
          >
            <img
              src={wine.img}
              className="w-full h-[280px] object-cover"
            />
            <div className="p-6">
              <h3 className="font-semibold text-[#5b1f1f]">
                {wine.name}
              </h3>
              <button className="mt-4 w-full bg-[#5b1f1f] text-white py-2 rounded-lg hover:bg-[#7a2a2a] transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Wines;