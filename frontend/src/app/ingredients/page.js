"use client";
import IngredientCard from "../../components/IngredientCard";
import { useState } from "react";

const ingredients = [
    {
        id: 1,
        name: "Tomato",
        image: "/tomato.png",
        substitutes: "Cherry Tomato (~$2), Canned Tomato (~$1)"
    },
    {
        id: 2,
        name: "Milk",
        image: "/milk.png",
        substitutes: "Almond Milk (~$3), Oat Milk (~$4)"
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
        <div style={{ padding: "20px "}}>
            <h1>Ingredient Glossary</h1>

            <input
                type="text"
                placeholder="Search ingredients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    marginTop: "10px",
                    padding: "8px",
                    width: "100%",
                    maxWidth: "300px"
                }}
            />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "16px",
                    marginTop: "20px"
                }}
            >
                {filteredIngredients.map((item) => (
                    <IngredientCard key={item.id} ingredient={item} />
                ))}
            </div>
        </div>
    );
}
