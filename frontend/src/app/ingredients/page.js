"use client";
import IngredientCard from "../../components/IngredientCard";
import { useState } from "react";

const ingredients = [
    {
        id: 1,
        name: "Tomato",
        image: "/tomato.png",
        substitutes: [
            { name: "Turmeric", price: "$2.00", image: "https://placehold.co/48x48?text=T" },
            { name: "Paprika", price: "$1.50", image: "https://placehold.co/48x48?text-P" }
        ]
    },
    {
        id: 2,
        name: "Milk",
        image: "/milk.png",
        substitutes: [
            { name: "Almond Milk", price: "$3.00", image: "https://placehold.co/48x48?text=A" },
            { name: "Oat Milk", price: "$4.00", image: "https://placehold.co/48x48?text=O" }
        ]
    },
    {
        id: 3,
        name: "Eggs",
        image: "/eggs.png",
        substitutes: "Egg Whites (~$2), Tofu (~$3)"
    }
];


export default function IngredientsPage() {
    const [search, setSearch] = useState("");

    const filteredIngredients = ingredients.filter((item) => 
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <h1 className="text-3xl font-bold text-base-content mb-6">
                Ingredient Glossary
            </h1>

            <input
                type="text"
                placeholder="Search ingredients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered w-full max-w-sm mb-8"
            />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
                {filteredIngredients.map((item) => (
                    <IngredientCard key={item.id} ingredient={item} />
                ))}
            </div>
        </div>
    );
}
