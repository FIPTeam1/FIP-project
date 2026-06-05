"use client";
import IngredientCard from "../../components/IngredientCard";
import { useState } from "react";

const ingredients = [
    {
        id: 1,
        name: "Annatto (Achiote)",
        image: "https://placehold.co/400x300?text=Annatto",
        substitutes: [
            { name: "Turmeric", price: "$2.00", image: "https://placehold.co/48x48?text=T" },
            { name: "Paprika", price: "$1.50", image: "https://placehold.co/48x48?text=P" }
        ]
    },
    {
        id: 2,
        name: "Banana Ketchup",
        image: "https://placehold.co/400x300?text=Banana+Ketchup",
        substitutes: [
            { name: "Tomato Ketchup", price: "$1.00", image: "https://placehold.co/48x48?text=TK" },
            { name: "Tamarind Paste", price: "$2.00", image: "https://placehold.co/48x48?text=TP" }
        ]
    },
    {
        id: 3,
        name: "Bay Leaves",
        image: "https://placehold.co/400x300?text=Bay+Leaves",
        substitutes: [
            { name: "Thyme", price: "$1.00", image: "https://placehold.co/48x48?text=Th" },
            { name: "Oregano", price: "$1.00", image: "https://placehold.co/48x48?text=Or" }
        ]
    }
];

export default function IngredientsPage() {
    const [search, setSearch] = useState("");

    const filteredIngredients = ingredients.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-base-100 px-10 py-8">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🥗</span>
                <h1 className="text-3xl font-bold text-base-content">Ingredient Glossary</h1>
            </div>

            {/* Search bar */}
            <label className="input input-bordered flex items-center gap-2 w-full rounded-full mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-50">
                    <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
                </svg>
                <input
                    type="text"
                    placeholder="Search for an ingredient..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="grow bg-transparent outline-none"
                />
            </label>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-6">
                {filteredIngredients.map((item) => (
                    <IngredientCard key={item.id} ingredient={item} />
                ))}
            </div>
        </div>
    );
}