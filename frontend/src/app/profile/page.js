import Image from "next/image";

// Mock data based on https://github.com/FIPTeam1/FIP-project/issues/5
const recipes = [
  {
    title: "Cebuano Pork Sisig",
    location: "Cebu, PH",
    time: "2h 30m",
    serves: "Serves 4",
    image: "/sisig1.jpg", 
  },
  {
    title: "Cebu Style Steamed Rice",
    location: "Cebu, PH",
    time: "2h 30m",
    serves: "Serves 4",
    image: "/steamed-rice.jpg",
  },
  {
    title: "Puso",
    location: "Cebu, PH",
    time: "2h 30m",
    serves: "Serves 4",
    image: "/puso.jpg",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-start">
      {/* SIDEBAR: justify-between keeps arrow at top and gear at bottom */}
      <aside className="w-16 bg-gray-100 flex flex-col items-center justify-between pt-6 pb-6 shadow-[4px_0_10px_-3px_rgba(0,0,0,0.1),0_4px_10px_-3px_rgba(0,0,0,0.1)] h-[80vh] h-[90vh]">
        
        {/* TOP: The arrow will stay here */}
        <div className="text-4xl text-blue-400 font-bold cursor-pointer hover:scale-110 transition-transform">
          »
        </div>
        
        {/* BOTTOM: These will stay at the very end of the 80vh bar */}
        <div className="flex flex-col gap-8">
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300" />
          <div className="text-blue-400 text-xl text-center cursor-pointer hover:rotate-90 transition-transform">⚙️</div>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-16 max-w-6xl mx-auto">
        <header className="mb-12">
          <button className="text-xs font-bold text-black mb-6 uppercase tracking-widest hover:text-gray-600 transition-colors">
            ← Back to Recipe
          </button>
          
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="relative w-25 h-25 overflow-hidden rounded-full border-2 border-white shadow-sm">
                <Image src="/manny.jpg" alt="Kasey" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black leading-tight">Kasey Banawa</h1>
                <p className="text-lg font-medium text-black">@kbanawa</p>
                <p className="text-sm text-black mt-2 max-w-sm leading-relaxed">
                  Sharing my Lola's recipes with the world! 🍲 <br />
                  Authentic Cebuano recipes, based in Los Angeles 📍
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end font-bold text-lg">
                5.0 <span className="text-black">★</span>
              </div>
              <p className="text-xs text-black font-semibold">Average Rating</p>
            </div>
          </div>
        </header>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recipes.map((recipe, index) => (
            <RecipeCard key={index} {...recipe} />
          ))}
        </div>
      </main>
    </div>
  );
}

function RecipeCard({ title, location, time, serves, image }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="relative h-50 w-full">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-black text-black-900 mb-4">{title}</h3>
        <div className="flex flex-row justify-between items-center gap-8">
          <Badge color="bg-[#bbecfd] text-black font-medium" icon="📍" label={location} />
          <Badge color="bg-[#ffe09c] text-black font-medium" icon="🕒" label={time} />
          <Badge color="bg-[#ffcbcb] text-black font-medium" icon="👥" label={serves} />
        </div>
      </div>
    </div>
  );
}

function Badge({ color, icon, label }) {
  return (
    <span className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${color}`}>
      <span>{icon}</span>
      {label}
    </span>
  );
}